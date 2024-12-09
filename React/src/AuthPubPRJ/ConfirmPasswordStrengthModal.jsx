// src\AuthPRJ\ConfirmPasswordStrengthModal.jsx

const ConfirmPasswordStrengthModal = ({ handleConfirm }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-70 z-50">
      <div className="bg-white p-6 rounded-md w-[90%] max-w-[900px] text-center shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
        <p className="mb-6 text-[var(--secondary-text-color)] text-2xl">
          <strong className="bg-[var(--highlight-color)] rounded-md p-1">
            Warning!
          </strong>
          <br /> Your password does not meet the recommended{" "}
          <strong>requirements for security</strong>. A strong password should
          include at least{" "}
          <strong>
            one lowercase letter, one uppercase letter, one number, and one
            special character
          </strong>
          . Do you still want to proceed?
        </p>

        <button
          className="px-4 py-2 mr-2 bg-[var(--accent-color)] text-white rounded-md hover:bg-blue-700 transition duration-300"
          onClick={() => handleConfirm(true)}
        >
          Yes, Proceed
        </button>

        <button
          className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-600 transition duration-300"
          onClick={() => handleConfirm(false)}
        >
          No, Update Password
        </button>
      </div>
    </div>
  );
};

export default ConfirmPasswordStrengthModal;
