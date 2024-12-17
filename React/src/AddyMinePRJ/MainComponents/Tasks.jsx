import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext/AuthContext";
import { MineContext } from "../MineContext/MineContext";
import TasksPresentation from "./TasksPresentation";
import WatchcodeModal from "./WatchcodeModal";
import WordOccuranceModal from "./WordOccuranceModal";

import Swal from "sweetalert2";
import MineHelmet from "../MineHelmet";
import { BeatLoader } from "react-spinners";
import WatchCodeImg1 from "../../Assets/watchCodesIMG/WatchCode1.png";
import WatchCodeImg2 from "../../Assets/watchCodesIMG/WatchCode2.png";
import WatchCodeImg3 from "../../Assets/watchCodesIMG/WatchCode3.png";
import WatchCodeImg4 from "../../Assets/watchCodesIMG/WatchCode4.png";



const Tasks = () => {
  const {
    logout,
    isLoggedIn,
    getStoredUserObj,
    getStoredToken,
    setPageTitle,
    APP_NAME,
  } = useContext(AuthContext);

  const { API_E_VideoBase_url, tasks, setTasks } = useContext(MineContext);

  const [isLoading, setIsLoading] = useState(false);
  const [User, setUser] = useState({});
  const [videoId, setVideoId] = useState(null); // State to store the videoId for the modal
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [challengeType, setChallengeType] = useState("");
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    setPageTitle("TASKS");
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
      const URL1 = `${API_E_VideoBase_url()}api/a/v1.00/evideo/tasks`;

      const response = await fetch(URL1, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getStoredToken()}`,
        },
      });

      const tasksData = await response.json();
      if (tasksData.status === "success" && tasksData.data) {
        console.log("tasksData.data", tasksData.data);
        setTasks(tasksData.data);
      } else {
        throw new Error(tasksData.message);
      }
    } catch (error) {
      console.log("error", error);
      if (error == "Error: jwt expired") {
        Swal.fire("Your login expired, please login again.");
        logout()
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
  const openModal = (videoId, challengeType) => {
    setVideoId(videoId);
    setChallengeType(challengeType);
    setIsModalOpen(true);
    console.log("setIsModalOpen(true);", videoId);
  };

  // Close modal function
  const closeModal = () => {
    setIsModalOpen(false);
    setVideoId(null); // Reset videoId when closing modal
  };

  const alertViewed = (e) => {
    e.preventDefault();
    Swal.fire(
      "Sorry, you have already completed this task within the last 24 hours."
    );
  };

  const reloadTask = () => {
    fetchData();
  };
  // Navigation function
  // const goto = (path) => {
  //   navigate(`./${path}`);
  // };

  // const toggleModal = () => {
  //   setIsModalOpen((prev) => !prev); // Toggle modal state (true <-> false)
  // };

  return (
    <>
      <MineHelmet
        pageDescription={`Welcome to ${APP_NAME.toLowerCase()} mining tasks page where you see all your available tasks`}
        pageName="addymine/tasks"
        pageTitle={`${APP_NAME} - Mining tasks`}
      />
      <section className="flex justify-center items-center mx-6 mb-6 mt-10">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          <div className="bg-[var(--container-bg-color)] w-full flex-grow min-h-16 flex-col flex justify-center items-center rounded-md">
            <h1 className="w-full text-center mt-5 m-0 text-[var(--highlight-color)] text-2xl">
              {`${User.userTitle?.toUpperCase() || "ff"} 
              ${User.firstName?.toUpperCase() || "ff"} 
              ${User.lastName?.toUpperCase() || "ff"}`}
              {User.isVIP && <em className="text-[var(--good)]"> (VIP)</em>}
            </h1>
            <p className="w-full text-center m-2">
              <b
                onClick={reloadTask}
                className=" text-white bg-[var(--accent-color)] p-1 px-2 rounded cursor-pointer"
              >
                Reload Task
              </b>
            </p>
          </div>
        </div>
      </section>
      <section className="flex justify-center items-center mx-6 mb-14 mt-2">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          <div className="bg-[var(--container-bg-color)] w-full flex-grow min-h-16 flex-col flex justify-center items-center rounded-md">
            <em className="w-full text-left mt-5 m-0 p-4 text-[var(--highlight-color)] text-2xl">
              Don&rsquo;t forget to subscribe or follow, like, and share this
              video! Your engagement helps the algorithm recommend and show this
              video to more people, increasing the monetary value of our shares.
              The more people outside our community see this video, the more
              money we make together. Let&rsquo;s spread the word and grow our
              success!
            </em>
            <p className="w-full text-center mb-2">
              {/* Mine real shares and get paid every month */}
            </p>
          </div>
        </div>
      </section>
      {/*  */}
      <section className="flex flex-col justify-center items-center flex-wrap mx-6 mb-14">
        <div className="cards-container bg-[var(--container-bg-color)] flex max-w-[850px] flex-wrap w-full justify-center rounded-md gap-6">
          <div className="basis-80 flex-grow flex gap-6 justify-center flex-wrap mb-6">
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md p-0 m-0">
              <img
                src={WatchCodeImg1}
                alt="WatchCodeImg1"
                className=" w-full aspect-square rounded-md p-1"
              />
            </div>
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md p-0 m-0">
              <img
                src={WatchCodeImg2}
                alt="WatchCodeImg2"
                className=" w-full aspect-square rounded-md p-1"
              />
            </div>
          </div>

          <div className="basis-80 flex-grow flex gap-6 justify-center flex-wrap mb-6">
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md p-0 m-0">
              <img
                src={WatchCodeImg3}
                alt="WatchCodeImg3"
                className=" w-full aspect-square rounded-md p-1"
              />
            </div>
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md p-0 m-0">
              <img
                src={WatchCodeImg4}
                alt="WatchCodeImg4"
                className=" w-full aspect-square rounded-md p-1"
              />
            </div>
          </div>
          <div className=" w-full m-0 p-2">
            <h2 className="text-[var(--highlight-color)] text-center font-bold text-lg mb-2">
              NOTICE!
            </h2>
            The challenges are hidden within the videos. Look for boxes similar
            to those pointed out by arrows in the provided images above. Count
            how many times the word on the left side of the challenge box, which
            has a blue background, appears on the right side of the challenge
            box. Return to this page and provide your answer in the space
            provided. Use the input field that appears when you click on "Do
            Task" to enter your answer. Each task may include additional
            instructions, so be sure to read them carefully.
          </div>
        </div>
      </section>
      {/*  */}
      {/* Triggering the modal */}
      {isLoading ? (
        <div className="flex justify-center items-center my-10">
          <BeatLoader color="#ffffff" loading={isLoading} size={8} />
        </div>
      ) : tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task._id} className="task-item">
            <TasksPresentation
              task={task}
              alertViewed={alertViewed}
              onWatchCodeClick={() => openModal(task._id, task.challengeType)} // Open modal with videoId
            />
          </div>
        ))
      ) : (
        <p className="text-center my-10 text-[var(--highlight-color)]">
          Sorry, there are no tasks available right now. Please check back
          later.
        </p>
      )}
      {/* Watchcode Modal */}

      {challengeType === "watchcode" ? (
        <WatchcodeModal
          videoId={videoId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      ) : challengeType === "wordoccurrence" ? (
        <WordOccuranceModal
          videoId={videoId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      ) : (
        ""
      )}
    </>
  );
};

export default Tasks;
