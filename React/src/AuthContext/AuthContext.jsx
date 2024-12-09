import { createContext, useRef, useState } from "react";
import PropTypes from "prop-types";

export const AuthContext = createContext(null);

export const AuthContextProvider = (props) => {
  const { children } = props; // Destructure children from props

  // const location = useLocation();
  // let API_base_url
  // let testProd = false
  // if(process.env.NODE_ENV === "production"){}

  // or
  let CLIENT_base_url;

  let API_base_url;
  let testProd = false; // determines which base url that will be used on build with local testing
  console.log("import.meta.env.MODE", import.meta.env.MODE);
  if (import.meta.env.MODE === "development" && testProd === true) {
    console.log("Case1");
    console.log("testProd", testProd);
    API_base_url = "https://addysmart-authservice.onrender.com/";
       // CLIENT_base_url = "https://addyapps.onrender.com/";
    CLIENT_base_url = "https://addyapps.com/";
    console.log("API_base_url", API_base_url);
  } else if (import.meta.env.MODE === "production") {
    console.log("Case2");
    API_base_url = "https://addysmart-authservice.onrender.com/";
    // CLIENT_base_url = "https://addysmart.onrender.com/";
    // CLIENT_base_url = "https://addyapps.onrender.com/";
    CLIENT_base_url = "https://addyapps.com/";
    console.log("API_base_url", API_base_url);
  } else {
    console.log("Case3");
    API_base_url = "http://localhost:7981/";
    console.log("API_base_url", API_base_url);
    CLIENT_base_url = "http://localhost:5173/";
  }

  const APP_NAME = "ADDYAPPS";
  const APP_NAME2 = `ADDYAPPS'`;


  const [pageTitle, setPageTitle] = useState("");

  const logout = () => {
    localStorage.removeItem(`${API_base_url}token`);
    localStorage.removeItem(`${API_base_url}User.serialized`);
    console.log("logged out");
  };

  const StoreToken = (token) => {
    localStorage.setItem(`${API_base_url}token`, token);
    return token;
  };

  const StoreUserObj = (object) => {
    localStorage.setItem(
      `${API_base_url}User.serialized`,
      JSON.stringify(object)
    );
    return object;
  };

  const getStoredToken = () => {
    const token = localStorage.getItem(`${API_base_url}token`);
    return token;
  };

  const getStoredUserObj = () => {
    const userObj = JSON.parse(
      localStorage.getItem(`${API_base_url}User.serialized`)
    );
    return userObj;
  };

  const userRole = () => {
    const userObj = JSON.parse(
      localStorage.getItem(`${API_base_url}User.serialized`)
    );
    return userObj.role;
  };

  const SetReferalId = (refId) => {
    localStorage.setItem(`referralId`, refId);
    return refId;
  };
  const getReferalId = () => {
    return localStorage.getItem(`referralId`);
  };

  const handleAlreadyLoggedIn = () => {
    const token = getStoredToken();
    const userObj = getStoredUserObj();

    if (token === undefined || userObj === undefined || !token || !userObj) {
      logout();
    } else {
      let path = "./";
      if (userObj.role.includes("user")) {
        path = `/in/home`;
      } else {
        path = `./`;
      }
      return path;
    }
  };

  const isLoggedIn = () => {
    const token = getStoredToken();
    const userObj = getStoredUserObj();
    let islogedin = false;
    if (token === undefined || userObj === undefined || !token || !userObj) {
      logout();
    } else {
      islogedin = true;
    }
    return islogedin;
  };

  const profileImagePath = () => {
    const userObj = JSON.parse(
      localStorage.getItem(`${API_base_url}User.serialized`)
    );
    if (userObj && userObj.profileImg) {
      return userObj.profileImg.filePath;
    }
    return undefined;
  };

    const [isOpen, setIsOpen] = useState(false);

    // Toggle sidebar open/close
    const toggleSidebar = () => {
      setIsOpen(!isOpen);
    };

  const closeSidebar = () => {
        setIsOpen(false);
      };
  
  const sideBarRef = useRef();
  const navCloseSideBarRef = useRef();

  const contextValue = {
    APP_NAME,
    APP_NAME2,
    API_base_url,
    handleAlreadyLoggedIn,
    getStoredToken,
    getStoredUserObj,
    userRole,
    StoreToken,
    StoreUserObj,
    logout,
    isLoggedIn,
    SetReferalId,
    getReferalId,
    CLIENT_base_url,
    profileImagePath,
    pageTitle,
    setPageTitle,
    isOpen,
    setIsOpen,
    toggleSidebar,
    sideBarRef,
    closeSidebar,
    navCloseSideBarRef,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// PropTypes validation for AuthContextProvider props
AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate children prop
};
