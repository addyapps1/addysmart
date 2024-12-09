const TasksPresentation = ({ task, onWatchCodeClick, alertViewed }) => {
  return (
    <section className="flex justify-center items-center mx-6 mb-14">
      <div className="bg-[var(--container-bg-color)] text-[var(--highlight-color)] cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6 rounded-md">
        <div
          key={task._id}
          className="w-full px-4 flex-grow min-h-16 flex justify-center flex-col items-center rounded-md"
        >
          <h2 className="w-full text-center">INSTRUCTIONS</h2>
          <b>{task.instructions}</b>
        </div>
        <div
          onClick={task.justViewed ? alertViewed : onWatchCodeClick}
          className="basis-80 flex-grow min-h-16  flex justify-center items-center rounded-md bg-[var(--accent-color)] max-w-[400px]"
        >
          <a
            href={task.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`button h-full flex justify-center items-center ${
              task.justViewed ? "text-[var(--bad)]" : "text-[var(--good)]"
            } w-full rounded text-center`}
          >
            {task.justViewed ? "Done" : "Do Task"}
          </a>
        </div>
      </div>
    </section>
  );
};

export default TasksPresentation;
