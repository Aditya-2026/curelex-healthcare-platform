import React from 'react';
import { ArrowRight, Activity, ShieldCheck, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'patient') {
                navigate('/patient/dashboard');
            } else if (user.role === 'doctor') {
                navigate('/doctor/dashboard');
            }
        }
    }, [user, navigate]);
    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6"
                        >
                            Advanced Healthcare <br />
                            <span className="text-blue-600">Simplified.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-lg md:text-xl text-gray-600 mb-8"
                        >
                            Connect with top specialists, manage your health records, and experience the future of medical care with Curelex.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col sm:flex-row justify-center gap-4"
                        >
                            <Link to="/login" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                                Get Started
                                <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                            </Link>
                            <Link to="/about" className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
                                Learn More
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </section>

            {/* Features Overview */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <Activity className="text-blue-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Monitoring</h3>
                            <p className="text-gray-600">Track your vitals and health progress with our advanced patient dashboard.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                                <ShieldCheck className="text-green-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Records</h3>
                            <p className="text-gray-600">Your medical history is encrypted and stored securely, accessible only to you.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                                <Users className="text-purple-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Specialists</h3>
                            <p className="text-gray-600">Connect with verified doctors from top institutes and hospitals instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Preview */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-600 rounded-2xl transform rotate-3 opacity-10"></div>
                                <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Medical Team" className="relative rounded-2xl shadow-xl w-full" />
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Redefining Healthcare Access</h2>
                            <p className="text-gray-600 mb-6 text-lg">
                                Curelex is committed to bridging the gap between patients and quality healthcare. Our vision is to create a seamless ecosystem where medical assistance is just a click away.
                            </p>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                    24/7 Patient Support
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                    Paperless Prescriptions
                                </li>
                                <li className="flex items-center text-gray-700">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                                    Verified Doctors Network
                                </li>
                            </ul>
                            <Link to="/about" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center">
                                Read our full mission <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
