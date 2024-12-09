// src/pages/HomePage.js

import { useNavigate } from "react-router-dom"; // Import useNavigate
import Card from "./Card"; // Ensure correct import path for Card
import { Suspense, lazy, useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthContext/AuthContext";
import AuthHelmet from "./AuthHelmet";

// const EmailVerification = lazy(() => import("./EmailVerification"));
const EmailVerification = lazy(() => import("./EmailVerification"));

const Home = () => {
  const { isLoggedIn, getStoredUserObj, setPageTitle, APP_NAME } =
    useContext(AuthContext);
  

  const navigate = useNavigate(); // Hook to navigate programmatically
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    setPageTitle("HOME");
    return () => {};
  }, [setPageTitle]);

  const [User, setUser] = useState({});
  useEffect(() => {
    setUser(getStoredUserObj()); // Log after setting the user
  }, [getStoredUserObj]);

  const services = [
    {
      title: "ADDY MINE",
      description: "Earn real money online with ease",
      path: "/addymine",
      image: "/serviceLogos/addy-mining-high-resolution-logo.png", // Correct image path
    },
    // {
    //   title: "ADDY LIBRARY",
    //   description: "The best e-resources",
    //   path: "/addylibs",
    //   image: "/serviceLogos/shopaddy_logo.png", // Correct image path
    // },
  ];




  return (
    <>
      <AuthHelmet
        pageDescription={`Welcome to  ${APP_NAME.toLowerCase()} home page, where you can find our applications and sellect which application you need.`}
        pageName="home"
        pageTitle={`${APP_NAME} - home page`}
      />

      <div className="flex justify-center items-center flex-wrap">
        <h1 className="w-full text-3xl text-center my-5">
          <strong>WELCOME TO ADDYAPPS </strong>
        </h1>

        <h3 className="w-full text-center my-5 m-0 ">
          <b className="text-[var(--highlight-color)]">
            {`${User.userTitle && User.userTitle.toUpperCase()} 
              ${User.firstName && User.firstName.toUpperCase()} 
              ${User.lastName && User.lastName.toUpperCase()},`}
          </b>
          <br />
          PLEASE SELECT A SERVICE BELOW
        </h3>

        <div className="cards-container flex max-w-[850px] flex-wrap justify-center">
          {services.map((service) => (
            <Card
              key={service.title}
              title={service.title}
              description={service.description}
              image={service.image}
              onClick={() => navigate(service.path)} // Pass onClick to navigate
            />
          ))}
        </div>
        {/* Lazy load the EmailVerification component */}
        {!User.emailVerified && (
          <Suspense fallback={<div>Loading...</div>}>
            <EmailVerification />
          </Suspense>
        )}
      </div>
    </>
  );
};

export default Home;
