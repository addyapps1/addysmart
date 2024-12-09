import React from "react";
import { Helmet } from "react-helmet";
// import myImage from "../src_imgs/dog1.jpeg";

// npm install react-helmet

const MineHelmet = ({ pageDescription, pageName, pageTitle }) => {
  return (
    <Helmet>
      <link
        rel="icon"
        href="/serviceLogos/addy-mining-high-resolution-logo.png"
      />

      <meta name="description" content={pageDescription} />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {/* <meta property="og:image" content={myImage} /> */}
      <meta
        property="og:image"
        content={"/serviceLogos/addy-mining-high-resolution-logo.png"}
      />
      <meta
        property="og:url"
        content={`https://addysmart.onrender.com/${pageName}`}
      />

      {/* <!--[INIT] Open Graph protocol  --> */}
      <meta property="og:title" content="ADDYSMART" />
      <meta property="og:type" content="Website" />

      <meta property="og:local" content="en_US" />
      <meta property="og:site_name" content="addysmart" />
      {/* <!-- [END] Open Graph protocol --> */}
      
      <title>{pageTitle}</title>
    </Helmet>
  );
};

export default MineHelmet;
