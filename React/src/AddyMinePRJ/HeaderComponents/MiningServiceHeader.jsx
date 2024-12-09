import { useContext } from "react";
import { AuthContext } from "../../AuthContext/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { MineContext } from "../MineContext/MineContext";
import closeIcon from "../../Assets/line-md--menu-to-close-transition.svg"; // Adjusted path for close icon
import menuIcon from "../../Assets/line-md--close-to-menu-transition.svg"; // Adjusted path for menu icon

const MiningServiceHeader = () => {
  const { isLoggedIn, pageTitle} = useContext(AuthContext);
  const { isOpen, toggleSidebar, navCloseSideBarRef } = useContext(MineContext);
  const navigate = useNavigate();

  const handleToggleSidebar = (event) => {
    event.preventDefault(); // Prevent the default anchor or button behavior
    toggleSidebar(); // Call the toggle function
  };

  const handleGoBack = (event) => {
    event.preventDefault();
    if (isLoggedIn()) {
      navigate("-1"); // Go back to the previous page
    } else {
      navigate("/"); // Redirect to home page
    }
  };

  const backToHome = (event) => {
    event.preventDefault();
    if (isLoggedIn()) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

  return (
    <header className="auth-header bg-primary text-on-primary flex items-center justify-between p-1">
      <div className="pagelogo rounded-full text-lg font-bold nav-links">
        <img
          onClick={backToHome}
          src="/serviceLogos/addy-mining-logo-transparent.png"
          alt={"company logo"}
          className="pagelogo w-10 aspect-square rounded-full"
          title="back to addysmart"
        />
      </div>
      <em className="text-[var(--highlight-color)]">{pageTitle}</em>
      <nav className="nav-links rounded">
        <ul className="flex space-x-4 items-center">
          {pageTitle != "DASHBOARD" && (
            <li>
              <Link
                onClick={handleGoBack}
                className="text-on-primary hover:text-accent"
              >
                Back
              </Link>
            </li>
          )}
          <li>
            <Link
              onClick={handleToggleSidebar}
              className="pagelogo flex items-center justify-center focus:outline-none"
              aria-label="Toggle Sidebar"
            >
              <img
                ref={navCloseSideBarRef}
                src={isOpen ? closeIcon : menuIcon} // Show close icon if sidebar is open
                alt="Toggle Sidebar"
                className="pagelogo w-10 h-10 rounded-full bg-[var(--container-bg-color)] text-[var(--highlight-color)] p-1" // Full rounded with padding for better visibility
              />
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default MiningServiceHeader;
