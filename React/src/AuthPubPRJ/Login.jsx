// Login.js
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext/AuthContext";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import AuthHelmet from "./AuthHelmet";

const Login = () => {
  // const { API_base_url, StoreToken, StoreUserObj, SetReferalId } = useContext(AuthContext);
  const {
    API_base_url,
    handleAlreadyLoggedIn,
    StoreToken,
    StoreUserObj,
    SetReferalId,
    logout,
    setPageTitle, APP_NAME,
  } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });



  useEffect(() => {
    setPageTitle("");
    return () => {};
  }, [setPageTitle]);

  const searchParams = new URLSearchParams(window.location.search);
  const referralId = searchParams.get("refId");
  if (referralId) {
    SetReferalId(referralId);
  }

  async function verifyEmail() {
    const VerificationToken = searchParams.get("verify");
    console.log("VerificationToken", VerificationToken);
    if (VerificationToken) {
      try {
        let URL = `${API_base_url()}api/a/v1.00/users/verifyemail/${VerificationToken}`;
        console.log("VerifyURL", URL);
        const response = await fetch(URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          // Handle success
          console.log("Email verified successfully!", data);
          Swal.fire("Email verified successfully! Please login");
          logout(); // Call the logout function
          navigate("/");
          // You can perform actions like redirecting the user, showing a success message, etc.
          return data;
        } else {
          // Handle server-side errors (status codes other than 2xx)
          console.error("Failed to verify email:", data.message || data);
          // Swal.fire(
          //   "Failed to verify email: " + (data.message || "Unknown error")
          // );
          Swal.fire({
            icon: "error",
            title: "Email Verification Failed!",
            html: `
              Possible expired token.<br> 
              Please log in and resend email verification to proceed.
            `,
            confirmButtonText: "Okay",
          });

          navigate("/");
          return null;
        }
      } catch (error) {
        // Handle network errors or issues with the fetch call
        console.error("An error occurred while verifying the email:", error);
        Swal.fire(
          "An error occurred while verifying the email: " + error.message
        );
        return null;
      }
    }
  }

  verifyEmail();

  const navigate = useNavigate(); // Hook to navigate programmatically
  useEffect(() => {
    if (handleAlreadyLoggedIn()) {
      navigate(`/in/home`);
    }
  }, [handleAlreadyLoggedIn, navigate]);

  // console.log("login API_base_url", API_base_url);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      console.log("formData", formData);
      const response = await fetch(`${API_base_url()}api/a/v1.00/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        data.token && StoreToken(data.token);
        data.data && StoreUserObj(data.data);
        console.log("User ", data.data);
        if (data.data.role.includes("user")) {
          navigate(`/in/home`);
        } else {
          navigate(`/`);
        }
      } else {
        throw Error(`${data.message}`);
      }
    } catch (error) {
      console.error(`Error during login: ${error}`);
      setErrorMessage(`${error}...`);
    }

    setIsLoading(false);
  };



  return (
    <>
      <AuthHelmet
        pageDescription={`Welcome to ${APP_NAME.toLowerCase()}, your go-to platform for smart solutions.`}
        pageName="login"
        pageTitle={`${APP_NAME} - Login`}
      />

      <div className="container my-8 mx-auto max-w-md p-6 bg-[var(--container-bg-color)] border border-[var(--container-border)] rounded-lg shadow-lg">
        <div className=" formHeader mb-6 rounded-md">
          <h1 className="text-2xl font-bold text-[var(--primary-text-color)] text-center">
            Login
          </h1>
        </div>
        <form>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            id="email"
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
          />

          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="password"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            id="password"
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
          />

          <button
            onClick={handleSubmit}
            type="submit"
            className="w-full mt-7 py-2 bg-[var(--highlight-color)] text-white rounded hover:bg-[var(--secondary-accent-color)] transition duration-300"
          >
            {isLoading ? (
              <BeatLoader color="#ffffff" loading={isLoading} size={8} />
            ) : (
              "Login"
            )}
          </button>
        </form>
        <div className="mt-6 flex justify-between bg">
          <Link
            to="/forgotpass"
            className="text-[var(--accent-color)] hover:text-[var(--highlight-color)]"
          >
            Forgot Password?
          </Link>
          <Link
            to="/register"
            className="text-[var(--accent-color)] hover:text-[var(--highlight-color)]"
          >
            Register
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
