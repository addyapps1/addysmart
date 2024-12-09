import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import closeIcon from "../Assets/line-md--menu-to-close-transition.svg";
import menuIcon from "../Assets/line-md--close-to-menu-transition.svg";

const MiningServiceHeader = () => {
  const {
    isLoggedIn,
    pageTitle,
    isOpen,
    toggleSidebar,
    getStoredUserObj,
    logout,
    navCloseSideBarRef,
  } = useContext(AuthContext); // Assuming `user` is provided in AuthContext
  const navigate = useNavigate();

    const [User, setUser] = useState({});
    useEffect(() => {
      setUser(getStoredUserObj()); // Log after setting the user
    }, [getStoredUserObj]);

  const handleToggleSidebar = (event) => {
    event.preventDefault();
    toggleSidebar();
  };

  const handleGoBack = (event) => {
    event.preventDefault();
    if (isLoggedIn()) {
      navigate(-1); // navigate to previous page
    } else {
      navigate("/"); // redirect to home
    }
  };

  const handleLogout = (event) => {
    event.preventDefault();
    logout();
    navigate("/"); // redirect after logout
  };

  const backToHome = (event) => {
    event.preventDefault();
    navigate(isLoggedIn() ? "/home" : "/");
  };

  return (
    <header className="auth-header bg-primary text-on-primary flex items-center justify-between p-1">
      <div className="pagelogo rounded-full text-lg font-bold nav-links">
        <img
          onClick={backToHome}
          src="/serviceLogos/addy-mining-logo-transparent.png"
          alt="company logo"
          className="pagelogo w-10 aspect-square rounded-full"
          title="Back to Addysmart"
        />
      </div>
      <em className="text-[var(--highlight-color)]">{pageTitle}</em>
      <nav className="nav-links rounded">
        <ul className="flex space-x-4 items-center">
          {pageTitle != "HOME" && (
            <li>
              <Link
                onClick={handleGoBack}
                className="text-on-primary hover:text-accent"
              >
                Back
              </Link>
            </li>
          )}
          {User?.emailVerified ? ( // Check if user and emailVerified are defined
            <li>
              <Link
                onClick={handleToggleSidebar}
                className="pagelogo flex items-center justify-center focus:outline-none"
                aria-label="Toggle Sidebar"
              >
                <img
                  ref={navCloseSideBarRef}
                  src={isOpen ? closeIcon : menuIcon}
                  alt="Toggle Sidebar"
                  className="pagelogo w-10 h-10 rounded-full bg-[var(--container-bg-color)] text-[var(--highlight-color)] p-1"
                />
              </Link>
            </li>
          ) : (
            <li>
              <Link
                onClick={handleLogout}
                className="text-on-primary hover:text-accent"
              >
                Logout
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default MiningServiceHeader;
