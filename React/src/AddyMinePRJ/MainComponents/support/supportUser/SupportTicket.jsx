import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { BeatLoader } from "react-spinners";

import { AuthContext } from "../../../../AuthContext/AuthContext";
import { MineContext } from "../../../MineContext/MineContext";
import MineHelmet from "../../../MineHelmet";
import SupportTicketsPresentation from "./SupportTicketPresentation";

const SupportTicket = () => {
  const { isLoggedIn, getStoredUserObj, getStoredToken, setPageTitle } =
    useContext(AuthContext);
  const { API_supportBase_url, supportTickets, setSupportTickets } =
    useContext(MineContext);

  const [isLoading, setIsLoading] = useState(false);
  const [User, setUser] = useState({});
//   const [supportTickets, setSupportTickets] = useState([]);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate]);

  // Set page title and fetch user details on mount
  useEffect(() => {
    setPageTitle("SUPPORT TICKET");
    setUser(getStoredUserObj());
  }, [getStoredUserObj, setPageTitle]);

  // Fetch support tickets data
  const fetchData = async () => {
    setIsLoading(true);
    try {
        const URL = `${API_supportBase_url()}api/a/v1.00/supportticket`;
        console.log("supportticketURL", URL);
      const response = await fetch(URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${getStoredToken()}`,
        },
      });
      console.log("response", response);
        const data = await response.json();
      if (data.status === "success" && data.data) {
        console.log("Fetched Support Tickets:", data.data);
          setSupportTickets(data.data);
          console.log("supportTickets", supportTickets);
      } else {
        throw new Error(data.message || "Failed to fetch support tickets.");
      }
    } catch (error) {
    //   Swal.fire(
    //     "Error",
    //     error.message || "An error occurred. Please try again later.",
    //     "error"
    //   );
      console.error("Request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <MineHelmet
        pageDescription="Welcome to Addysmart mining support ticket page where you can view all available support tickets."
        pageName="addymine/supportticket"
        pageTitle="Addysmart - Support Tickets"
      />
      <section className="flex justify-center items-center mx-6 mb-6 mt-10">
        <div className="cards-container flex max-w-[850px] flex-wrap w-full justify-center gap-6">
          <div className="bg-[var(--container-bg-color)] w-full flex-grow min-h-16 flex-col flex justify-center items-center rounded-md">
            <h1 className="w-full text-center mt-5 m-0 text-[var(--highlight-color)] text-2xl">
              {`${User.userTitle?.toUpperCase() || "User"} 
              ${User.firstName?.toUpperCase() || ""} 
              ${User.lastName?.toUpperCase() || ""}`}
              {User.isVIP && <em className="text-[var(--good)]"> (VIP)</em>}
            </h1>
            <p className="w-full text-center m-2">
              <b
                onClick={fetchData}
                className="bg-[var(--accent-color)] p-1 px-2 rounded cursor-pointer"
              >
                Reload Tickets
              </b>
            </p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center items-center mt-10">
          <BeatLoader color="#ffffff" loading={isLoading} size={8} />
        </div>
      ) : supportTickets && supportTickets.length > 0 ? (
        supportTickets.map((ticket) => (
          <div key={ticket._id} className="ticket-item">
            <SupportTicketsPresentation
              supportticket={ticket}
              onOpenTicket={() => navigate(`../ticketchat/${ticket._id}`)}
            />
          </div>
        ))
      ) : (
        <div className="flex justify-center items-center mt-10">
          You have no support ticket yet.
        </div>
      )}
    </>
  );
};

export default SupportTicket;
