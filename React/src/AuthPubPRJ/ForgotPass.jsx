import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import { AuthContext } from "../AuthContext/AuthContext";
import AuthHelmet from "./AuthHelmet";

const ForgotPass = () => {
  const { API_base_url, APP_NAME } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const formData = { email }; // Assuming the API expects the email

    try {
      const response = await fetch(
        `${API_base_url()}api/a/v1.00/users/forgotpassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();

      if (response.ok) {
        Swal.fire(
          "Password reset email sent successfully! Please check your inbox."
        );
        navigate("/login");
      } else {
        throw Error(`${data.message}`);
      }
    } catch (error) {
      console.error("Error during password reset request:", error);
      setErrorMessage(`Error: ${error.message}`);
    }

    setIsLoading(false);
  };


  return (
    <>
      <AuthHelmet
        pageDescription={`Welcome to ${APP_NAME.toLowerCase()} page for requesting password reset email.`}
        pageName="forgotpass"
        pageTitle={`${APP_NAME} - Forgot Password`}
      />

      <div className="container my-8 mx-auto max-w-md p-6 bg-[var(--container-bg-color)] border border-[var(--container-border)] rounded-lg shadow-lg">
        <div className="formHeader mb-6 rounded-md">
          <h1 className="text-2xl font-bold text-[var(--primary-text-color)] text-center">
            Forgot Password
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="email"
          >
            Enter your email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
            required
          />
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full mt-7 py-2 bg-[var(--highlight-color)] text-white rounded hover:bg-[var(--secondary-accent-color)] transition duration-300"
          >
            {isLoading ? (
              <BeatLoader color="#ffffff" loading={isLoading} size={8} />
            ) : (
              "Send Reset Email"
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
    </>
  );
};

export default ForgotPass;
