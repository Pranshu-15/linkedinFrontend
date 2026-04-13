import React, { useContext, useEffect, useState } from 'react';
import Nav from '../components/Nav';
import axios from 'axios';
import { authDataContext } from '../context/AuthContext';
import dp from "../assets/dp.webp";
import { CheckCircle2, XCircle, Users, UserMinus, Clock } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { socket } from '../context/SocketContext';

function Network() {
  let { serverUrl } = useContext(authDataContext);
  let [connections, setConnections] = useState([]);
  let [myConnections, setMyConnections] = useState([]);
  let [sentRequests, setSentRequests] = useState([]);

  const handleGetRequests = async () => {
    try {
        let result = await axios.get(`${serverUrl}/api/connection/requests`, { withCredentials: true });
        setConnections(result.data);
    } catch (error) {
       console.log(error);
    }
  }

  const handleAcceptConnection = async (requestId) => {
    try {
      await axios.put(`${serverUrl}/api/connection/accept/${requestId}`, {}, { withCredentials: true });
      setConnections(connections.filter((con) => con._id !== requestId));
      handleGetMyConnections(); // INSTANTLY update My Connections
    } catch (error) {
      console.log(error);
    }
  }

  const handleRejectConnection = async (requestId) => {
    try {
      await axios.put(`${serverUrl}/api/connection/reject/${requestId}`, {}, { withCredentials: true });
      setConnections(connections.filter((con) => con._id !== requestId));
    } catch (error) {
      console.log(error);
    }
  }

  const handleGetMyConnections = async () => {
    try {
      let result = await axios.get(`${serverUrl}/api/connection/`, { withCredentials: true });
      setMyConnections(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleGetSentRequests = async () => {
    try {
      let result = await axios.get(`${serverUrl}/api/connection/sent-requests`, { withCredentials: true });
      setSentRequests(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveConnection = async (userId) => {
    try {
      await axios.delete(`${serverUrl}/api/connection/remove/${userId}`, { withCredentials: true });
      setMyConnections(myConnections.filter(con => con._id !== userId));
    } catch (error) {
       console.log(error);
    }
  };

  const handleWithdrawRequest = async (userId) => {
    try {
      await axios.delete(`${serverUrl}/api/connection/withdraw/${userId}`, { withCredentials: true });
      setSentRequests(sentRequests.filter(req => req.receiver._id !== userId));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetRequests();
    handleGetMyConnections();
    handleGetSentRequests();

    const handleStatusUpdate = ({ newStatus }) => {
      // Any state change (received, connect, disconnect) impacts at least one list.
      // E.g., 'connect' fires when requests are withdrawn, rejected, OR when connections are removed.
      // To reliably handle all these scenarios instantly, we sync all network lists dynamically.
      handleGetRequests();
      handleGetMyConnections();
      handleGetSentRequests();
    };

    socket.on("statusUpdate", handleStatusUpdate);
    return () => {
       socket.off("statusUpdate", handleStatusUpdate);
    };
  }, [])

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className='w-full min-h-screen bg-secondary/10 pt-20 pb-20'
    >
      <Nav />
      
      <div className='max-w-3xl mx-auto px-4 flex flex-col gap-6 pt-6'>
         <div className='flex items-center gap-3 mb-2'>
            <div className='p-2 bg-primary/10 rounded-lg'>
               <Users className='w-6 h-6 text-primary' />
            </div>
            <h1 className='text-2xl font-bold text-foreground'>Your Network</h1>
         </div>

         <Card className="p-4 bg-background">
            <h2 className='text-lg font-semibold border-b pb-3 mb-3'>Invitations ({connections.length})</h2>
            
            <div className='flex flex-col gap-3 mt-4'>
               <AnimatePresence>
                 {connections.length > 0 ? (
                    connections.map((connection, index) => (
                      <motion.div 
                         key={connection._id || index}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border rounded-xl hover:bg-secondary/20 transition-colors'
                      >
                        <div className='flex items-center gap-4'>
                           <Avatar src={connection.sender?.profileImage || dp} size="lg" className="border-2 border-secondary" />
                           <div>
                              <div className='text-lg font-semibold text-foreground'>
                                {`${connection.sender?.firstName} ${connection.sender?.lastName}`}
                              </div>
                              <div className='text-sm text-muted-foreground mt-0.5 line-clamp-1'>
                                {connection.sender?.headline || 'Wants to connect with you'}
                              </div>
                           </div>  
                        </div>

                        <div className='flex items-center justify-end gap-2'>
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent sm:border-border"
                             onClick={() => handleRejectConnection(connection._id)}
                           >
                             <XCircle className='w-4 h-4 sm:mr-2' />
                             <span className="hidden sm:inline">Ignore</span>
                           </Button>
                           <Button 
                             variant="primary" 
                             size="sm" 
                             onClick={() => handleAcceptConnection(connection._id)}
                           >
                             <CheckCircle2 className='w-4 h-4 sm:mr-2' />
                             <span className="hidden sm:inline">Accept</span>
                           </Button>
                        </div> 
                      </motion.div>
                    ))
                 ) : (
                    <div className="text-center py-12 text-muted-foreground">
                       <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                       <p>No pending invitations</p>
                    </div>
                 )}
               </AnimatePresence>
            </div>
         </Card>

         <Card className="p-4 bg-background">
            <h2 className='text-lg font-semibold border-b pb-3 mb-3'>My Connections ({myConnections.length})</h2>
            
            <div className='flex flex-col gap-3 mt-4'>
               <AnimatePresence>
                 {myConnections.length > 0 ? (
                    myConnections.map((user, index) => (
                      <motion.div 
                         key={user._id || index}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border rounded-xl hover:bg-secondary/20 transition-colors'
                      >
                        <div className='flex items-center gap-4'>
                           <Avatar src={user.profileImage || dp} size="lg" className="border-2 border-secondary" />
                           <div>
                              <div className='text-lg font-semibold text-foreground'>
                                {`${user.firstName} ${user.lastName}`}
                              </div>
                              <div className='text-sm text-muted-foreground mt-0.5 line-clamp-1'>
                                {user.headline}
                              </div>
                           </div>  
                        </div>

                        <div className='flex items-center justify-end gap-2'>
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent sm:border-border"
                             onClick={() => handleRemoveConnection(user._id)}
                           >
                             <UserMinus className='w-4 h-4 sm:mr-2' />
                             <span className="hidden sm:inline">Remove</span>
                           </Button>
                        </div> 
                      </motion.div>
                    ))
                 ) : (
                    <div className="text-center py-12 text-muted-foreground">
                       <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                       <p>You have no connections yet</p>
                    </div>
                 )}
               </AnimatePresence>
            </div>
         </Card>

         <Card className="p-4 bg-background">
            <h2 className='text-lg font-semibold border-b pb-3 mb-3'>Sent Requests ({sentRequests.length})</h2>
            
            <div className='flex flex-col gap-3 mt-4'>
               <AnimatePresence>
                 {sentRequests.length > 0 ? (
                    sentRequests.map((request, index) => (
                      <motion.div 
                         key={request._id || index}
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 border rounded-xl hover:bg-secondary/20 transition-colors'
                      >
                        <div className='flex items-center gap-4'>
                           <Avatar src={request.receiver?.profileImage || dp} size="lg" className="border-2 border-secondary" />
                           <div>
                              <div className='text-lg font-semibold text-foreground'>
                                {`${request.receiver?.firstName} ${request.receiver?.lastName}`}
                              </div>
                              <div className='text-sm text-muted-foreground mt-0.5 line-clamp-1'>
                                {request.receiver?.headline}
                              </div>
                           </div>  
                        </div>

                        <div className='flex items-center justify-end gap-2'>
                           <Button 
                             variant="secondary" 
                             size="sm" 
                             className="hover:bg-destructive/10 hover:text-destructive"
                             onClick={() => handleWithdrawRequest(request.receiver?._id)}
                           >
                             <Clock className='w-4 h-4 sm:mr-2' />
                             <span className="hidden sm:inline">Withdraw</span>
                           </Button>
                        </div> 
                      </motion.div>
                    ))
                 ) : (
                    <div className="text-center py-8 text-muted-foreground">
                       <p>No pending sent requests</p>
                    </div>
                 )}
               </AnimatePresence>
            </div>
         </Card>
      </div>
    </motion.div>
  )
}

export default Network;
