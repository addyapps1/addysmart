import React, { useState, useEffect, useContext, useRef } from "react";
import { MineContext } from "../../../MineContext/MineContext";
import { AuthContext } from "../../../../AuthContext/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";

const SupportUser = () => {
  const { isLoggedIn, getStoredUserObj, getStoredToken, setPageTitle } =
    useContext(AuthContext);
  const { API_supportBase_url } = useContext(MineContext);

  const [user, setUser] = useState({});
  const [userInput, setUserInput] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState({});

  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setUser(getStoredUserObj());
  }, [getStoredUserObj]);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate]);



  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [chat]);

  const handleUserInput = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_supportBase_url}api/a/v1.00/chatbot/minebot`,
        { message: userInput, conversationState },
        { headers: { Authorization: `Bearer ${getStoredToken()}` } }
      );

      setChat((prevChat) => [
        ...prevChat,
        { user: userInput, bot: response.data.reply },
      ]);

      setConversationState(response.data.conversationState);
      setUserInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    // If Control (or Cmd) + Enter is pressed, add a newline instead of sending
    if ((e.key === "Enter" && e.ctrlKey) || (e.key === "Enter" && e.metaKey)) {
      e.preventDefault();
      setUserInput((prevInput) => prevInput + "\n");
    } else if (e.key === "Enter" && !isLoading) {
      // Otherwise, send the message
      handleUserInput();
    }
  };

  return (
    <div className="supportcontainer flex flex-col h-full relative p-0">
      <div className="flex-grow overflow-y-auto p-4 mb-1">
        <p className="text-green-600">
          <strong>Addy:</strong> Hi, I am Addy. How may I help you?
        </p>
        {chat.map((chatItem, index) => (
          <div key={index} className="mb-2">
            <p className="text-blue-600">
              <strong>{user?.firstName?.toUpperCase() || "User"}:</strong>{" "}
              {chatItem.user}
            </p>
            <p className="text-green-600">
              <strong>Addy:</strong> {chatItem.bot}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center mt-2">
            <BeatLoader color="#000000" loading={isLoading} size={8} />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="shadow-md p-0">
        <div className="flex justify-center items-center p-0">
          <textarea
            ref={inputRef}
            className="flex-grow h-12 basis-72 m-0 p-2 border text-[var(--secondary-text-color)] rounded-md"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Addy anything..."
            disabled={isLoading}
            rows={2}
          />
          <button
            className="flex-grow-1 p-2 h-12 bg-blue-500 text-white rounded-md"
            onClick={handleUserInput}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportUser;
