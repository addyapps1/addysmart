import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
import "./libServices.module.css";

// Lazy loading components
const MiningServiceHeader = lazy(
  () => import("./HeaderComponents/LibraryServiceHeader")
);


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

const AddyLib = () => {
  return (
    <>
      <MiningServiceHeader />
      <main>
        <div>AddyLib</div>
        <Suspense fallback={<MyLoading />}>
          <Routes>
            {/* <Route path="/register" element={<Register />} />
            <Route path="/resetpass" element={<ResetPass />} />
            <Route path="/forgotpass" element={<ForgotPass />} />
            <Route path="/home" element={<Home />} />
            <Route path="/*" element={<Login />} /> */}
          </Routes>
        </Suspense>
      </main>
    </>
  );
};

export default AddyLib