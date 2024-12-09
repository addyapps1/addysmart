import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
import { AuthContextProvider } from "./AuthContext/AuthContext";
import AddysmartFooter from "./AddysmartFooter";


const AuthServices = lazy(() => import("./AuthPRJ/AuthServices"));
const AuthServicesPub = lazy(() => import("./AuthPubPRJ/AuthServicesPub"));
const AddyLib = lazy(() => import("./AddyLibPRJ/AddyLib"));
const AddyMine = lazy(() => import("./AddyMinePRJ/AddyMine"));

const App = () => {
  const MyLoading = (
    <div className="flex items-center justify-center w-full h-[85vh] ">
      <BallTriangle
        height={100}
        width={100}
        radius={5}
        color="var(--secondary-accent-color)" // Updated variable name
        ariaLabel="ball triangle loading"
        wrapperClass=""
        wrapperStyle=""
        visible={true}
      />
    </div>
  );

  return (
    <AuthContextProvider>
      <Router>
        <Suspense fallback={MyLoading}>
          <Routes>
            <Route path="/addylibs/*" element={<AddyLib />} />
            <Route path="/addymine/*" element={<AddyMine />} />
            <Route path="/in/*" element={<AuthServices />} />
            <Route path="/*" element={<AuthServicesPub />} />
          </Routes>
        </Suspense>
      </Router>
      <AddysmartFooter />
    </AuthContextProvider>
  );
};

export default App;
