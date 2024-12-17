import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import { AuthContext } from "../AuthContext/AuthContext";
import AuthHelmet from "./AuthHelmet";
import ConfirmPasswordStrengthModal from "./ConfirmPasswordStrengthModal";

const ResetPass = () => {
  const { API_base_url, APP_NAME, getNextServerIndex, serverGroups, testProd } =
    useContext(AuthContext);



  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

    const [showConfirm, setShowConfirm] = useState(false);
    const [Confirmed, setConfirmed] = useState(false);
    const buttonRef = useRef(null);
    const proceed = useRef(true);

  // Retrieve resetToken from URL and set it to state
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const resetToken = searchParams.get("resetToken");
    if (resetToken) {
      setToken(resetToken);
    } else {
      setErrorMessage("Invalid or missing token.");
    }
  }, []);


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

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      Swal.fire("Passwords do not match.");
      return;
    }

        if (password.length < 8) {
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
      const hasLowercase = /[a-z]/.test(password);
      const hasUppercase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*]/.test(password);

      // If any condition is not met, show confirmation modal
      if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
        console.log("Password strength check failed");
        setShowConfirm(true);
        proceed.current = false;
        return false;
      }
    }

    setIsLoading(true);
    setErrorMessage("");

    const formData = {
      password: password,
      confirmPassword: confirmPassword, // Correct field name as expected by server
    };

    try {
      const response = await fetch(
        `${API_base_url}${!testProd ? getNextServerIndex(serverGroups.AUTH_HOST) : ''}api/a/v1.00/users/resetpassword/${token}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire("Password reset successfully! Please log in.");
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
        pageDescription={`Welcome to ${APP_NAME.toLowerCase()} reset password page.`}
        pageName="resetpass"
        pageTitle={`${APP_NAME} - reset password`}
      />

      <div className="container my-8 mx-auto max-w-md p-6 bg-[var(--container-bg-color)] border border-[var(--container-border)] rounded-lg shadow-lg">
        <div className="formHeader mb-6 rounded-md">
          <h1 className="text-2xl font-bold text-[var(--primary-text-color)] text-center">
            Reset Password
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="password"
          >
            New Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              "Reset Password"
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-[var(--accent-color)] hover:text-[var(--highlight-color)]"
          >
            Back to Login
          </Link>
        </div>
      </div>
      {showConfirm && (
        <ConfirmPasswordStrengthModal handleConfirm={handleConfirm} />
      )}
    </>
  );
};

export default ResetPass;
