import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext/AuthContext";
import { MineContext } from "../MineContext/MineContext";
import ReferralsPresentation from "./ReferralsPresentation";
import Pagination from "../../Pagination";
import MineHelmet from "../MineHelmet";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";

const Referrals = () => {
  const {logout,
    isLoggedIn,
    getStoredUserObj,
    getStoredToken,
    setPageTitle,
    APP_NAME,
  } = useContext(AuthContext);



  const {
    API_AuthBase_url,
    referrals,
    setReferrals,
    viewingReferral,
    setViewingReferral,
  } = useContext(MineContext);

  const [isLoading, setIsLoading] = useState(false);
  const [User, setUser] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [RecordsEstimate, setRecordsEstimate] = useState(0);
  const itemsPerPage = 12;
  let tempFetchData = useRef();

  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate]);

  // Set the page title to "REFERRALS"
  useEffect(() => {
    setPageTitle("REFERRALS");
  }, [setPageTitle]);

  // Get stored user info and set User state
  useEffect(() => {
    const user = getStoredUserObj();
    setUser(user);
    console.log("User.referalID", user.referalID);
  }, [getStoredUserObj]);

  const viewReferral = (rUser) => {
    if (!rUser) {
      console.error("No referral User provided");
      return;
    }

    setViewingReferral(rUser);
    navigate(`../referralprofile/${rUser?.referred?._id}`);
  };


  // Fetch referrals data
  const fetchData = async () => {
    if (!User.referalID) return; // Ensure User is updated before fetching
    setIsLoading(true);
    console.log("Fetching data for user:", User);
    try {
      const URL1 = `${API_AuthBase_url()}api/a/v1.00/referral/user?page=${currentPage}&limit=${itemsPerPage}`;
      const response = await fetch(URL1, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getStoredToken()}`,
        },
      });

      const ReferralsData = await response.json();
      if (ReferralsData.status === "success" && ReferralsData.data) {
        setReferrals(ReferralsData.data);
        console.log("ReferralsData", ReferralsData);
        setRecordsEstimate(ReferralsData.RecordsEstimate || 0);
      } else {
        throw new Error(ReferralsData.message);
      }
    } catch (error) {
      if (
        error == "Error: jwt expired" ||
        error == "Error: Device mismatch. Please login again"
      ) {
        Swal.fire("Your login expired, please login again.");
        logout();
        navigate(`/`);
      }
      console.error("Request failed:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  tempFetchData.current = fetchData;

  // Trigger fetchData when currentPage or User changes
  useEffect(() => {
    if (User.referalID) {
      tempFetchData.current();
    }
  }, [currentPage, User.referalID]);

  // Navigation function
  // const goto = (path) => {
  //   navigate(`./${path}`);
  // };

  return (
    <>
      <MineHelmet
        pageDescription={`Welcome to ${APP_NAME.toLowerCase()} mining referrals page, where you see data about your referrals`}
        pageName="addymine/referrals"
        pageTitle={`${APP_NAME} - Mining referrals`}
      />

      <section className="flex justify-center items-center mx-6 mb-6 mt-10">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          <div className="bg-[var(--container-bg-color)] w-full flex-grow min-h-16 flex-col flex justify-center items-center rounded-md">
            <h1 className="w-full text-center mt-5 m-0 text-[var(--highlight-color)] text-2xl">
              {`${User.userTitle?.toUpperCase() || "User"} 
              ${User.firstName?.toUpperCase() || "Unknown"} 
              ${User.lastName?.toUpperCase() || "User"}`}
            </h1>
            <p className="w-full text-center mb-2">Referrals</p>
          </div>
        </div>
      </section>

      {/* Display referrals */}
      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <BeatLoader color="#ffffff" loading={isLoading} size={8} />
        </div>
      ) : referrals.length > 0 ? (
        referrals.map((referral) => (
          <div key={referral._id} className="task-item">
            <ReferralsPresentation
              rUser={referral}
              viewReferral={viewReferral}
            />
          </div>
        ))
      ) : (
        <p className="text-center">No referrals found.</p>
      )}

      {/* Pagination */}
      {RecordsEstimate > 0 && (
        <Pagination
          totalPages={Math.ceil(RecordsEstimate / itemsPerPage) || 1}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
};

export default Referrals;
