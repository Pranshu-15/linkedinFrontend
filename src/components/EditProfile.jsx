import React, { useContext, useRef, useState } from 'react';
import { userDataContext } from '../context/userContext';
import dp from "../assets/dp.webp";
import { Camera, Plus, X } from "lucide-react";
import axiosInstance from '../lib/axios';
import { authDataContext } from '../context/AuthContext';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { toast } from 'react-toastify';
import ImageCropper from './ImageCropper';

function EditProfile() {
  let { edit, setEdit, userData, setUserData } = useContext(userDataContext);
  let { serverUrl } = useContext(authDataContext);
  let [firstName, setFirstName] = useState(userData.firstName || "");
  let [lastName, setLastName] = useState(userData.lastName || "");
  let [userName, setUserName] = useState(userData.userName || "");
  let [headline, setHeadline] = useState(userData.headline || "");
  let [location, setLocation] = useState(userData.location || "");
  let [gender, setGender] = useState(userData.gender || "");
  let [skills, setSkills] = useState(userData.skills || []);
  let [newSkills, setNewSkills] = useState("");
  let [education, setEducation] = useState(userData.education || []);
  let [newEducation, setNewEducation] = useState({ college: "", degree: "", fieldOfStudy: "" });
  let [experience, setExperience] = useState(userData.experience || []);
  let [newExperience, setNewExperience] = useState({ title: "", company: "", description: "" });

  let [frontendProfileImage, setFrontendProfileImage] = useState(userData.profileImage || dp);
  let [backendProfileImage, setBackendProfileImage] = useState(null);
  let [frontendCoverImage, setFrontendCoverImage] = useState(userData.coverImage || null);
  let [backendCoverImage, setBackendCoverImage] = useState(null);
  let [saving, setSaving] = useState(false);

  // Cropper state
  let [cropSrc, setCropSrc] = useState(null);       // raw objectURL to crop
  let [cropAspect, setCropAspect] = useState(16/3); // 16:3 cover | 1 avatar
  let [cropTarget, setCropTarget] = useState(null); // 'cover' | 'profile'
  
  const profileImage = useRef();
  const coverImage = useRef();

  function addSkill(e) {
    e.preventDefault();
    if (newSkills && !skills.includes(newSkills)) {
      setSkills([...skills, newSkills]);
    }
    setNewSkills("");
  }

  function removeSkill(skill) {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    }
  }

  function addEducation(e) {
    e.preventDefault();
    if (newEducation.college && newEducation.degree && newEducation.fieldOfStudy) {
      setEducation([...education, newEducation]);
    }
    setNewEducation({ college: "", degree: "", fieldOfStudy: "" });
  }

  function addExperience(e) {
    e.preventDefault();
    if (newExperience.title && newExperience.company && newExperience.description) {
      setExperience([...experience, newExperience]);
    }
    setNewExperience({ title: "", company: "", description: "" });
  }

  function removeEducation(edu) {
    if (education.includes(edu)) {
      setEducation(education.filter((e) => e !== edu));
    }
  }

  function removeExperience(exp) {
    if (experience.includes(exp)) {
      setExperience(experience.filter((e) => e !== exp));
    }
  }

  function handleProfileImage(e) {
    let file = e.target.files[0];
    if (file) {
      setCropSrc(URL.createObjectURL(file));
      setCropAspect(1);
      setCropTarget('profile');
    }
    // reset so same file can be re-selected
    e.target.value = '';
  }

  function handleCoverImage(e) {
    let file = e.target.files[0];
    if (file) {
      setCropSrc(URL.createObjectURL(file));
      setCropAspect(16 / 3);
      setCropTarget('cover');
    }
    e.target.value = '';
  }

  function handleCropDone(file, previewUrl) {
    if (cropTarget === 'cover') {
      setBackendCoverImage(file);
      setFrontendCoverImage(previewUrl);
    } else {
      setBackendProfileImage(file);
      setFrontendProfileImage(previewUrl);
    }
    setCropSrc(null);
    setCropTarget(null);
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let formdata = new FormData();
      formdata.append("firstName", firstName);
      formdata.append("lastName", lastName);
      formdata.append("userName", userName);
      formdata.append("headline", headline);
      formdata.append("location", location);
      formdata.append("skills", JSON.stringify(skills));
      formdata.append("education", JSON.stringify(education));
      formdata.append("experience", JSON.stringify(experience));

      if (backendProfileImage) {
        formdata.append("profileImage", backendProfileImage);
      }
      if (backendCoverImage) {
        formdata.append("coverImage", backendCoverImage);
      }

      let result = await axiosInstance.put("/api/user/updateprofile", formdata);
      setUserData(result.data);
      setSaving(false);
      setEdit(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.log(error);
      setSaving(false);
      toast.error("Failed to update profile");
    }
  };

  return (
    <>
    {cropSrc && (
      <ImageCropper
        imageSrc={cropSrc}
        aspect={cropAspect}
        onDone={handleCropDone}
        onCancel={() => { setCropSrc(null); setCropTarget(null); }}
      />
    )}
    <Modal isOpen={edit} onClose={() => setEdit(false)} title="Edit Profile" className="max-w-2xl">
      <div className="flex flex-col gap-6 p-1">
        <input type="file" accept='image/*' hidden ref={profileImage} onChange={handleProfileImage} />
        <input type="file" accept='image/*' hidden ref={coverImage} onChange={handleCoverImage} />

        {/* Header Images Section */}
        <div className="relative mb-12">
          <div 
             className='w-full h-32 sm:h-40 bg-secondary rounded-xl overflow-hidden cursor-pointer relative group' 
             onClick={() => coverImage.current.click()}
          >
            {frontendCoverImage ? (
               <img src={frontendCoverImage} alt="Cover" className='w-full h-full object-cover transition-transform group-hover:scale-105' />
            ) : (
               <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20"></div>
            )}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera className="text-white w-8 h-8" />
            </div>
          </div>
          
          <div 
             className="absolute -bottom-10 left-6 sm:left-8 cursor-pointer group"
             onClick={() => profileImage.current.click()}
          >
             <div className="relative">
                <Avatar src={frontendProfileImage} size="xl" className="border-4 border-card ring-2 ring-transparent group-hover:ring-primary transition-all" />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera className="text-white w-6 h-6" />
                </div>
             </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
             <label className="text-xs font-semibold text-muted-foreground">First Name</label>
             <Input placeholder='First Name' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
             <Input placeholder='Last Name' value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-1 md:col-span-2">
             <label className="text-xs font-semibold text-muted-foreground">Headline</label>
             <Input placeholder='Software Engineer at ...' value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-semibold text-muted-foreground">Username</label>
             <Input placeholder='username' value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div className="space-y-1">
             <label className="text-xs font-semibold text-muted-foreground">Location</label>
             <Input placeholder='Location' value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>

        {/* Skills */}
        <div className="p-4 border rounded-xl space-y-4 bg-secondary/10">
          <h3 className='text-sm font-semibold'>Skills</h3>
          {skills && skills.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1 text-sm font-medium pr-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-2 hover:bg-black/10 rounded-full p-0.5 transition-colors">
                     <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className='flex gap-2'>
            <Input placeholder='Add a new skill (e.g. React)' value={newSkills} onChange={(e) => setNewSkills(e.target.value)} className="flex-1" />
            <Button onClick={addSkill} variant="secondary">Add</Button>
          </div>
        </div>

        {/* Experience */}
        <div className="p-4 border rounded-xl space-y-4 bg-secondary/10">
          <h3 className='text-sm font-semibold'>Experience</h3>
          {experience && experience.length > 0 && (
             <div className='space-y-3'>
              {experience.map((exp, index) => (
                <div key={index} className='bg-background border rounded-lg p-3 flex justify-between items-start'>
                  <div>
                    <div className="font-semibold text-sm">{exp.title}</div>
                    <div className="text-xs text-muted-foreground">{exp.company}</div>
                    <div className="text-xs text-foreground/80 mt-1">{exp.description}</div>
                  </div>
                  <button onClick={() => removeExperience(exp)} className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-secondary transition-colors">
                     <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
             </div>
          )}
          <div className='grid grid-cols-2 gap-2'>
            <Input placeholder='Title' value={newExperience.title} onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })} />
            <Input placeholder='Company' value={newExperience.company} onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })} />
            <Input placeholder='Description' className="col-span-2" value={newExperience.description} onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })} />
            <Button onClick={addExperience} variant="secondary" className="col-span-2 mt-1">Add Experience</Button>
          </div>
        </div>

        {/* Education */}
        <div className="p-4 border rounded-xl space-y-4 bg-secondary/10">
          <h3 className='text-sm font-semibold'>Education</h3>
          {education && education.length > 0 && (
             <div className='space-y-3'>
              {education.map((edu, index) => (
                <div key={index} className='bg-background border rounded-lg p-3 flex justify-between items-start'>
                  <div>
                    <div className="font-semibold text-sm">{edu.college}</div>
                    <div className="text-xs text-foreground/80">{edu.degree} in {edu.fieldOfStudy}</div>
                  </div>
                  <button onClick={() => removeEducation(edu)} className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-secondary transition-colors">
                     <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
             </div>
          )}
          <div className='grid grid-cols-2 gap-2'>
            <Input placeholder='College' className="col-span-2" value={newEducation.college} onChange={(e) => setNewEducation({ ...newEducation, college: e.target.value })} />
            <Input placeholder='Degree' value={newEducation.degree} onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })} />
            <Input placeholder='Field of Study' value={newEducation.fieldOfStudy} onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })} />
            <Button onClick={addEducation} variant="secondary" className="col-span-2 mt-1">Add Education</Button>
          </div>
        </div>

        <div className="pt-4 border-t mt-2 flex justify-end">
            <Button variant="ghost" className="mr-2" onClick={() => setEdit(false)}>Cancel</Button>
            <Button isLoading={saving} onClick={() => handleSaveProfile()}>Save Changes</Button>
        </div>
      </div>
    </Modal>
    </>
  );
}

export default EditProfile;
