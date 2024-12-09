import { useContext } from "react";
import { AuthContext } from "./AuthContext/AuthContext";

const AddysmartFooter = () => {
    const {
      APP_NAME
    } = useContext(AuthContext);
  return (
    <footer className="auth-footer bg-secondary text-on-secondary flex items-center justify-center p-4">
      <img
        src="/serviceLogos/addyapps-high-resolution-logo.png"
        alt={`company logo`}
        className="pagelogo w-10 aspect-square rounded-full mr-2 "
      />
       <p className="text-sm text-on-secondary">
        © {new Date().getFullYear()}  {APP_NAME}. All rights reserved.
      </p>
    </footer>
  );
};

export default AddysmartFooter;
