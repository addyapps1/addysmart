import { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { MineContext } from "../MineContext/MineContext";
import { BeatLoader } from "react-spinners";
import { AuthContext } from "../../AuthContext/AuthContext";
import closeIcon from "../../Assets/line-md--menu-to-close-transition.svg";
import { useNavigate } from "react-router-dom";

const EditTaskModal = ({ taskID, isOpen, onClose }) => {
  const { API_E_VideoBase_url, tasks, setTasks } = useContext(MineContext);
  const { logout, getStoredToken } = useContext(AuthContext);

  // Find task by taskID
  const task = tasks.find((task) => task._id === taskID);

  // Initialize form state
  const [link, setLink] = useState(task?.link || "");
  const [watchcode, setWatchcode] = useState(task?.watchcode || "");
  const [instructions, setInstructions] = useState(task?.instructions || "");
  const [isLoading, setIsLoading] = useState(false);
  const [challengeType, setChallengeType] = useState(task?.challengeType || "");
  const [vidStatus, setVidStatus] = useState(task?.vidStatus || "");
  const navigate = useNavigate();
  
  // Update state when the task changes
  useEffect(() => {
    setLink(task?.link || "");
    setWatchcode(task?.watchcode || "");
    setInstructions(task?.instructions || "");
  }, [task]);

  // Form validation
  const validateForm = () => {
    if (!link.trim()) {
      Swal.fire("Link cannot be empty");
      return false;
    }
    if (!watchcode.trim()) {
      Swal.fire("Watchcode cannot be empty");
      return false;
    }
    if (!instructions.trim()) {
      Swal.fire("Instructions cannot be empty");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate the form
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // API call to update the task
      let URL = `${API_E_VideoBase_url}api/a/v1.00/evideo/${task._id}`;
      const response = await fetch(URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getStoredToken()}`,
        },
        body: JSON.stringify({
          link,
          watchcode,
          instructions,
          challengeType,
          vidStatus,
        }),
      });

      const data = await response.json();

      if (data && data.data) {
        Swal.fire(`Task updated successfully`);
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === task._id ? data.data : t))
        );
        onClose(); // Close modal after success
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      console.error("Task update failed:", error);
      Swal.fire("Task update failed");
      if (error == "Error: jwt expired") {
        Swal.fire("Your login expired, please login again.");
        logout();
        navigate(`/`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          id="watchcodeModal"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center max-h-[100vh] overflow-y-scroll z-[101] py-5"
        >
          <div className="bg-white dark:bg-black rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">
                Edit Task Details
              </h2>

              <div>
                <img
                  src={closeIcon}
                  alt={"profileImage"}
                  className="pagelogo w-6 aspect-square rounded-full mx-auto"
                  title="close modal"
                  onClick={onClose}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="link"
                  className="block font-bold text-primary mb-2"
                >
                  Link
                </label>
                <input
                  type="text"
                  id="link"
                  name="link"
                  placeholder="Enter the link here"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required
                  className="w-full p-3 border text-[var(--secondary-text-color)] border-gray-300 dark:border-gray-700 rounded focus:ring transition duration-200 ease-in-out"
                />
              </div>

              <div>
                <label
                  htmlFor="watchcode"
                  className="block font-bold text-primary mb-2"
                >
                  Watchcode
                </label>
                <textarea
                  id="watchcode"
                  name="watchcode"
                  rows="2"
                  placeholder="Enter the watchcode here"
                  value={watchcode}
                  onChange={(e) => setWatchcode(e.target.value)}
                  required
                  className="w-full p-3 border text-[var(--secondary-text-color)] border-gray-300 dark:border-gray-700 rounded focus:ring transition duration-200 ease-in-out"
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="instructions"
                  className="block font-bold text-primary mb-2"
                >
                  Instructions
                </label>
                <textarea
                  id="instructions"
                  name="instructions"
                  rows="2"
                  placeholder="Enter the instructions here"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  required
                  className="w-full p-3 border text-[var(--secondary-text-color)] border-gray-300 dark:border-gray-700 rounded focus:ring transition duration-200 ease-in-out"
                ></textarea>
              </div>

              <div>
                <label
                  htmlFor="chellenetype"
                  className="block font-bold text-primary mb-2"
                >
                  Chellenetype
                </label>
                <select
                  id="chellenetype"
                  name="chellenetype"
                  value={challengeType}
                  onChange={(e) => setChallengeType(e.target.value)}
                  required
                  className="w-full p-3 text-[var(--secondary-text-color)] border border-gray-300 dark:border-gray-700 rounded focus:ring focus:ring-highlight-color transition duration-200 ease-in-out"
                >
                  <option value="" disabled>
                    Select a Chellenetype
                  </option>
                  <option value="watchcode">WatchCode</option>
                  <option value="wordoccurrence">WordOccurrence</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="videostatus"
                  className="block font-bold text-primary mb-2"
                >
                  Videostatus
                </label>
                <select
                  id="videostatus"
                  name="videostatus"
                  value={vidStatus}
                  onChange={(e) => setVidStatus(e.target.value)}
                  required
                  className="w-full p-3 text-[var(--secondary-text-color)] border border-gray-300 dark:border-gray-700 rounded focus:ring focus:ring-highlight-color transition duration-200 ease-in-out"
                >
                  <option value="" disabled>
                    Select a Videostatus
                  </option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-highlight-color hover:bg-secondary-accent-color text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <BeatLoader color="#ffffff" loading={isLoading} size={8} />
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EditTaskModal;
