import { createContext, useRef, useState } from "react";
import PropTypes from "prop-types";
import useServerGroups from "../../CustomHooks/useServerGroups";
import testProd from "../../CustomHooks/useTestProd";
import useSwitchAccount from "../../CustomHooks/useSwitchAccount";

export const MineContext = createContext(null);

export const MineContextProvider = (props) => {
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

  const SERVICENAME = "Addymine";

  const API_MineBase_url = () => {
    let url;
    if (import.meta.env.MODE === "development" && testProd === true) {
      console.log("Case1");
      url = "https://addysmart-miningservice.onrender.com/";
    } else if (import.meta.env.MODE === "production") {
      console.log("Case2");
      url = `https://addy${SwitchAccount()}smart-miningservice${getNextServerIndex("MINING_HOST")}.onrender.com/`;
    } else {
      console.log("Case3");
      url = "http://localhost:7982/";
    }
    return url;
  };

  const API_AuthBase_url = () => {
    let url;
    if (import.meta.env.MODE === "development" && testProd === true) {
      console.log("Case1");
      url = "https://addysmart-authservice.onrender.com/";
    } else if (import.meta.env.MODE === "production") {
      console.log("Case2");
      url = `https://addy${SwitchAccount()}smart-authservice${getNextServerIndex("AUTH_HOST")}.onrender.com/`;
    } else {
      console.log("Case3");
      url = "http://localhost:7981/";
    }
    return url;
  };

  const API_E_VideoBase_url = () => {
    let url;
    if (import.meta.env.MODE === "development" && testProd === true) {
      console.log("Case1");
      url = "https://addysmart-e-videoservice.onrender.com/";
    } else if (import.meta.env.MODE === "production") {
      console.log("Case2");
      url = `https://addy${SwitchAccount()}smart-e-videoservice${getNextServerIndex("E_VIDEO_HOST")}.onrender.com/`;
    } else {
      console.log("Case3");
      url = "http://localhost:7983/";
    }
    return url;
  };

  const API_supportBase_url = () => {
    let url;
    if (import.meta.env.MODE === "development" && testProd === true) {
      console.log("Case1");
      url = "https://addysmart-e-videoservice.onrender.com/";
    } else if (import.meta.env.MODE === "production") {
      console.log("Case2");
      url = `https://addy${SwitchAccount()}smart-e-videoservice${getNextServerIndex("SUPPORT_HOST")}.onrender.com/`;
    } else {
      console.log("Case3");
      url = "http://localhost:7985/";
    }
    return url;
  };

  console.log("here vvv")

  const [referrals, setReferrals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [balance, setBalance] = useState({});

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

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false); // State to control modal visibility
  const [isUserModalOpen, setIsUserModalOpen] = useState(false); // State to control modal visibility
  const [supportTickets, setSupportTickets] = useState([]);
  // Close modal function
  const closeSupportModal = () => {
    setIsAdminModalOpen(false);
    setIsUserModalOpen(false);
  };

  const openAdminSupportModal = () => {
    closeSupportModal();
    setIsAdminModalOpen(true);
  };

  const openUserSupportModal = () => {
    closeSupportModal();
    setIsUserModalOpen(true);
  };

  const videoRefs = useRef({});
  const audioRefs = useRef({});

  const handleVideoPlay = (path) => {
    Object.keys(videoRefs.current).forEach((key) => {
      if (videoRefs.current[key] && key !== path) {
        videoRefs.current[key].pause();
      }
    });
  };

  const handleAudioPlay = (path) => {
    Object.keys(audioRefs.current).forEach((key) => {
      if (audioRefs.current[key] && key !== path) {
        audioRefs.current[key].pause();
      }
    });
  };

  const contextValue = {
    API_MineBase_url,
    API_AuthBase_url,
    API_E_VideoBase_url,
    API_supportBase_url,
    tasks,
    setTasks,
    balance,
    setBalance,
    isOpen,
    setIsOpen,
    toggleSidebar,
    closeSupportModal,
    openAdminSupportModal,
    openUserSupportModal,
    isAdminModalOpen,
    isUserModalOpen,
    referrals,
    setReferrals,
    supportTickets,
    setSupportTickets,
    videoRefs,
    audioRefs,
    handleVideoPlay,
    handleAudioPlay,
    closeSidebar,
    sideBarRef,
    navCloseSideBarRef,
    SERVICENAME,
  };

  return (
    <MineContext.Provider value={contextValue}>{children}</MineContext.Provider>
  );
};

// PropTypes validation for MineContextProvider props
MineContextProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate children prop
};
