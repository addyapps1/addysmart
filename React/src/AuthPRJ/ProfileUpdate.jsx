import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext/AuthContext";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import AuthHelmet from "./AuthHelmet";

const ProfileUpdate = () => {
  const {
    API_base_url,
    isLoggedIn,
    getStoredUserObj,
    setPageTitle,
    StoreUserObj,
    getStoredToken,
    APP_NAME,
  } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    setPageTitle("PROFILE UPDATE");
  }, [setPageTitle]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    userTitle: "",
  });

  useEffect(() => {
    const storedUser = getStoredUserObj();

    setFormData({
      firstName: storedUser?.firstName || "",
      lastName: storedUser?.lastName || "",
      gender: storedUser?.gender || "",
      userTitle: storedUser?.userTitle || "",
    });
  }, [getStoredUserObj]);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);


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
    const { firstName, lastName, gender, userTitle } = formData;

    if (!firstName || !lastName || !gender) {
      Swal.fire("Please fill in all required fields.");
      return false;
    }



    const titleRegex = /^[a-zA-Z0-9\s,'.-]{2,50}$/;
    if (userTitle && !titleRegex.test(userTitle)) {
      Swal.fire(
        `Title "${userTitle}" is not valid. Please use 2-50 characters, including letters, numbers, spaces, commas, apostrophes, hyphens, or dots only.`
      );
      return false;
    }

    return true;
  };

  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    handleTitle();

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_base_url}api/a/v1.00/users/profileupdate`,
        {
          method: "put",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${getStoredToken()}`,
          },
          body: JSON.stringify(formData),
        }
      );

      // Check if response is okay and of expected Content-Type
      if (response.ok) {
        const data = await response.json();
        if (data.data) StoreUserObj(data.data);
        Swal.fire("Profile updated successfully!");
      } else {
        // If response is not ok, read response text and log it
        const errorText = await response.text();
        setErrorMessage(`Profile update failed: ${errorText}`);
        Swal.fire(`Profile update failed: ${errorText}`);
        console.error(`Update failed: ${errorText}`);
      }
    } catch (error) {
      setErrorMessage(`Profile update failed`);
      Swal.fire(`Profile update failed: ${error.message}`);
      console.error(`Update failed: ${error}`);
    }

    setIsLoading(false);
  };

  return (
    <>
      <AuthHelmet
        pageDescription={`Welcome to  ${APP_NAME.toLowerCase()} profile update page.`}
        pageName="profile-update"
        pageTitle={`${APP_NAME} - Profile Update`}
      />

      <div className="container my-8 mx-auto max-w-md p-6 bg-[var(--container-bg-color)] border border-[var(--container-border)] rounded-lg shadow-lg">
        <div className="formHeader mb-6 rounded-md">
          <h1 className="text-2xl font-bold text-[var(--primary-text-color)] text-center">
            Profile Update
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
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
            type="submit"
            className="w-full mt-7 py-2 bg-[var(--highlight-color)] text-white rounded hover:bg-[var(--secondary-accent-color)] transition duration-300"
          >
            {isLoading ? (
              <BeatLoader color="#ffffff" loading={isLoading} size={8} />
            ) : (
              "Update"
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default ProfileUpdate;
