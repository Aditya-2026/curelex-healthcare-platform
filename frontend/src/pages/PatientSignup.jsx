import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Heart, Shield, Lock, FileText, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const PatientSignup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: 'Select',
        mobile: '',
        email: '',
        address: '',
        emergencyContact: '',
        aadhaarNumber: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });

    const [profileImage, setProfileImage] = useState(null);

    const [otpSent, setOtpSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.email) {
            alert("Please enter your email first.");
            return;
        }
        try {
            setLoading(true);
            await api.post(`/auth/send-otp?email=${formData.email}&type=registration`);
            setOtpSent(true);
            alert(`OTP sent to ${formData.email}`);
        } catch (error) {
            console.error("OTP Error:", error);
            alert(error.response?.data || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        if (!formData.otp) {
            alert("Please enter the OTP sent to your email.");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (profileImage) {
                data.append('profileImage', profileImage);
            }

            const response = await api.post('/patients/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 200) {
                alert("Registration Successful! Please login.");
                navigate('/login');
            }
        } catch (error) {
            console.error("Registration Error:", error);
            alert(error.response?.data || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 flex flex-col justify-center sm:px-6 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Create your Patient Account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
                            <Shield className="text-blue-600 mt-1 mr-3 flex-shrink-0" size={20} />
                            <p className="text-sm text-blue-800">
                                Your personal data is encrypted and securely stored. We only use this information to provide better healthcare services.
                            </p>
                        </div>

                        {/* Profile Image */}
                        <div className="flex justify-center mb-6">
                            <div className="text-center">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <div className="flex flex-col items-center">
                                            {profileImage ? (
                                                <div className="h-24 w-24 rounded-full overflow-hidden mb-2">
                                                    <img src={URL.createObjectURL(profileImage)} alt="Preview" className="h-full w-full object-cover" />
                                                </div>
                                            ) : (
                                                <User className="mx-auto h-12 w-12 text-gray-400" />
                                            )}
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="profile-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>Upload a photo</span>
                                                    <input id="profile-upload" name="profileImage" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                            {/* Full Name */}
                            <div className="sm:col-span-3">
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <User size={16} />
                                    </span>
                                    <input type="text" name="fullName" id="fullName" required value={formData.fullName} onChange={handleChange} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3" />
                                </div>
                            </div>

                            {/* Age */}
                            <div className="sm:col-span-1">
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                                <input type="number" name="age" id="age" required value={formData.age} onChange={handleChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3" />
                            </div>

                            {/* Gender */}
                            <div className="sm:col-span-2">
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                <select id="gender" name="gender" required value={formData.gender} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                    <option>Select</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            {/* Mobile */}
                            <div className="sm:col-span-3">
                                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <Phone size={16} />
                                    </span>
                                    <input type="text" name="mobile" id="mobile" required value={formData.mobile} onChange={handleChange} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3" placeholder="+91" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="sm:col-span-3">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <Mail size={16} />
                                    </span>
                                    <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3" />
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={loading || otpSent}
                                        className={`ml-2 px-3 py-2 rounded-md text-white font-medium text-sm transition-colors ${otpSent ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        {otpSent ? 'Sent' : 'Verify'}
                                    </button>
                                </div>
                            </div>

                            {/* OTP Input - Patient */}
                            <div className="sm:col-span-3">
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Verification Code</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <Shield size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        name="otp"
                                        id="otp"
                                        required
                                        maxLength="6"
                                        value={formData.otp || ''}
                                        onChange={handleChange}
                                        className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3"
                                        placeholder="Enter 6-digit OTP"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="sm:col-span-6">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Full Address</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <MapPin size={16} />
                                    </span>
                                    <input type="text" name="address" id="address" required value={formData.address} onChange={handleChange} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3" />
                                </div>
                            </div>

                            {/* Aadhaar */}
                            <div className="sm:col-span-3">
                                <label htmlFor="aadhaarNumber" className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <FileText size={16} />
                                    </span>
                                    <input type="text" name="aadhaarNumber" id="aadhaarNumber" required value={formData.aadhaarNumber} onChange={handleChange} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3" placeholder="12-digit number" />
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="sm:col-span-3">
                                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <Heart size={16} />
                                    </span>
                                    <input type="text" name="emergencyContact" id="emergencyContact" required value={formData.emergencyContact} onChange={handleChange} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3" placeholder="Relation & Number" />
                                </div>
                            </div>

                            {/* Password Used for Login */}
                            <div className="sm:col-span-3">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Create Password</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <Lock size={16} />
                                    </span>
                                    <div className="relative w-full flex-1 min-w-0 flex">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            id="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border pl-3 pr-10"
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
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        <Lock size={16} />
                                    </span>
                                    <div className="relative w-full flex-1 min-w-0 flex">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            id="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border pl-3 pr-10"
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
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input id="terms" name="terms" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" required />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                            >
                                {loading ? <><Loader2 className="animate-spin mr-2" /> Creating Account...</> : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


export default PatientSignup;
