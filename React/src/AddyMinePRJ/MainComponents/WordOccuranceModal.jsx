import { useContext, useState } from "react";
import Swal from "sweetalert2";
import { MineContext } from "../MineContext/MineContext";
// import "./Modal.css"; // Add styles for the modal here if needed
import { BeatLoader } from "react-spinners";
import { AuthContext } from "../../AuthContext/AuthContext";
import closeIcon from "../../Assets/line-md--menu-to-close-transition.svg";
import { useNavigate } from "react-router-dom";

const WordOccuranceModal = ({ videoId, isOpen, onClose }) => {
  const { logout, getStoredToken } = useContext(AuthContext);

  const { API_MineBase_url, setTasks, setBalance } = useContext(MineContext);
  const [watchcode1, setWatchcode1] = useState("");
  const [watchcode2, setWatchcode2] = useState("");
  const [watchcode3, setWatchcode3] = useState("");
  const [watchcode4, setWatchcode4] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  // Validate the form (you can add any additional validation logic if needed)
  const validateForm = () => {
    if (
      !watchcode1.trim() ||
      !watchcode2.trim() ||
      !watchcode3.trim() ||
      !watchcode4.trim()
    ) {
      Swal.fire("all fiels cannot be empty");
      return false;
    }

    if (
      isNaN(+watchcode1.trim()) ||
      isNaN(+watchcode2.trim()) ||
      isNaN(+watchcode3.trim()) ||
      isNaN(+watchcode4.trim())
    ) {
      Swal.fire("Values must be a number");
      return false;
    }


    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Form validation
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("WatchcodeModal videoId", videoId);

      const response = await fetch(
        `${API_MineBase_url()}api/a/v1.00/coinmining`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${getStoredToken()}`,
          },
          body: JSON.stringify({
            watchcode1,
            watchcode2,
            watchcode3,
            watchcode4,
            videoId,
          }),
        }
      );

      const data = await response.json();
      console.log("data", data);

      if (data && data.alreadydone) {
        Swal.fire(`${data.alreadydone}`);
      } else if (data && data.data) {
        Swal.fire(`${data.data.newCoins} shares mined successfully`);

        // Update tasks with 'justViewed' for the matching videoId
        setTasks((prevTasks) => {
          console.log("Previous tasks:", prevTasks);
          const updatedTasks = prevTasks.map((task) =>
            task._id === videoId // Check if videoId matches task _id
              ? { ...task, justViewed: true }
              : task
          );
          console.log("Updated tasks:", updatedTasks);
          setWatchcode1("");
          setWatchcode2("");
          setWatchcode3("");
          setWatchcode4("");
          return updatedTasks;
        });

        // Update balance or any other UI state
        setBalance(data.data);

        // Close the modal
        onClose(); // Call the close function passed from the parent
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      console.error("Shares mining failed:", error);
      Swal.fire("Shares mining failed");
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
      {/* Modal */}
      {isOpen && (
        <div
          id="watchcodeModal"
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center max-h-[95vh] overflow-y-scroll z-[101] my-5"
        >
          <div className="bg-white dark:bg-black rounded-lg shadow-lg p-6 w-full max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">
                Word Occurrence
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

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hidden VideoId Field */}
              <input type="hidden" name="video-id" value={videoId} />

              {/* Watchcode Textarea */}
              <div>
                <textarea
                  id="watchcode1"
                  name="watchcode1"
                  rows="1"
                  placeholder="answer 1st challenge"
                  value={watchcode1}
                  onChange={(e) => setWatchcode1(e.target.value)}
                  required
                  className=" my-1 w-full p-3 text-[var(--secondary-text-color)] border border-gray-300 dark:border-gray-700 rounded focus:ring focus:ring-highlight-color transition duration-200 ease-in-out"
                ></textarea>
              </div>

              <div>
                <textarea
                  id="watchcode2"
                  name="watchcode2"
                  rows="1"
                  placeholder="answer 2nd challenge"
                  value={watchcode2}
                  onChange={(e) => setWatchcode2(e.target.value)}
                  required
                  className=" my-1 w-full p-3 text-[var(--secondary-text-color)] border border-gray-300 dark:border-gray-700 rounded focus:ring focus:ring-highlight-color transition duration-200 ease-in-out"
                ></textarea>
              </div>

              <div>
                <textarea
                  id="watchcode3"
                  name="watchcode3"
                  rows="1"
                  placeholder="answer 3rd challenge"
                  value={watchcode3}
                  onChange={(e) => setWatchcode3(e.target.value)}
                  required
                  className="w-full p-3 text-[var(--secondary-text-color)] border border-gray-300 dark:border-gray-700 rounded focus:ring focus:ring-highlight-color transition duration-200 ease-in-out"
                ></textarea>
              </div>

              <div>
                <textarea
                  id="watchcode4"
                  name="watchcode4"
                  rows="1"
                  placeholder="answer 4th challenge"
                  value={watchcode4}
                  onChange={(e) => setWatchcode4(e.target.value)}
                  required
                  className=" my-1 w-full p-3 text-[var(--secondary-text-color)] border border-gray-300 dark:border-gray-700 rounded focus:ring focus:ring-highlight-color transition duration-200 ease-in-out"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-highlight-color hover:bg-secondary-accent-color text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out"
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? (
                    <BeatLoader color="#ffffff" loading={isLoading} size={8} />
                  ) : (
                    "Mine"
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

export default WordOccuranceModal;
