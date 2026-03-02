import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Key, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/auth/send-otp?email=${email}&type=forgot-password`);
            setStep(2);
            alert(`OTP sent to ${email}`);
        } catch (error) {
            console.error("OTP Error:", error);
            alert(error.response?.data || "Failed to send OTP. User may not exist.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            alert("Password Reset Successful! Please login with your new password.");
            navigate('/login');
        } catch (error) {
            console.error("Reset Error:", error);
            alert(error.response?.data || "Failed to reset password. Invalid OTP?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 flex flex-col justify-center sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Key className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {step === 1 ? "Enter your email to receive a verification code" : "Enter the code and your new password"}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">

                    {step === 1 ? (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
                                >
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Send OTP"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                    OTP Code
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        maxLength="6"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                                        placeholder="Enter 6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                                        placeholder="Min. 8 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CheckCircle className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                                        placeholder="Retype password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                                        aria-label="Toggle confirm password visibility"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
                                >
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Reset Password"}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
