import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext/AuthContext";
import { MineContext } from "../MineContext/MineContext";
import MineHelmet from "../MineHelmet";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentDay = currentDate.getDate();
// const currentHours = currentDate.getHours();
// const currentMinutes = currentDate.getMinutes();
// const currentSeconds = currentDate.getSeconds();
// const currentMilliseconds = currentDate.getMilliseconds();
// let numberedMonth = +`${currentYear}${currentMonth}`;
let numberedDay = +`${currentYear}${currentMonth}${currentDay}`;

const ReferralProfile = () => {
  console.log("cookies", document.cookie); // This will list all the cookies available to the client

  const {
    logout,
    isLoggedIn,
    getStoredUserObj,
    getStoredToken,
    setPageTitle,
    APP_NAME,
  } = useContext(AuthContext);

  const {
    API_MineBase_url,
    API_AuthBase_url,
    viewingReferral,
  } = useContext(MineContext);

  const [isLoading, setIsLoading] = useState(false);
  const isToDay = useRef(true);

  const [referrals, setReferrals] = useState(0); // State for referral count
  const [qaulifiedReferrals, setQaulifiedReferrals] = useState(0); // State for referral count

  const navigate = useNavigate(); // Hook to navigate programmatically
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }

    if (!viewingReferral._id) {
      navigate(`../referrals`);
    }
  }, [isLoggedIn, navigate]);

  const goto = (path) => {
    navigate(`./${path}`);
  };

  useEffect(() => {
    setPageTitle("REF STATS");
    return () => {};
  }, [setPageTitle]);

   const [balance, setBalance] = useState({});
  const [User, setUser] = useState({});
  useEffect(() => {
    setUser(getStoredUserObj()); // Log after setting the user
  }, [getStoredUserObj]);

  const { _id } = useParams();
  console.log("_id", _id);
  console.log("viewingReferral", viewingReferral);
  console.log(
    "viewingReferral?.referred?.userTitle?.toUpperCase()",
    viewingReferral?.referred?.userTitle?.toUpperCase()
  );
  // ${viewingReferral?.referred?.userTitle?.toUpperCase()
  //////////////
  // Fetch tasks data
  // const fetchData = async () => {
  //   setIsLoading(true);
  //       let URL1 = `${API_MineBase_url}api/a/v1.00/balance`;
  //       let URL2 = `${API_AuthBase_url}api/a/v1.00/referraltask`;
  //   try {
  //     const URL = URL1;
  //     console.log("URL URL", URL);
  //     const response = await fetch(URL, {
  //       method: "GET",
  //       credentials: "include", // Include cookies in the request
  //       headers: {
  //         "Content-Type": "application/json",
  //         authorization: `Bearer ${getStoredToken()}`,
  //       },
  //     });

  //     const MyData = await response.json();

  //     if (MyData.status === "success" && MyData.data) {
  //       console.log("MyData.data");
  //       console.log(MyData.data);
  //     } else {
  //       throw new Error(MyData.message);
  //     }
  //   } catch (error) {
  //     console.error("Request failed:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  //////////////

  const fetchData = async () => {
    console.log("URL2 bbb");

    setIsLoading(true);

    try {
      let URL1 = `${API_MineBase_url()}api/a/v1.00/balance/myrefbalance/${viewingReferral._id}`;
      let URL2 = `${API_AuthBase_url()}api/a/v1.00/referraltask/myrefreferraltask/${viewingReferral._id}`;
      console.log("URL1 ", URL1);
      console.log("URL2 ", URL2);
      const [balanceResponse, referralResponse] = await Promise.all([
        fetch(URL1, {
          method: "GET",
          credentials: "include", // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${getStoredToken()}`,
          },
        }),

        fetch(URL2, {
          method: "GET",
          credentials: "include", // Include cookies in the request
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${getStoredToken()}`,
          },
        }),
      ]);

      const balanceData = await balanceResponse.json();
      const referralData = await referralResponse.json();
      if (balanceData.status === "success" && balanceData.data) {
        console.log("balanceData.data", balanceData.data);
        console.log("numberedDay", numberedDay);
        console.log("balanceData.data.Day", balanceData.data.Day);
        console.log(
          "numberedDay === balance.Day",
          numberedDay === balanceData.data.Day
        );

        isToDay.current = numberedDay === balanceData.data.Day;
        console.log("balanceData.data", balanceData.data);
        setBalance(balanceData.data); // Update balance state
      } else {
        throw new Error(balanceData.message);
      }

      if (referralData.status === "success" && referralData.data) {
        setReferrals(referralData.data.totalReferrals || 0); // Update referral count
        setQaulifiedReferrals(referralData.data.qaulifiedReferrals || 0); // Update referral count

        console.log(
          "referralData.data.totalReferrals",
          referralData.data.totalReferrals
        );
      } else {
        throw new Error(referralData.message);
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
      // Swal.fire(error.message);
      console.error("Request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  let tempFetchData = useRef();
  tempFetchData.current = fetchData;
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Skip the first render
      return;
    }
    console.log("USE EFFECT RAN");
    // fetchData()
    // console.log("USE EFFECT RRRAN2");

    tempFetchData.current();
  }, [User]);

  return (
    <>
      <MineHelmet
        pageDescription={`Welcome to ${APP_NAME.toLowerCase()} mining dashboard page where you see all your mining data`}
        pageName="addymine"
        pageTitle={`${APP_NAME}- Mining dashboard`}
      />
      <section className="flex justify-center items-center mx-6 mb-6 mt-10">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          <div className="bg-[var(--container-bg-color)] w-full px-4 flex-grow min-h-16 flex-col flex justify-center items-center rounded-md">
            <h1 className="w-full text-center mt-5 m-0 text-[var(--highlight-color)] text-2xl">
              {`${viewingReferral?.referred?.userTitle?.toUpperCase() || ""} 
              ${viewingReferral?.referred?.firstName?.toUpperCase() || ""} 
              ${viewingReferral?.referred?.middleName?.toUpperCase() || ""} 
              ${viewingReferral?.referred?.lastName?.toUpperCase() || ""}`}
            </h1>
            <p className=" w-full text-center mb-2 px-3">
              Stats for the month{" "}
            </p>
          </div>
        </div>
      </section>

      {isLoading && (
        <div className="flex justify-center items-center my-10">
          <BeatLoader color="#ffffff" loading={isLoading} size={8} />
        </div>
      )}

      <section className="flex justify-center items-center mx-6 mb-14">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          {/* w-full */}
          <div className="basis-80 flex-grow flex gap-6 justify-center flex-wrap">
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              TQR:
              <p
                className="text-[var(--highlight-color)]"
                title="Referrals who have completed the minimun 5 referal task"
              >
                <b
                  className={
                    qaulifiedReferrals >= 10
                      ? "text-[var(--good)]"
                      : "text-[var(--bad)]"
                  }
                >
                  {" "}
                  {qaulifiedReferrals || 0}
                </b>
              </p>
            </div>
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              Referrals:
              <p className="text-[var(--highlight-color)]">
                <b>{referrals || 0}</b>
              </p>
            </div>
          </div>
          <div className="basis-80 flex-grow flex gap-6 justify-center flex-wrap">
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              VIPB:
              <p className="text-[var(--highlight-color)]">
                {balance.monthsVIPbonus || 0}
              </p>
            </div>
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              TMRS:
              <p className="text-[var(--highlight-color)]">
                {balance.TotalMainCoins + balance.TotalBonusCoins || 0}
              </p>
            </div>
          </div>
          {/*  */}

          {/* w-full */}
          <div className="basis-80 flex-grow flex gap-6 justify-center flex-wrap">
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              TMLB:
              <p>
                <b
                  className={
                    qaulifiedReferrals <= 50
                      ? "text-[var(--good)]"
                      : "text-[var(--bad)]"
                  }
                >
                  {" "}
                  {balance.TotalLostBonus || 0}
                </b>
              </p>
            </div>
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              TMRBS:
              <p className="text-[var(--highlight-color)]">
                {balance.TotalBonusCoins || 0}
              </p>
            </div>
          </div>
          <div className="basis-80 flex-grow flex gap-6 justify-center flex-wrap">
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              TMSM:
              <p className="text-[var(--highlight-color)]">
                {balance.TotalMainCoins || 0}
              </p>
            </div>
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              TMCT:
              <p className="text-[var(--highlight-color)]">
                {balance.TotalTaskCompleted || 0}
              </p>
            </div>
          </div>
          {/*  */}

          <div className="basis-80 flex-grow flex gap-6 justify-center flex-wrap">
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              TCT:
              <p
                className={
                  balance.dailyTaskCompleted > 9
                    ? "text-[var(--good)]"
                    : "text-[var(--bad)]"
                }
              >
                {(isToDay.current && balance.dailyTaskCompleted) || 0}
              </p>
            </div>
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              TRBS:
              <p className="text-[var(--highlight-color)]">
                {(isToDay.current && balance.dailyBonusCoins) || 0}
              </p>
            </div>
          </div>
          <div className="basis-80 flex-grow flex gap-6 justify-center flex-wrap">
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              TSM:
              <p className="text-[var(--highlight-color)]">
                {(isToDay.current && balance.dailyMainCoins) || 0}
              </p>
            </div>
            <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
              TRS:
              <p className="text-[var(--highlight-color)]">
                {(isToDay.current &&
                  balance.dailyMainCoins + balance.dailyBonusCoins) ||
                  0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex justify-center items-center mx-6 mb-14">
        <div className="cards-container max-w-[850px] flex-wrap w-full justify-center">
          <div className="bg-[var(--container-bg-color)] flex-col flex-grow min-h-16 flex justify-center items-center rounded-md pt-4 ">
            <h3 className="w-full text-center text-[var(--highlight-color)]">
              ABBREVIATION MEANINGS
            </h3>
            <div className="w-full flex justify-center items-center flex-wrap">
              <div className="basis-56 flex flex-grow flex-wrap">
                <p className="basis-28 flex-grow m-5">
                  <b>SSTBV:</b> Staged Shares To Be Valued (TMRS for last month
                  waiting to be valued)
                </p>
                <p className="basis-28 flex-grow m-5">
                  <b>TMRBS:</b> This Month&rsquo;s Referral Bonus Shares (sums
                  all referral bonuses)
                </p>
              </div>
              <div className="basis-56 flex flex-grow flex-wrap">
                <p className="basis-28 flex-grow m-5">
                  <b>TMSM:</b> This Month&rsquo;s Shares Minings
                </p>
                <p className="basis-28 flex-grow m-5">
                  <b>TMRS:</b> This Month&rsquo;s Running Shares
                  (TMRS=TMSM+TMRBS)
                </p>
              </div>
            </div>
            {/*  */}
            <div className="w-full flex justify-center items-center flex-wrap">
              <div className="basis-56 flex flex-grow flex-wrap">
                <p className="basis-28 flex-grow m-5">
                  <b>TCT:</b> Tasks completed today (minimum 10 tasks daily or
                  lose bonus for the day)
                </p>
                <p className="basis-28 flex-grow m-5">
                  <b>TRBS:</b> Today&rsquo;s Referral Bonus Shares (sums all
                  referral bonuses)
                </p>
              </div>
              <div className="basis-56 flex flex-grow flex-wrap">
                <p className="basis-28 flex-grow m-5">
                  <b>TSM:</b> Today&rsquo;s Shares Minings
                </p>
                <p className="basis-28 flex-grow m-5">
                  <b>TRS:</b> Today&rsquo;s Running Shares (TRS=TSM+TRBS)
                </p>
              </div>
            </div>
            {/*  */}
            <div className="w-full flex justify-center items-center flex-wrap">
              <div className="basis-56 flex flex-grow flex-wrap">
                <p className="basis-28 flex-grow m-5">
                  <b>TQR:</b> Total Qualified Referrals (minimum 10 needed to
                  become a VIP partner)
                </p>
                <p className="basis-28 flex-grow m-5">
                  <b>VIPB:</b> VIP Bonus shares (extra 10% bonus of staged
                  shares)
                </p>
              </div>
              <div className="basis-56 flex flex-grow flex-wrap">
                <p className="basis-28 flex-grow m-5">
                  <b>TMCT:</b> This Month&rsquo;s Completed Tasks
                </p>
                <p className="basis-28 flex-grow m-5">
                  <b>TMLB:</b> This Month&rsquo;s Lost Bonuses
                </p>
              </div>
            </div>
            {/*  */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ReferralProfile;
