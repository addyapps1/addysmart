const SupportTicketsPresentation = ({ supportticket, onOpenTicket }) => {
  return (
    <section className="flex justify-center items-center mx-6 mb-14">
      <div className="bg-[var(--container-bg-color)] text-[var(--highlight-color)] cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6 rounded-md">
        <div className="flex-grow min-h-16 flex justify-center flex-col items-center rounded-md">
          <h2 className="w-full text-center font-semibold">
            Title: {supportticket.issueTitle}
          </h2>
          <p className="text-sm text-gray-500">
            Description: {supportticket.issueDescription}
          </p>
          <p className="text-sm text-gray-500">
            Priority: {supportticket.priority}
          </p>
        </div>
        <div className="flex-grow min-h-16 flex justify-center flex-col items-center rounded-md">
          <h2 className="w-full text-center font-semibold">
            status: {supportticket.status}
          </h2>
          <p className="text-sm text-gray-500">
             category:{supportticket.categor}
          </p>
          <p className="text-sm text-gray-500">
            created: {supportticket.created}
          </p>
        </div>
        <div className="w-full flex justify-center items-center rounded-md">
          <div
            onClick={onOpenTicket}
            role="button"
            aria-label="Open support ticket"
            className="w-full flex-grow min-h-16 flex justify-center items-center rounded-md bg-[var(--accent-color)] max-w-[400px] cursor-pointer hover:bg-opacity-90"
          >
            Read
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportTicketsPresentation;
