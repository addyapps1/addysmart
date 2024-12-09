import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
import "./libServices.module.css";

// Lazy loading components
const LibServiceHeader = lazy(
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
      <LibServiceHeader />
      <main>
        <section className="flex justify-center items-center mx-6 mb-14">
          <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
            <div className="bg-[var(--container-bg-color)] basis-80 flex-grow min-h-16 flex justify-center items-center rounded-md">
              This service is still under development
            </div>
          </div>
        </section>
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