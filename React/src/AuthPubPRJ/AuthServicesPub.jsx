import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
// import "./authServices.module.css";



// Lazy loading components
const AuthServiceHeaderPub = lazy(() => import("./AuthServicePubHeader"));
const Login = lazy(() => import("./Login"));
const ForgotPass = lazy(() => import("./ForgotPass"));
const Register = lazy(() => import("./Register"));
const ResetPass = lazy(() => import("./ResetPass"));


// Loading spinner component
const MyLoading = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <BallTriangle
        height={100}
        width={100}
        color="#4fa94d"
        ariaLabel="loading-indicator"
      />
    </div>
  );
};

const AuthServicesPub = () => {


    return (
      <>
        <AuthServiceHeaderPub />
        <main>
          <Suspense fallback={<MyLoading />}>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/resetpass" element={<ResetPass />} />
              <Route path="/forgotpass" element={<ForgotPass />} />
              <Route path="/*" element={<Login />} />
            </Routes>
          </Suspense>
        </main>
      </>
    );


};

export default AuthServicesPub;
