// Register.js
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../AuthContext/AuthContext";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import AuthHelmet from "./AuthHelmet";
import ConfirmPasswordStrengthModal from "./ConfirmPasswordStrengthModal";

const Register = () => {
  const {
    API_base_url,
    StoreToken,
    StoreUserObj,
    getReferalId,
    setPageTitle,
    APP_NAME,
  } = useContext(AuthContext);


  useEffect(() => {
    setPageTitle("");
    return () => {};
  }, [setPageTitle]);

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // const [myevent, setMyEvent] = useState("");
  const [Confirmed, setConfirmed] = useState(false);
  const buttonRef = useRef(null);
  const proceed = useRef(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    referredByRef: "",
    userTitle: "",
  });

  // Triggered when ConfirmPasswordStrengthModal sends back a response
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

const handleTitle = () => {
  const titleEndsWithDotRegex = /\.\s*$/;

  if (
    formData.userTitle &&
    !titleEndsWithDotRegex.test(formData.userTitle.trim())
  ) {
    setFormData((prevState) => ({
      ...prevState,
      userTitle: `${prevState.userTitle.trim()}.`,
    }));
  }
};


  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    console.log("formData", formData);

    if (getReferalId()) {
      setFormData({ ...formData, referredByRef: getReferalId() });
    }
    // Perform basic form validation
    let {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      gender,
      userTitle,
    } = formData;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !gender
    ) {
      setErrorMessage("Please fill in all required fields");
      // alert("Please fill in all required fields.");
      Swal.fire("Please fill in all required fields.");
      return false;
    }
    if (password !== confirmPassword) {
      // alert("Passwords do not match.");
      Swal.fire("Passwords do not match.");

      return false;
    }
    if (password.length < 8) {
      // alert("Passwords do not match.");
      Swal.fire("Passwords must be at least 8 characters");
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      Swal.fire("Email is not a valid email");
      return false;
    }

    const titleRegex = /^[a-zA-Z0-9\s,'.-]{2,50}$/;

    if (userTitle && !titleRegex.test(userTitle)) {
      Swal.fire(
        `Title "${userTitle}" is not valid. Please use 2-50 characters, including letters, numbers, spaces, commas, apostrophes, hyphens, or dots only.`
      );
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

    // Proceed with other code if the title is valid.

    // Continue with other code, e.g., checking password or further validations.
    console.log("proceed2", proceed.current);
    return proceed.current;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("handleSubmit RAN");
    setIsLoading(true);
    proceed.current = true;
    console.log("handleSubmit proceed0", proceed.current);
    if (isLoading) {
      console.log("isLoading 1 true");
    } else {
      console.log("isLoading 1 false");
    }

    handleTitle();
    let rest = validateForm();
    console.log("rest", rest);

    if (!rest) {
      console.log("form validation failed");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    if (isLoading) {
      console.log("isLoading 2 true");
    } else {
      console.log("isLoading 2 false");
    }

    console.log("formData", formData);

    try {
      console.log("GOT HERE");
      const response = await fetch(`${API_base_url()}api/a/v1.00/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status !== "success") {
        throw new Error(data.message);
      }
      console.log(data);
      console.log(data.token);
      // Handle the response from the backend if needed
      data.token && StoreToken(data.token);
      data.data && StoreUserObj(data.data);

      // alert(
      //   "Registration successful, you have been successfully logged in and will be redirected to the home page"
      // );
      Swal.fire(
        "Registration successful, you have been successfully logged in and will be redirected to the home page"
      );

      console.log("data", data);
      if (data.data.role.includes("user")) {
        navigate(`/in/home`);
      } else {
        navigate(`/`);
      }
    } catch (error) {
      // Handle any errors
      let ErrorMessage =''
      if (/E11000/.test(error)) {
        ErrorMessage = `registration detail rejected,\n please try another account detail`
      }
      else{ErrorMessage = error; }
      // Swal.fire(`Registration failed: ${error}`);
      console.error(`Registration failed: ${ErrorMessage}`);
      Swal.fire(`Registration failed:\n ${ErrorMessage}`);
    }
    setIsLoading(false);
  };

  return (
    <>
      <AuthHelmet
        pageDescription={`Welcome to ${APP_NAME.toLowerCase()} registration/signup page.`}
        pageName="register"
        pageTitle={` ${APP_NAME} - Registration/sign-up`}
      />

      <div className="container my-8 mx-auto max-w-md p-6 bg-[var(--container-bg-color)] border border-[var(--container-border)] rounded-lg shadow-lg">
        <div className="formHeader mb-6 rounded-md">
          <h1 className="text-2xl font-bold text-[var(--primary-text-color)] text-center">
            Register
          </h1>
        </div>
        <form>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="firstName"
          >
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            id="firstName"
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
          />
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="lastName"
          >
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            id="lastName"
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
          />
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="userTitle"
          >
            Your Title ( If any )
          </label>
          <input
            type="text"
            name="userTitle"
            value={formData.userTitle}
            onChange={handleChange}
            id="userTitle"
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
          />
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="email"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            id="email"
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
          />
          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="password"
          >
            Password <em>(at least 8 chars.)</em>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            id="password"
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
          />

          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            id="confirmPassword"
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
          />

          <label
            className="block mb-2 text-[var(--primary-text-color)] font-bold"
            htmlFor="gender"
          >
            Gender:
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            id="gender"
            className="mb-4 p-2 w-full border rounded text-[var(--secondary-text-color)] border-[var(--dark-gray)] focus:border-[var(--highlight-color)] focus:shadow-md"
          >
            <option value="">-- Select Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <button
            ref={buttonRef}
            onClick={handleSubmit}
            type="submit"
            className="w-full mt-7 py-2 bg-[var(--highlight-color)] text-white rounded hover:bg-[var(--secondary-accent-color)] transition duration-300"
          >
            {isLoading ? (
              <BeatLoader color="#ffffff" loading={isLoading} size={8} />
            ) : (
              "Register"
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

export default Register;
