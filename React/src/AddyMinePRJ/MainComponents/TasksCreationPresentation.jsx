import { BeatLoader } from "react-spinners";

const TasksCreationPresentation = ({
  task,
  openModal,
  isObjLoading,
  handleDeleteTask,
}) => {
  return (
    <section className="flex justify-center items-center mx-6 mb-14 ">
      <div className="bg-[var(--container-bg-color)] text-[var(--highlight-color)] flex max-w-[850px] flex-wrap w-full justify-center gap-6 rounded-md">
        <div className="w-full min-h-16 px-4 flex flex-col justify-center items-center rounded-md">
          {task.instructions}
          <a
            href={task.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded text-center"
          >
            {task.link}
          </a>

          <p>{task.challengeType}</p>
          <p>{task.vidStatus}</p>
        </div>
        <div
          onClick={() => openModal(task._id)}
          className="bg-[var(--accent-color)] basis-80 px-4 flex-grow min-h-16 flex justify-center items-center rounded-md cursor-pointer"
        >
          Edit
        </div>
        <div
          key={task._id}
          onClick={() => handleDeleteTask(task._id)}
          className="bg-[var(--warning-color)] text-[var(--warning-color2)] basis-80 px-4 flex-grow min-h-16 flex justify-center items-center rounded-md cursor-pointer"
        >
          {isObjLoading[task._id] ? (
            <BeatLoader
              color="#ffffff"
              loading={isObjLoading[task._id]}
              size={8}
            />
          ) : (
            "Delete"
          )}
        </div>
      </div>
    </section>
  );
};

export default TasksCreationPresentation;
