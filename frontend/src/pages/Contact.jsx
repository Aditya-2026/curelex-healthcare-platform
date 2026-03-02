import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, Linkedin, Twitter, Instagram, Facebook, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        inquiryType: 'General Inquiry',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus(null);

        try {
            await api.post('/contact', formData);
            setSubmitStatus('success');
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                inquiryType: 'General Inquiry',
                message: ''
            });
            setTimeout(() => setSubmitStatus(null), 5000);
        } catch (error) {
            console.error("Contact Form Error:", error);
            setSubmitStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-20 pb-12">
            {/* 1. Heading Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-extrabold text-gray-900 sm:text-5xl"
                >
                    We’re Here to Help You 24/7
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto"
                >
                    Reach out to Curelex HealthTech for patient support, doctor registration, partnerships, or any healthcare-related inquiries.
                </motion.p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* 2. Left Section — Contact Details + Social */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        {/* Contact Info Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                                        <MapPin className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-lg font-medium text-gray-900">Company Address</p>
                                        <p className="mt-1 text-gray-600">
                                            IIIT Allahabad Incubation Centre (IIIC)<br />
                                            Devghat, Jhalwa, Prayagraj,<br />
                                            Uttar Pradesh, 211015
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                                        <Mail className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-lg font-medium text-gray-900">Official Email</p>
                                        <a href="mailto:support@curelex.in" className="mt-1 text-blue-600 hover:text-blue-500 block">
                                            support@curelex.in
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                                        <Phone className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-lg font-medium text-gray-900">Phone Number</p>
                                        <a href="tel:+917880894345" className="mt-1 text-gray-600 hover:text-blue-600 block">
                                            +91 788 089 4345
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Follow Us On</h3>
                            <div className="flex space-x-6">
                                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors transform hover:scale-110">
                                    <Linkedin className="h-8 w-8" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors transform hover:scale-110">
                                    <Twitter className="h-8 w-8" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors transform hover:scale-110">
                                    <Instagram className="h-8 w-8" />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-blue-800 transition-colors transform hover:scale-110">
                                    <Facebook className="h-8 w-8" />
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* 3. Right Section — Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl shadow-xl p-8 border border-blue-50"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="fullName"
                                    id="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                                    placeholder="Your Name"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        id="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                                        placeholder="+91 12345 56789"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700">Subject / Inquiry Type <span className="text-red-500">*</span></label>
                                <select
                                    id="inquiryType"
                                    name="inquiryType"
                                    required
                                    value={formData.inquiryType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                                >
                                    <option>General Inquiry</option>
                                    <option>Patient Support</option>
                                    <option>Doctor Registration</option>
                                    <option>Technical Issue</option>
                                    <option>Partnership Request</option>
                                    <option>Emergency Assistance</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message <span className="text-red-500">*</span></label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 border"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-[1.02] disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>

                            {/* Success/Error Message */}
                            {submitStatus === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-md bg-green-50 text-green-700 text-sm font-medium text-center"
                                >
                                    Message sent successfully! We'll get back to you soon.
                                </motion.div>
                            )}
                            {submitStatus === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-md bg-red-50 text-red-700 text-sm font-medium text-center"
                                >
                                    Failed to send message. Please try again later.
                                </motion.div>
                            )}
                        </form>
                    </motion.div>
                </div>

                {/* 4. Quick Support Note */}
                <div className="mt-12 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg max-w-3xl mx-auto flex items-start shadow-sm">
                    <AlertCircle className="flex-shrink-0 h-6 w-6 text-yellow-600 mt-0.5" />
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700 font-medium">
                            <span className="font-bold">For urgent medical queries:</span> Please use our emergency helpline or visit the nearest hospital. This form is for general inquiries only and may have a delayed response time.
                        </p>
                    </div>
                </div>

                {/* 6. Google Map Full Width */}
                <div className="mt-16 bg-white rounded-xl shadow-lg overflow-hidden h-[450px] relative group">
                    <a
                        href="https://www.google.com/maps/place/IIIT+Allahabad/@25.4309076,81.7686852,17z"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full relative"
                    >
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity z-10 flex items-center justify-center">
                            <span className="bg-white px-4 py-2 rounded-full shadow-lg font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">View on Google Maps</span>
                        </div>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3603.220188610738!2d81.76868517551984!3d25.43090757755717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399aca788aaa78ad%3A0x1d2e54723f6d790d!2sIIIT%20Allahabad!5e0!3m2!1sen!2sin!4v1708320000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Curelex Location"
                            className="pointer-events-none"
                        ></iframe>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Contact;
