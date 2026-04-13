import React, { useContext, useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { authDataContext } from '../context/AuthContext';
import axios from 'axios';
import { X, Trash2, Bell } from "lucide-react";
import dp from "../assets/dp.webp";
import { userDataContext } from '../context/userContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { socket, socketContext } from '../context/SocketContext';

function Notification() {
  let { serverUrl } = useContext(authDataContext);
  let [notificationData, setNotificationData] = useState([]);
  let { userData } = useContext(userDataContext);
  let { setUnreadNotifications } = useContext(socketContext);

  const handleGetNotification = async () => {
      try {
          let result = await axios.get(serverUrl + "/api/notification/get", { withCredentials: true });
          setNotificationData(result.data);
      } catch (error) {
          console.log(error);
      }
  }

  const handleDeleteNotification = async (id) => {
      try {
          await axios.delete(serverUrl + `/api/notification/deleteone/${id}`, { withCredentials: true });
          setNotificationData(prev => prev.filter(n => n._id !== id));
      } catch (error) {
          console.log(error);
      }
  }

  const handleClearAllNotification = async () => {
      try {
          await axios.delete(serverUrl + "/api/notification", { withCredentials: true });
          setNotificationData([]);
      } catch (error) {
          console.log(error);
      }
  }

  const handleMessage = (type) => {
    if (type === "like") return "liked your post";
    if (type === "comment") return "commented on your post";
    return "accepted your connection request";
  }

  // Determine the preview text for a notification card
  const getPreviewText = (noti) => {
    if (noti.type === 'comment') {
      // If commentText was saved (new comments), show it; otherwise show post description
      return noti.commentText || noti.relatedPost?.description || '';
    }
    return noti.relatedPost?.description || '';
  }

  useEffect(() => {
      handleGetNotification();
      
      // Mark all as read when user visits the notification page
      const markAsRead = async () => {
          try {
              await axios.put(serverUrl + "/api/notification/mark-read", {}, { withCredentials: true });
              setUnreadNotifications(false);
          } catch (error) {
              console.log("Failed to mark notifications as read", error);
          }
      };
      markAsRead();
  }, [])

  // Real-time: prepend new notifications the moment they arrive
  useEffect(() => {
    const handleNewNotification = (notif) => {
      if (!notif) return;
      setNotificationData(prev => {
        // Avoid duplicates (e.g. if page refetches as well)
        if (prev.some(n => n._id === notif._id)) return prev;
        return [notif, ...prev];
      });
    };
    socket.on('newNotification', handleNewNotification);
    return () => socket.off('newNotification', handleNewNotification);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className='w-full min-h-screen bg-secondary/10 pt-20 pb-20'
    >
      <Nav />
      <div className='max-w-3xl mx-auto px-4 flex flex-col gap-6 pt-6'>
         <div className='flex items-center justify-between mb-2'>
            <div className="flex items-center gap-3">
               <div className='p-2 bg-primary/10 rounded-lg'>
                  <Bell className='w-6 h-6 text-primary' />
               </div>
               <h1 className='text-2xl font-bold text-foreground'>Notifications</h1>
            </div>
            
            {notificationData.length > 0 && (
               <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-transparent" onClick={handleClearAllNotification}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all
               </Button>
            )}
         </div>
      
         <Card className="p-4 bg-background">
            <h2 className='text-lg font-semibold border-b pb-3 mb-3'>Recent ({notificationData.length})</h2>
            <div className='flex flex-col gap-3 mt-4'>
               <AnimatePresence>
                 {notificationData.length > 0 ? (
                    notificationData.map((noti, index) => (
                      <motion.div 
                         key={noti._id || index}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className='relative flex flex-col sm:flex-row gap-4 p-4 border rounded-xl hover:bg-secondary/20 transition-colors group'
                      >
                        <div className='flex items-start gap-4 flex-1 pr-8'>
                           <Avatar src={noti.relatedUser?.profileImage || dp} size="lg" />
                           <div className="flex-1">
                              <div className='text-base text-foreground'>
                                 <span className="font-semibold">{`${noti.relatedUser?.firstName} ${noti.relatedUser?.lastName}`}</span>
                                 {' '}
                                 <span className="text-muted-foreground">{handleMessage(noti.type)}</span>
                              </div>
                              
                              {noti.relatedPost && (
                                <div className='mt-3 flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border'>
                                  {noti.relatedPost.image && (
                                     <div className='w-12 h-12 rounded overflow-hidden shrink-0'>
                                       <img src={noti.relatedPost.image} alt="Post" className='w-full h-full object-cover' />
                                     </div>
                                  )}
                                  <div className="flex flex-col min-w-0">
                                    {noti.type === 'comment' && (
                                      <p className="text-xs font-semibold text-foreground mb-1">
                                        {noti.commentText ? 'Their comment:' : 'On your post:'}
                                      </p>
                                    )}
                                    <p className="text-sm text-muted-foreground line-clamp-2 italic">
                                      "{getPreviewText(noti)}"
                                    </p>
                                  </div>
                                </div>
                              )}
                           </div>  
                        </div>

                        <button 
                          className='absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-background rounded-full sm:bg-transparent'
                          onClick={() => handleDeleteNotification(noti._id)}
                        >
                           <X className='w-5 h-5' />
                        </button>
                      </motion.div>
                    ))
                 ) : (
                    <div className="text-center py-12 text-muted-foreground">
                       <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                       <p>You're all caught up!</p>
                    </div>
                 )}
               </AnimatePresence>
            </div>
         </Card>
      </div>
    </motion.div>
  )
}

export default Notification;
