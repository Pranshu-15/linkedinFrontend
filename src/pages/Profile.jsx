import React, { useContext, useEffect, useState } from 'react';
import Nav from '../components/Nav';
import dp from "../assets/dp.webp";
import { Camera, Edit3, Plus, GraduationCap, Briefcase, Award } from "lucide-react";
import { userDataContext } from '../context/userContext';
import { authDataContext } from '../context/AuthContext';
import axios from 'axios';
import EditProfile from '../components/EditProfile';
import Post from '../components/Post';
import ConnectionButton from '../components/ConnectionButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

function Profile() {
  let { userData, edit, setEdit, postData, profileData } = useContext(userDataContext);
  let [profilePost, setProfilePost] = useState([]);
  
  useEffect(() => {
    if (profileData?._id) {
       setProfilePost(postData.filter((post) => post.author._id === profileData._id));
    }
  }, [profileData, postData]);

  if (!profileData) return <div className="min-h-screen bg-background pt-20"></div>;

  const isOwnProfile = profileData._id === userData._id;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className='w-full min-h-screen bg-secondary/10 pt-20 pb-20'
    >
      <Nav />
      {edit && <EditProfile />}
      
      <div className='max-w-4xl mx-auto px-4 flex flex-col gap-6 pt-6'>

        {/* Profile Header */}
        <Card className="p-0 overflow-visible relative">
           <div className='w-full h-48 sm:h-64 bg-secondary rounded-t-xl overflow-hidden relative group'>
              {profileData.coverImage ? (
                <img src={profileData.coverImage} alt="Cover" className='w-full h-full object-cover' />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20"></div>
              )}
           </div>

           <div className='px-6 sm:px-8 pb-8 relative'>
              <div className='flex justify-between items-start'>
                 <div className='-mt-16 sm:-mt-20 relative'>
                    <Avatar 
                      src={profileData.profileImage || dp} 
                      className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-card bg-card" 
                    />
                 </div>
                 
                 <div className="pt-4 flex gap-3">
                    {isOwnProfile ? (
                       <Button variant="outline" onClick={() => setEdit(true)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                       </Button>
                    ) : (
                       <ConnectionButton userId={profileData._id} />
                    )}
                 </div>
              </div>

              <div className='mt-4 sm:mt-6'>
                 <h1 className='text-2xl sm:text-3xl font-bold text-foreground'>{`${profileData.firstName} ${profileData.lastName}`}</h1>
                 <p className='text-lg text-muted-foreground font-medium mt-1'>{profileData.headline}</p>
                 <div className='flex items-center gap-4 mt-2 text-sm text-foreground/70'>
                    <span>{profileData.location}</span>
                    <span>•</span>
                    <span className="font-semibold text-primary">{profileData.connection?.length || 0} connections</span>
                 </div>
              </div>
           </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Skills Section */}
              <Card className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className='text-lg font-bold flex items-center gap-2'>
                       <Award className="w-5 h-5 text-primary" />
                       Skills
                    </h2>
                    {isOwnProfile && (
                       <Button variant="ghost" size="icon" onClick={() => setEdit(true)}><Plus className="w-4 h-4" /></Button>
                    )}
                 </div>
                 
                 {profileData.skills?.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                       {profileData.skills.map((skill, index) => (
                         <Badge key={index} variant="secondary" className="px-3 py-1 font-medium">{skill}</Badge>
                       ))}
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                 )}
              </Card>

              {/* Education Section */}
              <Card className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className='text-lg font-bold flex items-center gap-2'>
                       <GraduationCap className="w-5 h-5 text-primary" />
                       Education
                    </h2>
                    {isOwnProfile && (
                       <Button variant="ghost" size="icon" onClick={() => setEdit(true)}><Plus className="w-4 h-4" /></Button>
                    )}
                 </div>
                 
                 {profileData.education?.length > 0 ? (
                    <div className='flex flex-col gap-4'>
                       {profileData.education.map((edu, index) => (
                         <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                            <h3 className="font-semibold text-foreground">{edu.college}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">{edu.degree} in {edu.fieldOfStudy}</p>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground">No education details added.</p>
                 )}
              </Card>

              {/* Experience Section */}
              <Card className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className='text-lg font-bold flex items-center gap-2'>
                       <Briefcase className="w-5 h-5 text-primary" />
                       Experience
                    </h2>
                    {isOwnProfile && (
                       <Button variant="ghost" size="icon" onClick={() => setEdit(true)}><Plus className="w-4 h-4" /></Button>
                    )}
                 </div>
                 
                 {profileData.experience?.length > 0 ? (
                    <div className='flex flex-col gap-4'>
                       {profileData.experience.map((ex, index) => (
                         <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                            <h3 className="font-semibold text-foreground">{ex.title}</h3>
                            <p className="text-sm text-primary font-medium">{ex.company}</p>
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{ex.description}</p>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground">No experience details added.</p>
                 )}
              </Card>
           </div>

           <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Activity / Posts */}
              <Card className="p-4 bg-background sticky top-24 z-10">
                 <h2 className='text-lg font-bold'>Posts ({profilePost.length})</h2>
              </Card>

              <AnimatePresence>
                 {profilePost.length > 0 ? (
                    profilePost.map((post, index) => (
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
                    ))
                 ) : (
                    <Card className="p-8 text-center text-muted-foreground">
                       <p>No posts yet.</p>
                    </Card>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Profile;
