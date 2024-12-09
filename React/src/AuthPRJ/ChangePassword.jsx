import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import { AuthContext } from "../AuthContext/AuthContext";
import AuthHelmet from "./AuthHelmet";
import ConfirmPasswordStrengthModal from "../AuthPubPRJ/ConfirmPasswordStrengthModal";

const ChangePassword = () => {
  const {
    isLoggedIn,
    getStoredUserObj,
    setPageTitle,
    API_base_url,
    logout,
    getStoredToken,
    APP_NAME,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [Confirmed, setConfirmed] = useState(false);
  const buttonRef = useRef(null);
  const proceed = useRef(true);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/");
    } else {
      setUser(getStoredUserObj());
    }
  }, [isLoggedIn, navigate, getStoredUserObj]);

  // Set page title
  useEffect(() => {
    setPageTitle("CHANGE PASSWORD");
  }, [setPageTitle]);

  const handleConfirm = (response) => {
    console.log("response", response);
    proceed.current = response;
    setConfirmed(response);
    if (response) {
      buttonRef.current.click();
    }
    console.log("Confirmed", Confirmed);
    setShowConfirm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous error messages
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      Swal.fire("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      // alert("Passwords do not match.");
      setErrorMessage("Passwords must be at least 8 characters");
      Swal.fire("Passwords must be at least 8 characters");
      return false;
    }

    // Password strength check
    console.log(
      "Confirmed status:",
      Confirmed,
      "Proceed status:",
      proceed.current
    );

    if (!Confirmed && !showConfirm) {
      const hasLowercase = /[a-z]/.test(newPassword);
      const hasUppercase = /[A-Z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*]/.test(newPassword);

      // If any condition is not met, show confirmation modal
      if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
        console.log("Password strength check failed");
        setShowConfirm(true);
        proceed.current = false;
        return false;
      }
    }

    setIsLoading(true);

    const formData = {
      oldpassword: oldPassword,
      password: newPassword,
      confirmPassword: confirmPassword,
    };

    try {
      const response = await fetch(
        `${API_base_url}api/a/v1.00/users/changepassword`,
        {
          method: "put",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${getStoredToken()}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await Swal.fire(
          "Password changed successfully!",
          "Please log in.",
          "success"
        );
        logout();
        navigate("/login");
      } else {
        throw new Error(
          data.message || "An error occurred during the password reset."
        );
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthHelmet
        pageDescription={`Welcome to ${APP_NAME.toLowerCase()} change password page.`}
        pageName="resetpass"
        pageTitle={`${APP_NAME} - change password`}
      />

      <div className="container my-8 mx-auto max-w-md p-6 bg-[var(--container-bg-color)] border border-[var(--container-border)] rounded-lg shadow-lg">
        <div className="formHeader mb-6 rounded-md">
          <h1 className="text-2xl font-bold text-[var(--primary-text-color)] text-center">
            Change Password
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="old-password"
          >
            Old Password
          </label>
          <input
            type="password"
            id="old-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
            required
          />
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="new-password"
          >
            New Password
          </label>
          <input
            type="password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
            required
          />
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="confirm-password"
          >
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
            required
          />
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          <button
            ref={buttonRef}
            type="submit"
            className={`w-full mt-7 py-2 ${isLoading ? "bg-gray-400" : "bg-[var(--highlight-color)]"} text-white rounded hover:bg-[var(--secondary-accent-color)] transition duration-300`}
            disabled={isLoading}
          >
            {isLoading ? (
              <BeatLoader color="#ffffff" loading={isLoading} size={8} />
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
      {showConfirm && (
        <ConfirmPasswordStrengthModal handleConfirm={handleConfirm} />
      )}
    </>
  );
};

export default ChangePassword;
