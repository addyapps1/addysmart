import { useContext } from "react";
import { AuthContext } from "../../AuthContext/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const MiningServiceHeader = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);
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
          src="/serviceLogos/addysmart-high-resolution-logo.png"
          alt={"company logo"}
          className="card-logo w-14 aspect-square rounded-full "
        />
      </div>
      <nav className="nav-links rounded">
        <ul className="flex space-x-4">
          {isLoggedIn() ? (
            <>
              <li>
                <Link
                  href="/home"
                  className="text-on-primary hover:text-accent"
                >
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
              <Link href="/login" className="text-on-primary hover:text-accent">
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default MiningServiceHeader;
