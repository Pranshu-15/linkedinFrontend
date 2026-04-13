import React, { useContext, useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav';
import dp from "../assets/dp.webp";
import { Camera, Plus, Image as ImageIcon, Send, X, Edit3 } from "lucide-react";
import { userDataContext } from '../context/userContext';
import EditProfile from '../components/EditProfile';
import axios from 'axios';
import { authDataContext } from '../context/AuthContext';
import Post from '../components/Post';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { toast } from 'react-toastify';
import { socket } from '../context/SocketContext';

function Home() {
  let { userData, edit, setEdit, postData, setPostData, getPost, handleGetProfile } = useContext(userDataContext);
  let { serverUrl } = useContext(authDataContext);
  let [frontendImage, setFrontendImage] = useState("");
  let [backendImage, setBackendImage] = useState("");
  let [description, setDescription] = useState("");
  let [uploadPost, setUploadPost] = useState(false);
  let image = useRef();
  let [posting, setPosting] = useState(false);
  let [suggestedUser, setSuggestedUser] = useState([]);

  function handleImage(e) {
    let file = e.target.files[0];
    if (file) {
       setBackendImage(file);
       setFrontendImage(URL.createObjectURL(file));
    }
  }

  async function handleUploadPost() {
    if (!description && !backendImage) {
       toast.error("Please add a description or image.");
       return;
    }
    setPosting(true);
    try {
      let formdata = new FormData();
      formdata.append("description", description);
      if (backendImage) {
        formdata.append("image", backendImage);
      }
      let result = await axios.post(serverUrl + "/api/post/create", formdata, { withCredentials: true });
      toast.success("Post created successfully!");
      setPosting(false);
      setUploadPost(false);
      setDescription("");
      setFrontendImage("");
      setBackendImage(null);
      getPost();
    } catch (error) {
      setPosting(false);
      toast.error("Failed to post");
      console.log(error);
    }
  }

  const handleSuggestedUsers = async () => {
    try {
      let result = await axios.get(serverUrl + "/api/user/suggestedusers", { withCredentials: true });
      setSuggestedUser(result.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    handleSuggestedUsers();
  }, [])

  useEffect(() => {
    getPost();
  }, [uploadPost])

  useEffect(() => {
    const handlePostDeleted = ({ postId }) => {
      setPostData(prevData => prevData.filter(post => post._id !== postId));
    };
    const handlePostCreated = (newPost) => {
      setPostData(prevData => {
        if (prevData.some(p => p._id === newPost._id)) return prevData;
        return [newPost, ...prevData];
      });
    };

    socket.on("postDeleted", handlePostDeleted);
    socket.on("postCreated", handlePostCreated);

    return () => {
      socket.off("postDeleted", handlePostDeleted);
      socket.off("postCreated", handlePostCreated);
      // Never call socket.disconnect() here
    };
  }, []);


  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className='w-full min-h-screen bg-secondary/10 pt-20 pb-20'
    >
      {edit && <EditProfile />}
      <Nav />
     
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column - User Profile Setup */}
          <div className="hidden lg:block lg:col-span-1">
             <div className="sticky top-24">
                <Card className="p-0 overflow-visible text-center">
                   <div 
                     className='w-full h-20 bg-secondary relative cursor-pointer rounded-t-xl overflow-hidden group' 
                     onClick={() => setEdit(true)}
                   >
                    {userData?.coverImage ? (
                       <img src={userData.coverImage} alt="Cover" className='w-full h-full object-cover transition-transform group-hover:scale-105' />
                    ) : (
                       <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20"></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Camera className="text-white w-6 h-6" />
                    </div>
                   </div>

                   <div className="relative flex justify-center -mt-10 mb-2 cursor-pointer group" onClick={() => setEdit(true)}>
                      <div className="relative">
                        <Avatar src={userData?.profileImage} size="xl" className="border-4 border-card ring-2 ring-transparent group-hover:ring-primary transition-all" />
                      </div>
                   </div>

                   <div className='px-4 pb-4'>
                      <div className='text-lg font-bold text-foreground line-clamp-1'>{`${userData?.firstName} ${userData?.lastName}`}</div>
                      <div className='text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]'>{userData?.headline || "Add a headline"}</div>
                      <div className='text-xs text-muted-foreground opacity-70 mt-1 pb-4 border-b border-border'>{userData?.location}</div>
                      
                      <Button variant="outline" className="w-full mt-4" onClick={() => setEdit(true)}>
                         <Edit3 className="w-4 h-4 mr-2" />
                         Edit Profile
                      </Button>
                   </div>
                </Card>
             </div>
          </div>

          {/* Middle Column - Feed */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
             {/* Create Post Input */}
             <Card className="p-4 flex items-center gap-3">
                <Avatar src={userData?.profileImage} size="md" />
                <button 
                  className='flex-1 h-12 rounded-full border bg-secondary/30 text-muted-foreground text-left px-5 hover:bg-secondary/50 transition-colors' 
                  onClick={() => setUploadPost(true)}
                >
                  Start a post...
                </button>
             </Card>

             {/* Post Modals using the global Modal component */}
             <Modal isOpen={uploadPost} onClose={() => setUploadPost(false)} title="Create a Post">
                <div className='flex items-center gap-3 mb-4'>
                  <Avatar src={userData?.profileImage} size="md" />
                  <div className='text-base font-semibold'>{`${userData?.firstName} ${userData?.lastName}`}</div>
                </div>

                <textarea 
                  className='w-full min-h-[150px] outline-none bg-transparent resize-none text-base placeholder:text-muted-foreground' 
                  placeholder='What do you want to talk about?' 
                  value={description} 
                  autoFocus
                  onChange={(e) => setDescription(e.target.value)}
                />

                <input type="file" ref={image} accept="image/*" hidden onChange={handleImage} />
                
                {frontendImage && (
                  <div className='w-full max-h-[300px] overflow-hidden rounded-xl mb-4 relative group'>
                    <img src={frontendImage} alt="Post preview" className='w-full h-full object-contain bg-secondary/20'/>
                    <button 
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => { setFrontendImage(""); setBackendImage(null); }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className='flex items-center justify-between pt-4 border-t'>
                  <Button variant="ghost" size="icon" onClick={() => image.current.click()} className="text-primary hover:bg-primary/10">
                     <ImageIcon className='w-5 h-5' />
                  </Button>
                  <Button 
                    isLoading={posting} 
                    onClick={handleUploadPost}
                    disabled={(!description.trim() && !backendImage) || posting}
                  >
                     <Send className="w-4 h-4 mr-2" />
                     Post
                  </Button>
                </div>
             </Modal>

             {/* Feed */}
            <div className="flex flex-col gap-6">
               <AnimatePresence>
                 {postData.map((post, index) => (
                    <motion.div 
                      key={post._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                       <Post 
                         id={post._id} 
                         description={post.description} 
                         author={post.author} 
                         image={post.image} 
                         like={post.like} 
                         comment={post.comment} 
                         createdAt={post.createdAt}
                         commentsDisabled={post.commentsDisabled}
                       />
                    </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          </div>

          {/* Right Column - Suggested Users */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
               <Card className="p-4">
                  <h2 className='text-sm font-semibold text-foreground mb-4'>Suggested Users</h2>
                  <div className='flex flex-col gap-4'>
                    {suggestedUser.length > 0 ? (
                       suggestedUser.map((su) => (
                         <div key={su._id} className='flex gap-3 group cursor-pointer' onClick={() => handleGetProfile(su.userName)}>
                            <Avatar src={su.profileImage} size="md" />
                            <div className='flex-1'>
                               <div className='text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1'>
                                 {`${su.firstName} ${su.lastName}`}
                               </div>
                               <div className='text-xs text-muted-foreground line-clamp-1 mt-0.5'>{su.headline || 'Member'}</div>
                               <Button variant="outline" size="sm" className="mt-2 text-xs h-7 w-full rounded-full">View</Button>
                            </div>
                         </div>
                       ))
                    ) : (
                       <div className="text-xs text-muted-foreground text-center py-4">No suggestions right now</div>
                    )}
                  </div>
               </Card>
            </div>
          </div>
      </div>
    </motion.div>
  )
}

export default Home;
