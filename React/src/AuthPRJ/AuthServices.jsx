import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
// import "../index.css";
import ProfileUpdate from "./ProfileUpdate";
import ChangePassword from "./ChangePassword";



// Lazy loading components
const AuthServiceHeader = lazy(() => import("./AuthServiceHeader"));
const AuthSidebar = lazy(() => import("./AuthSidebar"));
const Home = lazy(() => import("./Home"));

// Loading spinner component
const MyLoading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <BallTriangle
        height={100}
        width={100}
        color="#4fa94d"
        ariaLabel="loading-indicator"
      />
    </div>
  );
};

const AuthServices = () => {


    return (
      <>
        <AuthServiceHeader />
        <AuthSidebar />
        <main>
          <Suspense fallback={<MyLoading />}>
            <Routes>
              <Route path="/profileupdate" element={<ProfileUpdate />} />
              <Route path="/changepassword" element={<ChangePassword />} />
              {/* Catch-all Route */}
              <Route path="/*" element={<Home />} />
            </Routes>
          </Suspense>
        </main>
      </>
    );


};

export default AuthServices;
