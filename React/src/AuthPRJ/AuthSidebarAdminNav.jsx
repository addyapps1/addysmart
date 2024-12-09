import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../AuthContext/AuthContext";
import { MineContext } from "./MineContext/MineContext";

const MiningSidebarAdminNav = () => {
    const { getStoredUserObj } = useContext(AuthContext);
    const { openAdminSupportModal } = useContext(MineContext);
  
    const [User, setUser] = useState({});
    useEffect(() => {
      setUser(getStoredUserObj());
    }, [getStoredUserObj]);
  
  return (
    <>
      <Link
        to="./supportticketadmin"
        className="block py-2.5 px-4 rounded hover:bg-gray-700"
      >
        SupportTickets(A)
      </Link>

      {User && User.role && User.role.includes("superAdmin") && (
        <Link
          to="./managetasks"
          className="block py-2.5 px-4 rounded hover:bg-gray-700"
        >
          ManageTask(S.A)
        </Link>
      )}
    </>
  );
};

export default MiningSidebarAdminNav;
