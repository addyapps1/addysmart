import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext/AuthContext";
import { MineContext } from "../MineContext/MineContext";
import TasksCreationPresentation from "./TasksCreationPresentation";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import Pagination from "../../Pagination";
import MineHelmet from "../MineHelmet";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";

const ManageTasks = () => {
  const {
    logout,
    isLoggedIn,
    getStoredUserObj,
    getStoredToken,
    setPageTitle,
    APP_NAME,
  } = useContext(AuthContext);

  const { API_E_VideoBase_url, tasks, setTasks } = useContext(MineContext);

  const [isLoading, setIsLoading] = useState(true);
  const [isObjLoading, setIsOjjLoading] = useState({}); // dynamic loading state
  const [User, setUser] = useState({});
  const [videoId, setVideoId] = useState(null); // For editing task
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Create modal state
  const [currentPage, setCurrentPage] = useState(1);
  const [RecordsEstimate, setRecordsEstimate] = useState(0);
  const itemsPerPage = 12;
  let tempFetchData = useRef();

  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    setPageTitle("MANAGE TASKS");
  }, [setPageTitle]);

  useEffect(() => {
    setUser(getStoredUserObj());
  }, [getStoredUserObj]);

  // Fetch tasks data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const URL = `${API_E_VideoBase_url()}api/a/v1.00/evideo?page=${currentPage}&limit=${itemsPerPage}`;
      const response = await fetch(URL, {
        method: "GET",
        credentials: "include", // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getStoredToken()}`,
        },
      });

      const tasksData = await response.json();

      if (tasksData.status === "success" && tasksData.data) {
        console.log("tasksData", tasksData);
        setTasks(tasksData.data);
        if (tasksData.RecordsEstimate) {
          setRecordsEstimate(tasksData.RecordsEstimate);
        }
      } else {
        throw new Error(tasksData.message);
      }
    } catch (error) {
      if (
        error == "Error: jwt expired" ||
        error == "Error: Device mismatch. Please login again"
      ) {
        Swal.fire("Your login expired, please login again.");
        logout();
        navigate(`/`);
      }
      console.error("Request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  tempFetchData.current = fetchData;
  useEffect(() => {
    tempFetchData.current();
  }, [currentPage]); // Trigger fetchData when currentPage changes

  // Optional useEffect to track loading state changes
  useEffect(() => {
    console.log("isObjLoading", isObjLoading);
  }, [isObjLoading]);

  // Handle task delete with confirmation
  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (confirmDelete) {
      setIsOjjLoading((prevLoading) => ({ ...prevLoading, [taskId]: true }));

      try {
        const URL = `${API_E_VideoBase_url()}api/a/v1.00/evideo/${taskId}`;
        const response = await fetch(URL, {
          method: "DELETE",
          credentials: "include", // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${getStoredToken()}`,
          },
        });

        if (response.ok) {
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task._id !== taskId)
          );
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
      } catch (error) {
        if (
          error == "Error: jwt expired" ||
          error == "Error: Device mismatch. Please login again"
        ) {
          Swal.fire("Your login expired, please login again.");
          logout();
        }
        console.error("Delete request failed:", error);
      } finally {
        setIsOjjLoading((prevLoading) => ({ ...prevLoading, [taskId]: false }));
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open modals
  const openEditModal = (videoId) => {
    setVideoId(videoId);
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  // Close modals
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setVideoId(null);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <MineHelmet
        pageDescription={`Welcome to  ${APP_NAME.toLowerCase()} mining tasks page where admins manage and create tasks`}
        pageName="addymine/managetasks"
        pageTitle={`${APP_NAME} - Manage Mining Tasks`}
      />

      <section className="flex justify-center items-center mx-6 mb-6 mt-10">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          <div className="bg-[var(--container-bg-color)] w-full flex-grow min-h-16 flex-col flex justify-center items-center rounded-md">
            <h1 className="w-full text-center mt-3 text-[var(--highlight-color)] text-2xl">
              {`${User.userTitle?.toUpperCase() || ""} 
              ${User.firstName?.toUpperCase() || ""} 
              ${User.lastName?.toUpperCase() || ""}`}
            </h1>
            <p className="w-full text-center m-2">
              <b
                onClick={openCreateModal}
                className=" text-white bg-[var(--accent-color)] p-1 px-2 rounded cursor-pointer"
              >
                Create Task
              </b>
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <BeatLoader color="#ffffff" loading={isLoading} size={8} />
        </div>
      ) : tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task._id} className="task-item">
            <TasksCreationPresentation
              task={task}
              isObjLoading={isObjLoading}
              handleDeleteTask={handleDeleteTask}
              openModal={openEditModal}
            />
          </div>
        ))
      ) : (
        <p className="text-center">No task found.</p>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />

      {/* Edit Task Modal */}
      <EditTaskModal
        taskID={videoId}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
      />

      {RecordsEstimate > itemsPerPage && (
        <Pagination
          totalPages={Math.ceil(RecordsEstimate / itemsPerPage)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
};

export default ManageTasks;
