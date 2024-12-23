import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { BallTriangle } from "react-loader-spinner";
import { MineContextProvider } from "./MineContext/MineContext";
import "./miningServices.module.css";
import MiningSidebar from "./MiningSidebar";
import Support from "./MainComponents/support/support";

// Lazy loading components
const MiningServiceHeader = lazy(
  () => import("./HeaderComponents/MiningServiceHeader")
);
const ReferralProfile = lazy(() => import("./MainComponents/ReferralProfile"));
const MineHome = lazy(() => import("./MainComponents/MineHome"));
const Tasks = lazy(() => import("./MainComponents/Tasks"));
const ManageTasks = lazy(() => import("./MainComponents/ManageTasks"));
const ManageBalance = lazy(() => import("./MainComponents/ManageBalance"));
const Referrals = lazy(() => import("./MainComponents/Referrals"));

const MineFAQ = lazy(() => import("./MainComponents/MineFAQ"));
const SupportTicketChat = lazy(
  () => import("./MainComponents/support/supportUser/SupportTicketChats")
);
const SupportTicket = lazy(
  () => import("./MainComponents/support/supportUser/SupportTicket")
);
//
const SupportTicketChatAdmin = lazy(
  () => import("./MainComponents/support/supportAdmin/SupportTicketChatsAdmin")
);
const SupportTicketAdmin = lazy(
  () => import("./MainComponents/support/supportAdmin/SupportTicketAdmin")
);

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

const AddyMine = () => {
  return (
    <MineContextProvider>
      <Suspense fallback={<MyLoading />}>
        <MiningServiceHeader />
        <MiningSidebar />
        <main>
          <Routes>
            {/* <Route path="/supportadmin" element={<SupportAdmin />} /> */}
            <Route
              path="/ticketchatadmin/:ticketID"
              element={<SupportTicketChatAdmin />}
            />

            <Route
              path="/supportticketadmin"
              element={<SupportTicketAdmin />}
            />
            <Route
              path="/ticketchat/:ticketID"
              element={<SupportTicketChat />}
            />
            <Route path="/referralprofile/:_id" element={<ReferralProfile />} />

            <Route path="/supportticket" element={<SupportTicket />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/managebalance" element={<ManageBalance />} />
            <Route path="/managetasks" element={<ManageTasks />} />
            <Route path="/faq" element={<MineFAQ />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/*" element={<MineHome />} />
          </Routes>
        </main>
        <Support />
      </Suspense>
    </MineContextProvider>
  );
};

export default AddyMine;
