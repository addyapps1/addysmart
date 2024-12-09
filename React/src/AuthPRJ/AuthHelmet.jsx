import React from "react";
import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

const AuthHelmet = ({
  pageDescription = "We provide opportunities for earning through completing simple tasks, like mining shares, referral benefits, etc. In addition to other services",
  pageName = '',
  pageTitle = "Addyapps",
  ogImage = "/serviceLogos/addyapps-high-resolution-logo.png", // Dynamic image prop
}) => {
  if (!pageName) {
    console.error("pageName is required for constructing the URL.");
    return null; // Return null or a fallback component if pageName is missing
  }

  return (
    <Helmet>
      <link rel="icon" href="/serviceLogos/addyapps-high-resolution-logo.png" />
      <meta
        name="description"
        content="Together is the key, Let's win together"
      />
      <meta property="og:title" content={pageTitle} />
      <meta
        property="og:description"
        content="Together is the key, Let's win together"
      />
      <meta property="og:image" content={ogImage} /> {/* Dynamic image */}
      <meta
        property="og:url"
        // content={`https://addysmart.onrender.com/${pageName}`}
        content={`https://addyapps.com/${pageName}`}
      />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="Addyapps" />
      <title>{pageTitle}</title>
    </Helmet>
  );
};

// PropTypes for type checking
AuthHelmet.propTypes = {
  pageDescription: PropTypes.string,
  pageName: PropTypes.string.isRequired,
  pageTitle: PropTypes.string,
  ogImage: PropTypes.string,
};

export default AuthHelmet;
