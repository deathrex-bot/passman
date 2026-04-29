import React, { useState } from 'react'
import { ShieldCheck, User, Lock, EyeOff, Eye } from 'lucide-react'
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false)
  const [Auth, setAuth] = useState({ Email: '', Mpassword: '' })

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const handleChange = (e) => {
    setAuth({ ...Auth, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the default page reload
    console.log("Submitting form data:", Auth);

    try {
      let res = await fetch(`${backendUrl}/login`, { //fetching from backend API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Auth)
      });

      let data;
      const contentType = res.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (jsonError) {
          const text = await res.text();
          data = { error: text || 'Invalid JSON response' };
        }
      } else {
        const text = await res.text();
        data = { error: text || 'Non-JSON response received' };
      }

      if (res.ok) {
        toast.success('Login successful');
        // Store the authentication token and user details in localStorage
        localStorage.setItem('token', data.token); //store data.token in localStorage with a key of 'token'
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        navigate('/'); // Send user to the main password manager page instantly
      } else {
         toast.error(`Login failed: ${data.error || "Invalid credentials"}`);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error(`Error connecting to the server. Is your backend running?`);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-[#ecfdf5] p-4 font-sans text-slate-800 antialiased flex flex-col relative overflow-hidden">

        {/* Background Decorative Elements from HTML */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-[20%] -right-[10%] w-150 h-150 rounded-full bg-[#a6f2d1] opacity-30 blur-[100px]"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-125 h-125 rounded-full bg-[#10b981] opacity-20 blur-[120px]"></div>
        </div>

        {/* Top Margin/Space - Added relative z-10 to stay above background */}
        <div className="grow flex items-center justify-center pt-24 pb-16 relative z-10">
          <div className="w-full max-w-105 flex flex-col items-center">

            {/* Logo Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#10B981] uppercase mb-3">
                PASSOP
              </h1>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#10B981]/15 bg-white/50 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-semibold text-[#10B981] uppercase tracking-wider">
                  ENCRYPTED & SECURE
                </span>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white p-10 rounded-[20px] shadow-sm border border-slate-100 w-full">
              <h2 className="text-2xl font-bold mb-1.5 text-center text-slate-900">
                Welcome Back
              </h2>
              <p className="text-sm text-center text-slate-500 mb-8">
                Sign in to access your secure vault.
              </p>

              {/* Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>

                {/* Email Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full py-3.5 pl-12 pr-4 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 focus:outline-none transition"
                    name='Email'
                    value={Auth.Email}
                    onChange={handleChange}
                  />
                </div>

                {/* Master Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Master Password"
                    className="w-full py-3.5 pl-12 pr-12 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 focus:outline-none transition"
                    name='Mpassword'
                    value={Auth.Mpassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Remember Me / Forgot Password */}
                <div className="flex items-center justify-between text-sm mt-4">
                  <label className="flex items-center gap-2.5 text-slate-600">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#10B981] border-slate-300 rounded focus:ring-[#10B981] focus:ring-offset-2"
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="font-semibold text-[#10B981] hover:text-[#057857]">
                    Forgot Password?
                  </a>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 mt-4 rounded-lg bg-[#10B981] text-white font-bold text-base hover:bg-[#057857] transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Sign In
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-slate-400">or</span>
                </div>
              </div>

              {/* Create Account Link */}
              <p className="text-sm text-center text-slate-600">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-[#10B981] hover:text-[#057857]">
                  Create an Account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Added relative z-10 to stay above background */}
        <footer className="mt-auto px-6 py-8 border-t border-slate-100 flex flex-col md:flex-row md:justify-between items-center text-xs text-slate-500 space-y-4 md:space-y-0 relative z-10">
          <div className="flex items-center gap-6">
            <span className="text-base font-bold text-[#10B981] uppercase tracking-wider">
              PassOP
            </span>
            <span>© {new Date().getFullYear()} PassOP. Encrypted & Secure.</span>
          </div>
          <div className="flex items-center gap-6 uppercase font-semibold text-slate-600 tracking-wide">
            <a href="#" className="hover:text-[#10B981]">PRIVACY</a>
            <a href="#" className="hover:text-[#10B981]">TERMS</a>
            <a href="#" className="hover:text-[#10B981]">SECURITY PROTOCOL</a>
          </div>
        </footer>
      </div>
    </>
  )
}

export default Login
