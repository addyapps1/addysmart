import SupportFileRenderer from "../SupportFileRenderer";

const SupportTicketChatPresentation = ({ communicationLogs }) => {
  return (
    <div className="w-[95%] flex justify-center items-center flex-wrap">
      {communicationLogs.map((chatItem, index) => (
        <div
          key={index}
          className={`w-full m-0 p-3 rounded-md ${
            chatItem.sentBy === "user"
              ? "flex justify-end"
              : "flex justify-start"
          }`}
        >
          <div
            className={`p-2 rounded-md max-w-[550px] flex-wrap flex justify-start ${
              chatItem.sentBy === "user"
                ? "text-[var(--senderchattext)] bg-[var(--senderchatbg)]"
                : "text-[var(--recieverchattext)] bg-[var(--recieverchatbg)]"
            } `}
          >
            <p
              className={` flex justify-start  ${
                chatItem.sentBy === "user"
                  ? "text-[var(--senderchattext)] bg-[var(--senderchatbg)]"
                  : "text-[var(--recieverchattext)] bg-[var(--recieverchatbg)]"
              }`}
            >
              {/* <strong>{chatItem.sentBy === "user" ? "User" : "Agent"}:</strong>{" "} */}
              {chatItem.message}
            </p>
            {chatItem.files?.length > 0 && (
              <SupportFileRenderer data={chatItem.files} />
            )}
            <p className="text-xs text-gray-500 mt-1 w-full  text-right">
              {new Date(chatItem.sentAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupportTicketChatPresentation;
