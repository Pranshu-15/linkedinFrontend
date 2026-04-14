import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { socketContext } from '../context/SocketContext';
import logo2 from "../assets/logo2.png";
import { Search, Home, Users, Bell, LogOut, User, Menu, Moon, Sun } from "lucide-react";
import dp from "../assets/dp.webp";
import { userDataContext } from '../context/userContext';
import axiosInstance from '../lib/axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from './ui/Avatar';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { toast } from 'react-toastify';

function Nav() {
  let [activeSearch, setActiveSearch] = useState(false);
  let { userData, setUserData, handleGetProfile } = useContext(userDataContext);
  let [showPopup, setShowPopup] = useState(false);
  let navigate = useNavigate();
  let [searchInput, setSearchInput] = useState("");
  let [searchData, setSearchData] = useState([]);
  let [isDark, setIsDark] = useState(true);
  // Read unread states from the global SocketContext (lives outside routing, never remounts)
  let { unreadNetwork, setUnreadNetwork, unreadNotifications, setUnreadNotifications } = useContext(socketContext);
  let location = useLocation();

  useEffect(() => {
    if (location.pathname === '/network') setUnreadNetwork(false);
    if (location.pathname === '/notification') setUnreadNotifications(false);
  }, [location.pathname]);

  // Simple toggle for the entire document depending on index.css setup
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const handleSignOut = async () => {
    try {
      await axiosInstance.get("/api/auth/logout");
      localStorage.removeItem("token");
      setUserData(null);
      toast.success("Successfully logged out");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleSearch = async () => {
    if (!searchInput) {
      setSearchData([]);
      return;
    }
    try {
      let result = await axiosInstance.get(`/api/user/search?query=${searchInput}`);
      setSearchData(result.data);
    } catch (error) {
      setSearchData([]);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  return (
    <div className='w-full h-16 bg-background/80 backdrop-blur-md border-b fixed top-0 flex justify-between items-center px-4 md:px-8 z-40'>
      {/* Left items - Logo & Search */}
      <div className='flex items-center gap-4'>
        <div className='cursor-pointer flex items-center gap-2' onClick={() => { setActiveSearch(false); navigate("/"); }}>
          <img src={logo2} alt="Logo" className='h-8 w-auto' />
        </div>

        {!activeSearch && (
          <button className='p-2 md:hidden text-muted-foreground' onClick={() => setActiveSearch(true)}>
            <Search className='w-5 h-5' />
          </button>
        )}

        <div className={`relative hidden md:flex items-center w-[300px] transition-all`}>
          <div className="absolute left-3 text-muted-foreground"><Search className='w-4 h-4' /></div>
          <Input 
            className="pl-9 h-9 bg-secondary border-transparent"
            placeholder='Search users...' 
            onChange={(e) => setSearchInput(e.target.value)} 
            value={searchInput} 
          />
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {activeSearch && (
            <motion.div 
              initial={{ y: -10, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: -10, opacity: 0 }}
              className="absolute top-0 left-0 w-full h-16 bg-background border-b flex items-center px-4 gap-3 md:hidden z-50"
            >
               <Input 
                  className="flex-1 h-10 border-transparent bg-secondary"
                  autoFocus
                  placeholder='Search...' 
                  onChange={(e) => setSearchInput(e.target.value)} 
                  value={searchInput} 
                />
                <Button variant="ghost" size="sm" onClick={() => { setActiveSearch(false); setSearchInput(""); }}>
                  Cancel
                </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {searchData.length > 0 && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 10 }}
               className='absolute top-16 left-0 md:left-24 shadow-lg w-full md:w-[400px] max-h-[400px] bg-card border rounded-b-xl flex flex-col p-2 overflow-y-auto z-40'
             >
                {searchData.map((sea, idx) => (
                  <div key={idx} className='flex gap-3 items-center p-3 hover:bg-secondary cursor-pointer rounded-lg transition-colors' onClick={() => { handleGetProfile(sea.userName); setSearchInput(""); setActiveSearch(false); }}>
                    <Avatar src={sea.profileImage} alt={sea.firstName} size="md" />
                    <div>
                      <div className='text-sm font-semibold text-foreground'>{`${sea.firstName} ${sea.lastName}`}</div>
                      <div className='text-xs text-muted-foreground'>{sea.headline}</div>
                    </div>
                  </div>
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right items - Nav Icons */}
      <div className='flex items-center gap-2 md:gap-6'>
        <button className='flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer hidden md:flex' onClick={() => navigate("/")}>
          <Home className='w-5 h-5' />
          <span className='text-[10px] mt-1'>Home</span>
        </button>
        <button className='flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer hidden md:flex relative' onClick={() => navigate("/network")}>
          <div className="relative">
            <Users className='w-5 h-5' />
            {unreadNetwork && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>}
          </div>
          <span className='text-[10px] mt-1'>Network</span>
        </button>
        <button className='flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer relative' onClick={() => navigate("/notification")}>
          <div className="relative">
             <Bell className='w-5 h-5' />
             {unreadNotifications && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background"></span>}
          </div>
          <span className='text-[10px] mt-1 hidden md:block'>Notifications</span>
        </button>

        <button 
          className="text-muted-foreground hover:text-primary transition-colors p-2 hidden sm:block" 
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
        </button>

        <div className='relative ml-2'>
          <button onClick={() => setShowPopup(!showPopup)} className="focus:outline-none">
             <Avatar src={userData?.profileImage} size="sm" className="hover:ring-2 ring-primary transition-all" />
          </button>
          
          <AnimatePresence>
            {showPopup && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, transformOrigin: "top right" }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className='absolute right-0 mt-3 w-64 bg-card border shadow-xl rounded-xl p-4 flex flex-col gap-4 z-50'
               >
                 <div className="flex flex-col items-center border-b pb-4">
                    <Avatar src={userData?.profileImage} size="xl" className="mb-3" />
                    <div className='text-base font-semibold text-foreground text-center'>{`${userData?.firstName} ${userData?.lastName}`}</div>
                    <div className='text-xs text-muted-foreground text-center line-clamp-1 mb-3'>{userData?.headline}</div>
                    <Button variant="outline" className="w-full rounded-full h-8 text-xs" onClick={() => { handleGetProfile(userData?.userName); setShowPopup(false); }}>
                      View Profile
                    </Button>
                 </div>
                 
                 <div className='flex items-center gap-3 text-sm text-foreground cursor-pointer hover:text-primary transition-colors px-2' onClick={() => { navigate("/network"); setShowPopup(false); }}>
                    <Users className='w-4 h-4' />
                    <span>Manage Network</span>
                 </div>
                 
                 <div className="pt-2 border-t">
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Nav;
