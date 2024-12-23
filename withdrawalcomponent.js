import React, { useState } from "react";
import axios from "axios";

const Withdrawal = () => {
  const [amount, setAmount] = useState("");
  const [userID, setUserID] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState("");
  const [error, setError] = useState(null);

  const handleWithdrawal = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/withdrawal", { userID, amount });
      setWithdrawalStatus(
        `Withdrawal request successful! Reference: ${response.data.reference}`
      );
    } catch (err) {
      setError("Withdrawal request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkWithdrawalStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/withdrawal/status/${userID}`);
      setWithdrawalStatus(`Current status: ${response.data.status}`);
    } catch (err) {
      setError("Failed to retrieve withdrawal status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Withdrawal</h2>
      <input
        type="text"
        placeholder="User ID"
        value={userID}
        onChange={(e) => setUserID(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleWithdrawal} disabled={loading}>
        {loading ? "Processing..." : "Withdraw Now"}
      </button>

      <button onClick={checkWithdrawalStatus} disabled={loading}>
        {loading ? "Loading..." : "Check Status"}
      </button>

      {withdrawalStatus && <p>{withdrawalStatus}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Withdrawal;
