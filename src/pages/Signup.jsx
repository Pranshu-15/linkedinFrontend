import React, { useContext, useState } from 'react';
import logo from "../assets/logo2.png";
import { useNavigate, Link } from "react-router-dom";
import { authDataContext } from '../context/AuthContext';
import axiosInstance from '../lib/axios';
import { userDataContext } from '../context/userContext';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

function Signup() {
  let [show, setShow] = useState(false);
  let { serverUrl } = useContext(authDataContext);
  let { setUserData } = useContext(userDataContext);
  let navigate = useNavigate();
  
  let [firstName, setFirstName] = useState("");
  let [lastName, setLastName] = useState("");
  let [userName, setUserName] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !userName || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      let result = await axiosInstance.post("/api/auth/signup", {
        firstName,
        lastName,
        userName,
        email,
        password
      });
      
      if (result.data.token) localStorage.setItem("token", result.data.token);
      setUserData(result.data);
      toast.success("Account created successfully!");
      navigate("/");
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Sign up failed");
      setLoading(false);
    }
  }

  return (
    <div className='w-full min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden py-10'>
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none flex justify-center items-center">
         <div className="w-[800px] h-[800px] bg-secondary/20 rounded-full blur-[100px] absolute top-[10%] left-[10%]"></div>
         <div className="w-[600px] h-[600px] bg-primary/10 rounded-full blur-[80px] absolute bottom-[10%] right-[10%]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='absolute top-8 left-8 sm:left-12'
      >
        <img src={logo} alt="Logo" className="w-[60px]" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md px-4 z-10"
      >
        <Card className="p-8 shadow-2xl bg-card/80 backdrop-blur-xl border border-secondary">
          <div className="mb-8 text-center">
            <h1 className='text-3xl font-bold text-foreground tracking-tight'>Create Account</h1>
            <p className="text-sm text-muted-foreground mt-2">Join our community today</p>
          </div>

          <form className='flex flex-col gap-4' onSubmit={handleSignUp}>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-medium text-foreground ml-1">First Name</label>
                 <Input type="text" placeholder='John' required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-secondary/50" />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-medium text-foreground ml-1">Last Name</label>
                 <Input type="text" placeholder='Doe' required value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-secondary/50" />
               </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground ml-1">Username</label>
              <Input type="text" placeholder='johndoe123' required value={userName} onChange={(e) => setUserName(e.target.value)} className="bg-secondary/50" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground ml-1">Email</label>
              <Input type="email" placeholder='name@example.com' required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary/50" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground ml-1">Password</label>
              <div className='relative'>
                <Input 
                  type={show ? "text" : "password"} 
                  placeholder='Create a strong password' 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary/50 pr-10"
                />
                <button 
                  type="button"
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors' 
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button className='w-full mt-4 h-12 text-base font-semibold' isLoading={loading}>
              Sign Up
            </Button>
            
            <p className='text-center text-sm text-muted-foreground mt-2'>
              Already have an account? <Link to="/login" className='text-primary font-medium hover:underline ml-1'>Sign In</Link>
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default Signup;
