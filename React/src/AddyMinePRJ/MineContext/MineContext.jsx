import { createContext, useRef, useState } from "react";
import PropTypes from "prop-types";

export const MineContext = createContext(null);

export const MineContextProvider = (props) => {
  const { children } = props; // Destructure children from props

  const SERVICENAME = "Addymine"

  let API_MineBase_url;
  let API_AuthBase_url;
  let API_E_VideoBase_url;
  let API_supportBase_url;
  let testProd = false; // determines which base url that will be used on build with local testing
  console.log("import.meta.env.MODE", import.meta.env.MODE);
  if (import.meta.env.MODE === "development" && testProd === true) {
    console.log("Case1");
    console.log("testProd", testProd);
    API_MineBase_url = "https://addysmart-miningservice.onrender.com/";
    console.log("API_MineBase_url", API_MineBase_url);
    API_AuthBase_url = "https://addysmart-authservice.onrender.com/";
    API_E_VideoBase_url = "https://addysmart-e-videoservice.onrender.com/";
    API_supportBase_url = "https://addysmart-supportservice.onrender.com/";
  } else if (import.meta.env.MODE === "production") {
    console.log("Case2");
    API_MineBase_url = "https://addysmart-miningservice.onrender.com/";
    console.log("API_MineBase_url", API_MineBase_url);
    API_AuthBase_url = "https://addysmart-authservice.onrender.com/";
    API_E_VideoBase_url = "https://addysmart-e-videoservice.onrender.com/";
    API_supportBase_url = "https://addysmart-supportservice.onrender.com/";

  } else {
    console.log("Case3");
    API_MineBase_url = "http://localhost:7982/";
    console.log("API_MineBase_url", API_MineBase_url);
    API_AuthBase_url = "http://localhost:7981/";
    API_E_VideoBase_url = "http://localhost:7983/";
    API_supportBase_url = "http://localhost:7985/";
  }

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
