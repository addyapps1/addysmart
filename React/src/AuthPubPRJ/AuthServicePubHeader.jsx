import { useContext } from "react";
import { AuthContext } from "../AuthContext/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const AuthServiceHeaderPub = () => {
  const { isLoggedIn, logout, pageTitle } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = (event) => {
    event.preventDefault(); // Prevent the default anchor or button behavior
    logout(); // Call the logout function
    navigate("/"); // Navigate to the home page after logout
  };

  const backToHome = () => {
    if (isLoggedIn()) {
      navigate("/home");
    } else {
      navigate("/");
    }
  };

  return (
    <header className="auth-header bg-primary text-on-primary flex items-center justify-between p-4">
      <div className="pagelogo rounded-full text-lg font-bold nav-links">
        <img
          onClick={backToHome}
          src="/serviceLogos/addyapps-high-resolution-logo.png"
          alt={"company logo"}
          className="card-logo w-10 aspect-square rounded-full "
        />
      </div>
      <em className="toggle">{pageTitle}</em>
      <nav className="nav-links rounded">
        <ul className="flex space-x-4">
          {isLoggedIn() ? (
            <>
              <li>
                <Link to="/home" className="text-on-primary hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  onClick={handleLogout}
                  className="text-on-primary hover:text-accent"
                >
                  Logout
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="text-on-primary hover:text-accent">
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default AuthServiceHeaderPub;
