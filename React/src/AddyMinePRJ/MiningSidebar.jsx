import { useContext, useEffect, useState } from "react";
import { MineContext } from "./MineContext/MineContext";
import { AuthContext } from "../AuthContext/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import userProfile from "../Assets/lucide--circle-user-round.svg";
// import userProfile from "./Assets/lucide--circle-user-round.svg";
import MiningSidebarAdminNav from "./MiningSidebarAdminNav";
// import useClickOutside from "../CustomHooks/useClickOutside";
import useClickOutside from "../CustomHooks/useClickOutside";

const MiningSidebar = () => {
  const {
    getStoredUserObj,
    isLoggedIn,
    logout,
    profileImagePath,

  } = useContext(AuthContext);
  const {
    isOpen,
    openUserSupportModal,
    sideBarRef,
    closeSidebar,
    navCloseSideBarRef,
  } = useContext(MineContext);
  const navigate = useNavigate();

  const [alignment, setAlignment] = useState(() => {
    return localStorage.getItem("sidebarAlignment") || "right";
  });

  const [User, setUser] = useState({});
  useEffect(() => {
    setUser(getStoredUserObj());
  }, [getStoredUserObj]);

  const handleLogout = (event) => {
    event.preventDefault();
    logout();
    navigate("/");
  };

  let userProfilePath = userProfile;
  if (profileImagePath() !== undefined) {
    userProfilePath = profileImagePath();
  }

  const handleAlignmentChange = (e) => {
    const newAlignment = e.target.value;
    setAlignment(newAlignment);
    localStorage.setItem("sidebarAlignment", newAlignment);
  };

  const backToHome = (event) => {
    event.preventDefault();
    if (isLoggedIn()) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

      useClickOutside([
        { ref: [sideBarRef, navCloseSideBarRef], close: closeSidebar },
      ]);

  const sidebarPositionClass = alignment === "left" ? "left-0" : "right-0";

  return (
    <>
      {/* Sidebar */}
      <div
        ref={sideBarRef}
        id="mine"
        className={`fixed top-0 ${sidebarPositionClass} pt-[100px] flex flex-col h-full bg-[var(--background-color-scondary)] text-white w-64 py-7 px-2 z-99 transform ${
          isOpen
            ? "translate-x-0"
            : alignment === "left"
              ? "-translate-x-full"
              : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        {/* Profile section */}
        <div>
          <img
            onClick={backToHome}
            src={userProfilePath}
            alt={"profileImage"}
            className="pagelogo w-10 aspect-square rounded-full mx-auto"
            title="back to addysmart"
          />
          <h1 className="w-full text-center mt-5 m-0 text-[var(--highlight-color)] text-2xl">
            {`${User.userTitle?.toUpperCase() || ""} 
              ${User.firstName?.toUpperCase() || ""} 
              ${User.lastName?.toUpperCase() || ""}`}
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="rounded max-h-[35vh] overflow-y-auto">
          <Link
            to="/home"
            className="block py-2.5 px-4 rounded hover:bg-gray-700"
          >
            Home
          </Link>

          <Link to="./" className="block py-2.5 px-4 rounded hover:bg-gray-700">
            Dashboard
          </Link>

          <Link
            to="./tasks"
            className="block py-2.5 px-4 rounded hover:bg-gray-700"
          >
            Tasks
          </Link>

          <Link
            to="./managebalance"
            className="block py-2.5 px-4 rounded hover:bg-gray-700"
          >
            ManageBalance
          </Link>

          <Link
            to="./referrals"
            className="block py-2.5 px-4 rounded hover:bg-gray-700"
          >
            Referrals
          </Link>

          <Link
            to="./faq"
            className="block py-2.5 px-4 rounded hover:bg-gray-700"
          >
            FAQ
          </Link>

          <Link
            onClick={openUserSupportModal}
            className="block py-2.5 px-4 rounded hover:bg-gray-700"
          >
            Support
          </Link>

          <Link
            to="./supportticket"
            className="block py-2.5 px-4 rounded hover:bg-gray-700"
          >
            SupportTickets
          </Link>

          {User && User.role && User.role.includes("admin") && (
            <MiningSidebarAdminNav />
          )}
        </nav>

        {/* Dropdown for Changing Sidebar Alignment */}
        <div className="mt-4 flex flex-col">
          <label htmlFor="alignment" className="mr-2 text-white">
            Sidebar Alignment:
          </label>
          <select
            id="alignment"
            value={alignment}
            onChange={handleAlignmentChange}
            className="px-2 py-1 rounded bg-gray-200 text-black"
          >
            <option value="right">Right</option>
            <option value="left">Left</option>
          </select>
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-0 w-full m-0 p-0 flex">
          <button
            onClick={handleLogout}
            className="w-full bg-[var(--accent-color] text-white p-2 m-2 rounded hover:text-highlight-colortransition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default MiningSidebar;
