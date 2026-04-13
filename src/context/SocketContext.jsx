import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import { userDataContext } from './userContext';
import { authDataContext } from './AuthContext';
import axios from 'axios';

export const socketContext = createContext();

// Singleton socket — created once, shared by entire app
export const socket = io("https://linkedinbackend-jgbh.onrender.com", { autoConnect: false });

function SocketProvider({ children }) {
  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const location = useLocation();

  const [unreadNetwork, setUnreadNetwork] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(false);

  // Ref so event listeners always read the current pathname without stale closures
  const pathnameRef = useRef(location.pathname);

  // Keep pathnameRef current and clear badges when user visits the relevant page
  useEffect(() => {
    pathnameRef.current = location.pathname;
    if (location.pathname === '/network') setUnreadNetwork(false);
    if (location.pathname === '/notification') setUnreadNotifications(false);
  }, [location.pathname]);

  // Store userId in a ref so the connect handler can always read latest value
  const userIdRef = useRef(null);

  useEffect(() => {
    if (!userData?._id) {
      userIdRef.current = null;
      socket.disconnect();
      return;
    }

    userIdRef.current = userData._id;

    // --- Register on every (re)connect so userSocketMap on backend stays fresh ---
    const handleConnect = () => {
      socket.emit('register', userIdRef.current);
    };

    // New connection request received → red dot on Network icon
    const handleStatusUpdate = ({ newStatus }) => {
      if (newStatus === 'received' && pathnameRef.current !== '/network') {
        setUnreadNetwork(true);
      }
    };

    // Like / comment / connection-accepted → red dot on Bell icon
    const handleNewNotification = () => {
      if (pathnameRef.current !== '/notification') {
        setUnreadNotifications(true);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('statusUpdate', handleStatusUpdate);
    socket.on('newNotification', handleNewNotification);

    // Connect (if not already connected, this triggers handleConnect above)
    if (!socket.connected) {
      socket.connect();
    } else {
      // Already connected from a previous login – register immediately
      socket.emit('register', userData._id);
    }

    // Check for already-pending incoming requests on login/refresh
    const checkPendingRequests = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/connection/requests`, { withCredentials: true });
        if (result.data.length > 0 && pathnameRef.current !== '/network') {
          setUnreadNetwork(true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    checkPendingRequests();

    // Check for any unread notifications on first load efficiently
    const checkUnreadNotifications = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/notification/unread`, { withCredentials: true });
        if (result.data.unread && pathnameRef.current !== '/notification') {
          setUnreadNotifications(true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    checkUnreadNotifications();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('statusUpdate', handleStatusUpdate);
      socket.off('newNotification', handleNewNotification);
    };
  }, [userData?._id]);

  return (
    <socketContext.Provider value={{ unreadNetwork, setUnreadNetwork, unreadNotifications, setUnreadNotifications }}>
      {children}
    </socketContext.Provider>
  );
}

export default SocketProvider;
