import { createContext} from "react";
import PropTypes from "prop-types";

export const LibContext = createContext(null);

export const LibContextProvider = (props) => {
  const { children } = props; // Destructure children from props






const contextValue = {

};


  return (
    <LibContext.Provider value={contextValue}>{children}</LibContext.Provider>
  );
};

// PropTypes validation for LibContextProvider props
LibContextProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validate children prop
};
