import { createContext, useRef, useState } from "react";
import PropTypes from "prop-types";
import useServerGroups from "../CustomHooks/useServerGroups";
import testProd from "../CustomHooks/useTestProd";
import useSwitchAccount from "../CustomHooks/useSwitchAccount"


export const AuthContext = createContext(null);

export const AuthContextProvider = (props) => {
  const { children } = props; // Destructure children from props

  //// LOAD BALANCER

  // Track the last used suffix for each server group
  const serverTracker = {};


  const SwitchAccount = () => {
    return useSwitchAccount();
  };


  const getNextServerIndex = (groupName) => {
    if (!useServerGroups[groupName]) {
      throw new Error(`Server group ${groupName} does not exist.`);
    }

    // Initialize the suffix tracker if it doesn't exist
    if (!serverTracker[groupName]) {
      serverTracker[groupName] = 0;
    }

    // Get the number of servers for the group
    const numServers = useServerGroups[groupName];

    // Calculate the next server index and increment the tracker
    const nextIndex = serverTracker[groupName] % numServers;
    serverTracker[groupName]++;

    return nextIndex + 1; // Return 1-based index (e.g., 1, 2, 3)
  };
  //// LOAD BALANCER

  // const location = useLocation();
  // let API_base_url
  // let testProd = false
  // if(process.env.NODE_ENV === "production"){}

  // or


  // console.log("import.meta.env.MODE", import.meta.env.MODE);
  // if (import.meta.env.MODE === "development" && testProd === true) {
  //   console.log("Case1");
  //   console.log("testProd", testProd);
  //   API_base_url = "https://addysmart-authservice.onrender.com/";
  //   // CLIENT_base_url = "https://addyapps.onrender.com/";
  //   CLIENT_base_url = "https://addyapps.com/";
  //   console.log("API_base_url", API_base_url);
  // } else if (import.meta.env.MODE === "production") {
  //   console.log("Case2");
  //   API_base_url = `https://addysmart-authservice${getNextServerIndex("AUTH_HOST")}.onrender.com/`;
  //   // CLIENT_base_url = "https://addysmart.onrender.com/";
  //   // CLIENT_base_url = "https://addyapps.onrender.com/";
  //   CLIENT_base_url = "https://addyapps.com/";
  //   console.log("API_base_url", API_base_url);
  // } else {
  //   console.log("Case3");
  //   API_base_url = `http://localhost:7981/${getNextServerIndex("AUTH_HOST")}/`;
  //   console.log("API_base_url", API_base_url);
  //   CLIENT_base_url = "http://localhost:5173/";
  // }

  const API_base_url = () => {
    let url;
    if (import.meta.env.MODE === "development" && testProd === true) {
      console.log("Case1");
      url = "https://addysmart-authservice.onrender.com/";
    } else if (import.meta.env.MODE === "production") {
      console.log("Case2");
      url = `https://addy${SwitchAccount()}smart-authservice${getNextServerIndex("AUTH_HOST")}.onrender.com/`;
    } else {
      console.log("Case3");
      url = `http://localhost:7981/`;
    }
    return url;
  };

  const CLIENT_base_url = () => {
    let url;
    if (import.meta.env.MODE === "development" && testProd === true) {
      console.log("Case1");
      url = "https://addyapps.onrender.com/";
    } else if (import.meta.env.MODE === "production") {
      console.log("Case2");
      url = "https://addyapps.com/";
    } else {
      console.log("Case3");
      url = "http://localhost:5173/";
    }
    return url;
  };

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
