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

function Login() {
  let [show, setShow] = useState(false);
  let { serverUrl } = useContext(authDataContext);
  let { setUserData } = useContext(userDataContext);
  let navigate = useNavigate();
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      let result = await axiosInstance.post("/api/auth/login", {
        email,
        password
      });
      if (result.data.token) localStorage.setItem("token", result.data.token);
      setUserData(result.data);
      toast.success("Welcome back!");
      navigate("/");
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className='w-full min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden'>
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none flex justify-center items-center">
         <div className="w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl absolute -top-[400px] -left-[200px]"></div>
         <div className="w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl absolute -bottom-[200px] -right-[100px]"></div>
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
        className="w-full max-w-md px-4"
      >
        <Card className="p-8 shadow-2xl bg-card/80 backdrop-blur-xl border border-secondary">
          <div className="mb-8 text-center">
            <h1 className='text-3xl font-bold text-foreground tracking-tight'>Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>

          <form className='flex flex-col gap-5' onSubmit={handleSignIn}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground ml-1">Email</label>
              <Input 
                type="email" 
                placeholder='name@example.com' 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground ml-1">Password</label>
              <div className='relative'>
                <Input 
                  type={show ? "text" : "password"} 
                  placeholder='Enter your password' 
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
              Sign In
            </Button>
            
            <p className='text-center text-sm text-muted-foreground mt-2'>
              Don't have an account? <Link to="/signup" className='text-primary font-medium hover:underline ml-1'>Sign Up</Link>
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default Login;
