import React, { useContext, useEffect, useState } from 'react';
import { authDataContext } from '../context/AuthContext';
import axios from 'axios';
import { socket } from '../context/SocketContext';
import { userDataContext } from '../context/userContext';
import { useNavigate } from 'react-router-dom';

import { Button } from './ui/Button';
import { UserPlus, UserMinus, UserCheck, Clock, UserX } from 'lucide-react';
import { toast } from 'react-toastify';

function ConnectionButton({ userId }) {
  let { serverUrl } = useContext(authDataContext);
  let { userData } = useContext(userDataContext);
  let [status, setStatus] = useState("connect");
  let [loading, setLoading] = useState(false);
  let navigate = useNavigate();

  const handleSendConnection = async () => {
    try {
      setLoading(true);
      await axios.post(`${serverUrl}/api/connection/send/${userId}`, {}, { withCredentials: true });
      setStatus("pending");
      toast.success("Connection request sent");
    } catch (error) {
      toast.error("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      setLoading(true);
      await axios.delete(`${serverUrl}/api/connection/remove/${userId}`, { withCredentials: true });
      setStatus("connect");
      toast.success("Connection removed");
    } catch (error) {
      toast.error("Failed to remove connection");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawConnection = async () => {
    try {
      setLoading(true);
      await axios.delete(`${serverUrl}/api/connection/withdraw/${userId}`, { withCredentials: true });
      setStatus("connect");
      toast.success("Request withdrawn");
    } catch (error) {
      toast.error("Failed to withdraw request");
    } finally {
      setLoading(false);
    }
  };

  const handleGetStatus = async () => {
    try {
      let result = await axios.get(`${serverUrl}/api/connection/getStatus/${userId}`, { withCredentials: true });
      setStatus(result.data.status || "connect");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetStatus();

    const handleStatusUpdate = ({ updatedUserId, newStatus }) => {
      if (updatedUserId === userId) {
        setStatus(newStatus || "connect");
      }
    };

    socket.on("statusUpdate", handleStatusUpdate);

    return () => {
      socket.off("statusUpdate", handleStatusUpdate);
    };
  }, [userId]);

  const handleClick = async () => {
    if (status === "disconnect") {
      await handleRemoveConnection();
    } else if (status === "pending") {
      await handleWithdrawConnection();
    } else if (status === "received") {
      navigate("/network");
    } else {
      await handleSendConnection();
    }
  };

  const getButtonConfig = () => {
    switch (status) {
      case "disconnect":
        return { variant: "outline", icon: <UserMinus className="w-4 h-4 mr-2" />, text: "Remove", className: "hover:bg-destructive/10 hover:text-destructive hover:border-destructive" };
      case "pending":
        return { variant: "secondary", icon: <UserX className="w-4 h-4 mr-2" />, text: "Withdraw", className: "hover:bg-destructive/10 hover:text-destructive hover:border-destructive" };
      case "received":
        return { variant: "primary", icon: <UserCheck className="w-4 h-4 mr-2" />, text: "Accept", className: "" };
      case "connect":
      default:
        return { variant: "outline", icon: <UserPlus className="w-4 h-4 mr-2" />, text: "Connect", className: "" };
    }
  };

  const config = getButtonConfig();

  return (
    <Button 
      variant={config.variant} 
      className={config.className} 
      onClick={handleClick} 
      disabled={loading}
      isLoading={loading}
      size="sm"
    >
      {config.icon}
      {config.text}
    </Button>
  );
}

export default ConnectionButton;
