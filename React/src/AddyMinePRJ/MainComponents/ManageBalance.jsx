import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext/AuthContext";
import { MineContext } from "../MineContext/MineContext";
import TasksPresentation from "./TasksPresentation";
import WatchcodeModal from "./WatchcodeModal";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";

const ManageBalance = () => {
  const { logout, isLoggedIn, getStoredUserObj, getStoredToken, setPageTitle } =
    useContext(AuthContext);
  const { API_MineBase_url, tasks, setTasks, balance, setBalance } =
    useContext(MineContext);

  const [isLoading, setIsLoading] = useState(false);
  const [User, setUser] = useState({});
  const [videoId, setVideoId] = useState(null); // State to store the videoId for the modal
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    setPageTitle("MAMAGEBALANCE");
    return () => {};
  }, [setPageTitle]);

  // Get stored user info
  useEffect(() => {
    setUser(getStoredUserObj());
  }, [getStoredUserObj]);

  // Fetch tasks data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const URL1 = `${API_MineBase_url}api/a/v1.00/evideo/tasks`;

      const response = await fetch(URL1, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getStoredToken()}`,
        },
      });

      const tasksData = await response.json();
      if (tasksData.status === "success" && tasksData.data) {
        setTasks(tasksData.data);
      } else {
        throw new Error(tasksData.message);
      }
    } catch (error) {
      if (error == "Error: jwt expired") {
        Swal.fire("Your login expired, please login again.");
        logout();
        navigate(`/`);
      }
      console.error("Request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger data fetching on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Open modal function
  const openModal = (videoId) => {
    setVideoId(videoId);
    setIsModalOpen(true);
  };

  // Close modal function
  const closeModal = () => {
    setIsModalOpen(false);
    setVideoId(null); // Reset videoId when closing modal
  };

  // // Navigation function
  // const goto = (path) => {
  //   navigate(`./${path}`);
  // };

  return (
    <>
      <section className="flex justify-center items-center mx-6 mb-6 mt-10">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          <div className="bg-[var(--container-bg-color)] w-full flex-grow min-h-16 flex-col flex justify-center items-center rounded-md">
            <h1 className="w-full text-center mt-5 m-0 text-[var(--highlight-color)] text-2xl">
              {`${User.userTitle?.toUpperCase() || "ff"} 
              ${User.firstName?.toUpperCase() || "ff"} 
              ${User.lastName?.toUpperCase() || "ff"}`}
            </h1>
            <p className="w-full text-center mb-2 px-3">
              Mine real shares and get paid every month{" "}
            </p>
          </div>
        </div>
      </section>

      {/* Triggering the modal */}
      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <BeatLoader color="#ffffff" loading={isLoading} size={8} />
        </div>
      ) : tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task._id} className="task-item">
            <TasksPresentation
              title={task.title}
              description={task.description}
              image={task.image}
              onWatchCodeClick={() => openModal(task.videoId)} // Open modal with videoId
            />
          </div>
        ))
      ) : (
        <p className="text-center">No record yet.</p>
      )}

      {/* Watchcode Modal */}
      <WatchcodeModal
        videoId={videoId}
        isOpen={isModalOpen}
        onClose={closeModal} // Pass close function to modal
      />
    </>
  );
};

export default ManageBalance;
