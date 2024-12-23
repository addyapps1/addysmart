import userProfile from "../../Assets/lucide--circle-user-round.svg";

const ReferralsPresentation = ({ rUser, viewReferral }) => {
  // Check if profileImg exists and if filePath is defined
  let userProfilePath = userProfile;
  if (rUser?.profileImg?.filePath) {
    userProfilePath = rUser.profileImg.filePath;
  }

  console.log("rUser", rUser);

  return (
    <section className="flex justify-center items-center mx-6 mb-6">
      <div className="bg-[var(--container-bg-color)] text-[var(--highlight-color)] cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6 rounded-md">
        <div
          className="w-full flex-grow min-h-16 flex justify-between items-center rounded-md p-4"
          onClick={() => viewReferral(rUser)}
        >
          <b className=" flex-grow">
            {`${rUser?.referred?.userTitle?.toUpperCase() || ""} 
              ${rUser?.referred?.firstName?.toUpperCase() || ""} 
              ${rUser?.referred?.middleName?.toUpperCase() || ""} 
              ${rUser?.referred?.lastName?.toUpperCase() || ""}`}
          </b>

          <img
            src={userProfilePath}
            alt="profileImage"
            className=" w-10 aspect-square rounded-full mx-auto"
            title="profile image"
          />
        </div>
      </div>
    </section>
  );
};

export default ReferralsPresentation;
