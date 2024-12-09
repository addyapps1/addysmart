import { createContext} from "react";
import PropTypes from "prop-types";

export const MineContext = createContext(null);

export const MineContextProvider = (props) => {
  const { children } = props; // Destructure children from props






const contextValue = {

};


  return (
    <MineContext.Provider value={contextValue}>{children}</MineContext.Provider>
  );
};

// PropTypes validation for MineContextProvider props
MineContextProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate children prop
};
