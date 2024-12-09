import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext/AuthContext";
import { BeatLoader } from "react-spinners";

const EmailVerification = () => {
  const { getStoredUserObj, API_base_url, getStoredToken } =
    useContext(AuthContext);
  const [resendSuccess, setResendSuccess] = useState("");
  const [user, setUser] = useState({});
  const [isCooldown, setIsCooldown] = useState(false); // To manage cooldown state
  const [timeLeft, setTimeLeft] = useState(0); // Cooldown countdown
  const cooldownPeriod = 60; // Cooldown period in seconds
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUser(getStoredUserObj());
  }, [getStoredUserObj]);

  const handleResendEmail = async () => {
    if (isCooldown) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_base_url}api/a/v1.00/users/resendverificationemail`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${getStoredToken()}`,
          },
        }
      );

      if (response.ok) {
        setResendSuccess("A verification email has been sent!");
        startCooldown(); // Initiate the cooldown after sending the email
      } else {
        setResendSuccess("Failed to resend email.");
      }
    } catch (error) {
      setResendSuccess("An error occurred while resending the email.");
    } finally {
      setIsLoading(false);
    }

    // Clear success/error message after 5 seconds
    setTimeout(() => {
      setResendSuccess("");
    }, 5000);
  };

  const startCooldown = () => {
    setIsCooldown(true);
    setTimeLeft(cooldownPeriod);

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsCooldown(false); // Cooldown ends
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000); // Countdown timer every second

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  };

  return (
    <>
      {!user.emailVerified && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-70 z-50">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-[900px] text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
            <h2 className="mb-6 text-[var(--secondary-text-color)] text-2xl">
              An email has been sent to your email: <b>{user.email}</b>. <br />
              Please verify your email to continue. <br />
              <em className="mb-6 text-[var(--secondary-text-color)] text-2xl w-full">
                Click 'Resend Email' if you did not get the mail.
              </em>
            </h2>

            <button
              className={`px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-blue-700 transition duration-300 ${
                isCooldown ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleResendEmail}
              disabled={isCooldown}
            >
              {isLoading ? (
                <BeatLoader color="#ffffff" loading={isLoading} size={8} />
              ) : isCooldown ? (
                `Wait ${timeLeft}s to Resend`
              ) : (
                "Resend Email"
              )}
            </button>
            {resendSuccess && (
              <p className="text-green-500 mt-4">{resendSuccess}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmailVerification;
