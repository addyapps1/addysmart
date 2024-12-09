import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MineContext } from "../../../MineContext/MineContext";
import { AuthContext } from "../../../../AuthContext/AuthContext";
import SupportTicketChatPresentation from "./SupportTicketChatPresentationAdmin";

const SupportTicketChatAdmin = () => {
  const { isLoggedIn, getStoredUserObj, getStoredToken, setPageTitle } =
    useContext(AuthContext);
  const { API_supportBase_url } = useContext(MineContext);
  const { ticketID } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [isSendding, setIsSendding] = useState(false);
  const [User, setUser] = useState({});
  const [CurrentTicket, setCurrentTicket] = useState({});
  const [userInput, setUserInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const inputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    setPageTitle("TICKET CHAT(A)");
    setUser(getStoredUserObj());
    inputRef.current.focus();
    fetchData(); // Fetch data when component mounts
  }, [getStoredUserObj, setPageTitle]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const URL = `${API_supportBase_url}api/a/v1.00/supportticket/${ticketID}`;
      const response = await fetch(URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getStoredToken()}`,
        },
      });
      const data = await response.json();
      if (data.status === "success" && data.data) {
          setCurrentTicket(data.data);
          console.log("data.data", data.data);
        setUserInput(""); // Clear user input after fetching data
        setSelectedFiles([]); // Clear selected files
      } else {
        throw new Error(data.message || "Failed to fetch support tickets.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      // Consider displaying an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUserInput = async () => {
    if (!userInput.trim() && selectedFiles.length === 0) return;

    setIsLoading(true);
   setIsSendding(true)
    const formData = new FormData();
    formData.append("message", userInput);
    formData.append("sentBy", "agent");

    selectedFiles.forEach((file) => {
      formData.append(`files`, file);
    });

    try {
      const response = await fetch(
        `${API_supportBase_url}api/a/v1.00/supportticket/message/${ticketID}`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${getStoredToken()}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log("result", result);
        if (result.status === "success") {
          console.log("result.data", result.data);
        setCurrentTicket((prev) => ({
          ...prev,
          communicationLogs: [...prev.communicationLogs, result.data],
        }));
        setUserInput("");
        setSelectedFiles([]);
        inputRef.current.focus();
      } else {
        throw new Error(result.message || "Failed to send message.");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Consider displaying an error message to the user here
    } finally {
      setIsLoading(false);
      setIsSendding(false)
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  };

  return (
    <section className="flex justify-center items-center mx-6 mb-3">
      <div className="cards-container max-w-[850px] flex-wrap w-full justify-center bg-[var(--container-bg-color)] rounded-md">
        <div className="w-full flex justify-center items-center rounded-md flex-wrap">
          {CurrentTicket ? (
            <>
              <div
                role="button"
                aria-label="Open support ticket"
                className="w-full flex-grow min-h-7 flex justify-center items-center rounded-md cursor-pointer hover:bg-opacity-90 font-bold"
              >
                {CurrentTicket.issueTitle}
              </div>
              <div className="bg-[var(--container-bg-color)] flex-grow min-h-16 flex justify-center items-center rounded-md">
                {CurrentTicket.category}
              </div>
              <div className="bg-[var(--container-bg-color)] flex-grow min-h-16 flex justify-center items-center rounded-md">
                {CurrentTicket.priority}
              </div>
              <div className="bg-[var(--container-bg-color)] flex-grow min-h-16 flex justify-center items-center rounded-md">
                {CurrentTicket.status}
              </div>
              <div className="w-full h-[90vh] overflow-y-auto bg-[var(--background-color)] m-1 flex-grow min-h-7 flex justify-center items-start rounded-md cursor-pointer hover:bg-opacity-90">
                {CurrentTicket.communicationLogs &&
                CurrentTicket.communicationLogs.length ? (
                  <SupportTicketChatPresentation
                    userId={User._id}
                    communicationLogs={CurrentTicket.communicationLogs.reverse()} // Fixed reverse method
                  />
                ) : (
                  <p className="text-center">No communication logs</p>
                )}
              </div>
            </>
          ) : (
            <p>Loading ticket details...</p>
          )}
          <div className="min-h-0 w-full flex justify-center items-start m-1 p-1 bg-gray-200 rounded-md">
            <label className="m-0 p-2 h-12 bg-[var(--accent-color)] text-white flex justify-center items-center rounded-md cursor-pointer button">
              Files
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <textarea
              ref={inputRef}
              className="flex-grow h-12 basis-72 m-0 p-2 border text-[var(--secondary-text-color)] rounded-md"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Respond to user"
              disabled={isLoading} // Disable input while loading
            />
            <button
              className="flex-grow-1 p-2 m-0 h-12 font-bold bg-[var(--accent-color)] text-white rounded-md"
              onClick={handleUserInput}
              disabled={isLoading}
            >
              {(isSendding ? "Sending..." : "Send")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportTicketChatAdmin;
