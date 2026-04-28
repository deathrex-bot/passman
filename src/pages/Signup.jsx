import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [sign, setsign] = useState({ Name: '', Email: '', Mpassword: '', Cpassword: '' })

    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    const handleChange = (e) => {
        setsign({ ...sign, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the default page reload

        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(sign.Mpassword)) {
            alert('Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character');
            return; // Stop the function here so the invalid password isn't saved
        }
        
        if (sign.Mpassword !== sign.Cpassword) {
            alert("Passwords do not match");
            return; // Stops the function here so data isn't sent to the backend
        }

        console.log("Submitting form data:", sign);

        try {
            let res = await fetch(`${backendUrl}/signup`, { //fetches the data from the backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sign) //sends the data to the backend in JSON format which is inside the body of the request
            });

            // Wait for the backend to respond
            let data = await res.json(); //parses the response from the backend as JSON to get the actual data sent back (like success message or error message)

            if (res.ok) { //res.ok is a property of the response object that is true if the HTTP status code is in the 200-299 range, indicating a successful request.
                alert("Account created successfully!");
                window.location.href = '/login'; // Send user to login page
            } else {
                alert("Failed to create account: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error signing up:", error);
            alert("Error connecting to the server. Is your backend running?");
        }
    }

    return (
        <>
            {/* Base background matching the updated login screen */}
            <div className="min-h-screen bg-[#ecfdf5] p-4 font-sans text-slate-800 antialiased flex flex-col relative overflow-hidden">

                {/* Background Decorative Elements */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute -top-[20%] -right-[10%] w-150 h-150 rounded-full bg-[#a6f2d1] opacity-30 blur-[100px]"></div>
                    <div className="absolute -bottom-[20%] -left-[10%] w-125 h-125 rounded-full bg-[#10b981] opacity-20 blur-[120px]"></div>
                </div>

                {/* Main Content Container */}
                <div className="grow flex items-center justify-center pt-16 pb-16 relative z-10">
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

                        {/* Signup Card */}
                        <div className="bg-white p-10 rounded-[20px] shadow-sm border border-slate-100 w-full">
                            <h2 className="text-2xl font-bold mb-1.5 text-center text-slate-900">
                                Create an Account
                            </h2>
                            <p className="text-sm text-center text-slate-500 mb-8">
                                Start securing your digital life today.
                            </p>

                            {/* Form */}
                            <form className="space-y-4" onSubmit={handleSubmit}>

                                {/* Full Name Input */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full py-3.5 pl-12 pr-4 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 focus:outline-none transition"
                                        name='Name'
                                        value={sign.Name}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Email Input */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className="w-full py-3.5 pl-12 pr-4 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 focus:outline-none transition"
                                        name='Email'
                                        value={sign.Email}
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
                                        value={sign.Mpassword}
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

                                {/* Confirm Password Input */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        className="w-full py-3.5 pl-12 pr-12 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 focus:outline-none transition"
                                        name='Cpassword'
                                        value={sign.Cpassword}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-start text-sm mt-4 pt-2">
                                    <label className="flex items-start gap-2.5 text-slate-600 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            required
                                            name="terms"
                                            className="w-4 h-4 mt-0.5 text-[#10B981] border-slate-300 rounded focus:ring-[#10B981] focus:ring-offset-2"
                                        />
                                        <span className="leading-tight">
                                            I agree to the <a href="#" className="font-semibold text-[#10B981] hover:text-[#057857]">Terms of Service</a> and <a href="#" className="font-semibold text-[#10B981] hover:text-[#057857]">Privacy Policy</a>.
                                        </span>
                                    </label>
                                </div>

                                {/* Sign Up Button */}
                                <button
                                    type="submit"
                                    className="w-full py-3.5 mt-6 rounded-lg bg-[#10B981] text-white font-bold text-base hover:bg-[#057857] transition shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Create Account
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

                            {/* Login Link */}
                            <p className="text-sm text-center text-slate-600">
                                Already have an account?{' '}
                                <a href="/login" className="font-bold text-[#10B981] hover:text-[#057857]">
                                    Sign In
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-auto px-6 py-8 border-t border-slate-100 flex flex-col md:flex-row md:justify-between items-center text-xs text-slate-500 space-y-4 md:space-y-0 relative z-10">
                    <div className="flex items-center gap-6">
                        <span className="text-base font-bold text-[#10B981] uppercase tracking-wider">
                            PassOP
                        </span>
                        <span>© 2024 PassOP. Encrypted & Secure.</span>
                    </div>
                    <div className="flex items-center gap-6 uppercase font-semibold text-slate-600 tracking-wide">
                        <a href="#" className="hover:text-[#10B981]">PRIVACY</a>
                        <a href="#" className="hover:text-[#10B981]">TERMS</a>
                        <a href="#" className="hover:text-[#10B981]">SECURITY PROTOCOL</a>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Signup;