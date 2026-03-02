
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Briefcase, FileText, Upload, Building, Award, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

const DoctorSignup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        gender: 'Select',
        mobile: '',
        specialization: '',
        registrationNumber: '',
        registrationState: '',
        currentHospital: '',
        experienceYears: '',
        patientsTreated: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });

    const [photo, setPhoto] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e, setFile) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
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

    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        if (formData.password !== formData.confirmPassword) {
            setValidationError("Passwords do not match!");
            return;
        }

        if (!photo) {
            setValidationError("Please upload your professional photo.");
            return;
        }

        if (!certificate) {
            setValidationError("Please upload your registration certificate.");
            return;
        }

        if (!formData.otp) {
            setValidationError("Please enter the OTP sent to your email.");
            return;
        }

        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        if (photo) data.append('photo', photo);
        if (certificate) data.append('certificate', certificate);

        try {
            const response = await api.post('/doctors/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.status === 200) {
                alert("Application Submitted! Your account is pending approval.");
                navigate('/');
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
            <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Doctor Registration
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join our network of healthcare professionals
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-8" onSubmit={handleSubmit}>

                        {validationError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                                ⚠️ {validationError}
                            </div>
                        )}

                        <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
                            <Briefcase className="text-yellow-600 mt-1 mr-3 flex-shrink-0" size={20} />
                            <p className="text-sm text-yellow-800">
                                <strong>Note:</strong> Your account will require admin approval. Please provide valid registration details and documents.
                            </p>
                        </div>

                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            <User size={16} />
                                        </span>
                                        <input type="text" name="fullName" id="fullName" required value={formData.fullName} onChange={handleChange} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3" />
                                    </div>
                                </div>

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

                                <div className="sm:col-span-3">
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Verification Code</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            <Award size={16} />
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

                                <div className="sm:col-span-3">
                                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            <Phone size={16} />
                                        </span>
                                        <input type="tel" name="mobile" id="mobile" required value={formData.mobile} onChange={handleChange} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3" placeholder="e.g. 9876543210" />
                                    </div>
                                </div>

                                <div className="sm:col-span-1">
                                    <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                                    <input type="number" name="age" id="age" required value={formData.age} onChange={handleChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3" />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select id="gender" name="gender" required value={formData.gender} onChange={handleChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                        <option>Select</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Professional Details */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Professional Details</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            <Award size={16} />
                                        </span>
                                        <input type="text" name="specialization" id="specialization" required value={formData.specialization} onChange={handleChange} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3" placeholder="e.g. Cardiologist" />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                                    <input type="number" name="experienceYears" id="experienceYears" required value={formData.experienceYears} onChange={handleChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3" />
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="patientsTreated" className="block text-sm font-medium text-gray-700">Patients Treated</label>
                                    <input type="number" name="patientsTreated" id="patientsTreated" required value={formData.patientsTreated} onChange={handleChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3" />
                                </div>

                                <div className="sm:col-span-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                            <div className="relative mt-1">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    id="password"
                                                    required
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border pl-3 pr-10"
                                                    placeholder="Create a password"
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
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                            <div className="relative mt-1">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    id="confirmPassword"
                                                    required
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border pl-3 pr-10"
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

                                <div className="sm:col-span-3">
                                    <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">Registration Number</label>
                                    <input type="text" name="registrationNumber" id="registrationNumber" required value={formData.registrationNumber} onChange={handleChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3" />
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="registrationState" className="block text-sm font-medium text-gray-700">Registration Council/State</label>
                                    <input type="text" name="registrationState" id="registrationState" required value={formData.registrationState} onChange={handleChange} className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 border px-3" />
                                </div>

                                <div className="sm:col-span-6">
                                    <label htmlFor="currentHospital" className="block text-sm font-medium text-gray-700">Current Hospital / Clinic</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            <Building size={16} />
                                        </span>
                                        <input type="text" name="currentHospital" id="currentHospital" required value={formData.currentHospital} onChange={handleChange} className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 border px-3" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documents Upload */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Documents</h3>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Professional Photo</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
                                        <div className="space-y-1 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="photo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>Upload a file</span>
                                                    <input id="photo-upload" name="photo" type="file" className="sr-only" onChange={(e) => handleFileChange(e, setPhoto)} accept="image/*" />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                            {photo && <p className="text-sm text-green-600 font-medium">{photo.name}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Registration Certificate</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
                                        <div className="space-y-1 text-center">
                                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="cert-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                    <span>Upload a file</span>
                                                    <input id="cert-upload" name="certificate" type="file" className="sr-only" onChange={(e) => handleFileChange(e, setCertificate)} accept=".pdf,.jpg,.png" />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PDF, JPG up to 10MB</p>
                                            {certificate && <p className="text-sm text-green-600 font-medium">{certificate.name}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-5">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                            >
                                {loading ? <><Loader2 className="animate-spin mr-2" /> Submitting Application...</> : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DoctorSignup;
