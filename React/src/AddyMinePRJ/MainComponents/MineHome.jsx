import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext/AuthContext";
import { MineContext } from "../MineContext/MineContext";
import MineHelmet from "../MineHelmet";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";

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

const MineHome = () => {
  console.log("cookies", document.cookie); // This will list all the cookies available to the client

  const {
    logout,
    isLoggedIn,
    getStoredUserObj,
    getStoredToken,
    CLIENT_base_url,
    setPageTitle,
    APP_NAME,
  } = useContext(AuthContext);


  const {
    API_MineBase_url,
    API_AuthBase_url,
    balance,
    setBalance,
    openUserSupportModal,
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
  }, [isLoggedIn, navigate]);

  const goto = (path) => {
    navigate(`./${path}`);
  };

  useEffect(() => {
    setPageTitle("DASHBOARD");
    openUserSupportModal();
    return () => {};
  }, [setPageTitle]);

  const [User, setUser] = useState({});
  useEffect(() => {
    setUser(getStoredUserObj()); // Log after setting the user
  }, [getStoredUserObj]);

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
      let URL1 = `${API_MineBase_url()}api/a/v1.00/balance`;
      let URL2 = `${API_AuthBase_url()}api/a/v1.00/referraltask`;
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
    console.log("USE EFFECT RRRAN");
    // fetchData()
    // console.log("USE EFFECT RRRAN2");

    tempFetchData.current();
  }, [User]);

  const [copySuccess, setCopySuccess] = useState("");
  const copyToClipboard = () => {
    const referralLink = `${CLIENT_base_url()}?refId=${User.referalID}`; // Replace with your actual referral link
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setCopySuccess("Link Copied! 🎉");
        // Revert the copied state after 10 seconds
        setTimeout(() => {
          setCopySuccess("");
        }, 10000); // 10 seconds
      })
      .catch(() => {
        setCopySuccess("Failed to copy!");
      });
  };

    const copyReferralInvitationStatus = () => {
      // Check if essential variables are available
      if (!CLIENT_base_url() || !User?.referalID) {
        setCopySuccess("Referral link is not available!");
        return;
      }

      // Create the referral message
      const referralMessage = `
🌟 Hey there, friend!, Make Your Free Time Pay! 🌟
💰 Earn real cash promoting YouTube channels & brands!
🎯 Simple, fun tasks = Real rewards!

I’m already earning—join me now & start too! 🚀 
📲 ${CLIENT_base_url()}?refId=${User.referalID}  

✨ Don’t miss out! Let’s grow & earn together! 🎉
  `;

      // Attempt to copy the referral message to the clipboard
      navigator.clipboard
        .writeText(referralMessage)
        .then(() => {
          setCopySuccess("status promo Copied! 🎉");
          // Reset after 10 seconds
          setTimeout(() => {
            setCopySuccess("");
          }, 10000);
        })
        .catch(() => {
          setCopySuccess("Failed to copy!");
        });
    };

  const copyReferralInvitationMessage = () => {
    // Check if essential variables are available
    if (!CLIENT_base_url() || !User?.referalID) {
      setCopySuccess("Referral link is not available!");
      return;
    }

    // Create the referral message
    const referralMessage = `
🌟 Hey there, friend! 🌟

I’ve just discovered this amazing app called **AddyApps**. Here’s why you’ll love it:
✅ Earn real money by completing simple and fun tasks geared towards promoting YouTube channels and brands and share in the rewards.

It’s easy, rewarding, and a great way to make the most of your free time. 🎉  
Join me and start earning today! Here’s my referral link:  
📲 ${CLIENT_base_url()}?refId=${User.referalID}  

Let’s earn together while supporting creativity online! 💰🚀
  `;

    // Attempt to copy the referral message to the clipboard
    navigator.clipboard
      .writeText(referralMessage)
      .then(() => {
        setCopySuccess("Invite Copied! 🎉");
        // Reset after 10 seconds
        setTimeout(() => {
          setCopySuccess("");
        }, 10000);
      })
      .catch(() => {
        setCopySuccess("Failed to copy!");
      });
  };

  const copyMessageToClipboard = () => {
    // Ensure CLIENT_base_url and User.referalID are defined
    if (!CLIENT_base_url() || !User?.referalID) {
      setCopySuccess("Referral link is not available!");
      return;
    }

    const referralLink = `
💰 Turn Your Free Time Into Real Cash with AddyApps! 💰

🌟 Why Join AddyApps?
✔️ Earn real money by completing simple, fun tasks with AddyMine!
✔️ No investment required—just your time and effort!
✔️ Unlock exclusive VIP benefits for even bigger rewards!
✔️ Invite your friends and enjoy amazing referral bonuses—earn while they earn!
✔️ 24/7 Support System: To help whenever you need assistance!. click on support.

🎯 How It Works:
👉 Complete tasks and earn rewards instantly.
👉 Share your referral link to grow your earnings.
👉 Upgrade to VIP for premium opportunities and perks!

🔥 Don’t miss this chance to boost your income without spending a dime.

📲 Join Now: ${CLIENT_base_url()}?refId=${User.referalID}

Your journey to effortless earnings starts here. Sign up today and let the rewards roll in! 🚀💵`;

    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
        setCopySuccess("Promo Copied! 🎉");
        // Reset after 10 seconds
        setTimeout(() => {
          setCopySuccess("");
        }, 10000);
      })
      .catch(() => {
        setCopySuccess("Failed to copy!");
      });
  };

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
              {`${User.userTitle?.toUpperCase() || ""} 
                ${User.firstName?.toUpperCase() || ""} 
                ${User.lastName?.toUpperCase() || ""} `}
              {User.isVIP && <em className="text-[var(--good)]"> (VIP)</em>}
            </h1>
            <p className=" w-full text-center mb-2 px-3">
              Mine real shares and get paid every month{" "}
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
          <div className="w-full p-0 m-0 flex justify-center flex-wrap  gap-6">
            <div className="basis-80 flex-grow flex gap-6 justify-center flex-wrap">
              <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
                Balance:
                <p
                  className={
                    balance.TotalMoneyLeft > 2
                      ? "text-[var(--good)]"
                      : "text-[var(--bad)]"
                  }
                >
                  {balance.TotalMoneyLeft || 0}
                </p>
              </div>
              <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
                Referrals:
                <p className="text-[var(--highlight-color)]">
                  <b>{referrals || 0}</b>
                </p>
              </div>
            </div>

            {User && User.role && User.role.includes("winnings") && (
              <div className="basis-80 flex-grow flex gap-6 justify-center flex-wrap">
                <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
                  DWins:
                  <p className="text-[var(--highlight-color)]">
                    {balance.dailyWonBonus ?? 0}
                  </p>
                </div>
                <div className="bg-[var(--container-bg-color)] basis-28 flex-grow min-h-16 flex flex-col justify-center items-center rounded-md">
                  MWins:
                  <p className="text-[var(--highlight-color)]">
                    {balance.TotalWonBonus ?? 0}
                  </p>
                </div>
              </div>
            )}
          </div>
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
              SSTBV:
              <p className="text-[var(--highlight-color)]">
                <b title="VIP bonus">{balance.TotalCoinsTobeValued || 0}</b>
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

      <section className="flex justify-center items-center mx-6 mb-14 hidden">
        <div className="cards-container max-w-[850px] flex-wrap w-full justify-center">
          <div className="bg-[var(--container-bg-color)] flex-grow min-h-16 flex justify-center items-center rounded-md">
            Advertise here - 10 sec skip Video Ad
          </div>
        </div>
      </section>


      <section className="flex justify-center items-center mx-6 mb-14 hidden">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          <div className="bg-[var(--container-bg-color)] basis-80 flex-grow min-h-16 flex justify-center items-center rounded-md">
            Run promotion/campaign
          </div>
          <div className="bg-[var(--container-bg-color)] basis-80 flex-grow min-h-16 flex justify-center items-center rounded-md">
            Sponsor a video
          </div>
        </div>
      </section>

      <section className="flex justify-center items-center mx-6 mb-14">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          <div
            onClick={openUserSupportModal}
            className="button text-white bg-[var(--accent-color)] basis-80 flex-grow min-h-16 flex justify-center items-center rounded-md cursor-pointer"
          >
            Get Support
          </div>
          <div
            onClick={() => goto("faq")}
            className="button text-white bg-[var(--accent-color)] basis-80 flex-grow min-h-16 flex justify-center items-center rounded-md cursor-pointer"
          >
            How to Mine
          </div>
          <div
            onClick={() => goto("tasks")}
            className="button text-white bg-[var(--accent-color)] basis-80 flex-grow min-h-16 flex justify-center items-center rounded-md cursor-pointer"
          >
            Go to Task
          </div>
        </div>
      </section>

      <section className="flex justify-center items-center mx-6 mb-14">
        <div className="cards-container max-w-[850px] flex-wrap w-full justify-center">
          <div className="bg-[var(--container-bg-color)] flex-col flex-grow min-h-16 flex justify-center items-center rounded-md pt-4 ">
            <h3 className="w-full text-center text-[var(--highlight-color)]">
              REFERRAL LINK
            </h3>

            <p className="w-full text-justify p-4 mb-2">
              <strong>Unlock Your Earning Potential!</strong> Refer a friend
              today and earn a 10% bonus on the shares they mine – every single
              day! Complete your daily tasks, and watch your rewards grow
              effortlessly. With each referral, your bonus grows bigger and
              bigger. The sky&rsquo;s the limit! Build your network now and let
              your earnings multiply. The more friends you refer, the more you
              earn – let your network work for you! Don&rsquo;t wait, start
              growing your wealth today!
            </p>
            <p className="w-full text-justify p-4 mb-2">
              <strong> Plus, unlock an incredible bonus!</strong> Invite 10
              people who complete at least 5 referral tasks, and become VIP
              partner, and you&rsquo;ll receive an extra 20% yout total monthly
              shares on top of your total monthly shares. Elevate your
              earnings—start building your VIP team today!
            </p>
            <button
              className="px-4 py-2 bg-[var(--highlight-color)] text-white rounded-md mb-2"
              onClick={copyToClipboard}
            >
              Click to Copy Referral Link
            </button>

            <button
              className="px-4 py-2 bg-[var(--highlight-color)] text-white rounded-md mb-2"
              onClick={copyReferralInvitationStatus}
            >
              Click to Copy status promo
            </button>

            <button
              className="px-4 py-2 bg-[var(--highlight-color)] text-white rounded-md mb-2"
              onClick={copyReferralInvitationMessage}
            >
              Click to Copy Referral Invitation
            </button>

            <button
              className="px-4 py-2 bg-[var(--highlight-color)] text-white rounded-md mb-2"
              onClick={copyMessageToClipboard}
            >
              Click to Copy Referral Promotion Message
            </button>
            {copySuccess && (
              <p className="text-center mb-2 text-green-500">{copySuccess}</p>
            )}
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

export default MineHome;
