import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Company Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/src/assets/logo.png" alt="Curelex Logo" className="h-8 w-auto brightness-1" />
                            <h3 className="text-2xl font-bold text-blue-400">Curelex</h3>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Advanced healthcare management system designing for the future of patient care.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
                            <a href="https://www.instagram.com/curelexofficial?utm_source=qr&igsh=MWNobGQzMHdhdTRpNg%3D%3D" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
                            <a href="https://www.linkedin.com/company/curelex-healthtech/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
                        </div>
                        <div className="mt-4">
                            <a href="https://whatsapp.com/channel/0029Vb6h5rD90x2oWxVpiF1N" target="_blank" rel="noopener noreferrer" className="flex items-center text-green-400 hover:text-green-300 transition-colors">
                                <span className="mr-2">Join WhatsApp Channel</span>
                                <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link to="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                            {isAuthenticated ? (
                                <li>
                                    <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">
                                        Logout
                                    </button>
                                </li>
                            ) : (
                                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login / Register</Link></li>
                            )}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="text-blue-400 mr-3 mt-1 flex-shrink-0" size={18} />
                                <span className="text-gray-400">123 Health Tech Park, IIIT Allahabad Campus, Jhalwa, Prayagraj, UP, India</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="text-blue-400 mr-3 flex-shrink-0" size={18} />
                                <span className="text-gray-400">+91 788 089 4345</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="text-blue-400 mr-3 flex-shrink-0" size={18} />
                                <span className="text-gray-400">info.curelex@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Map Embed */}
                    <div className="h-48 rounded-lg overflow-hidden bg-gray-800">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14408.384232333465!2d81.76868884999999!3d25.467888850000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399aca788aad787d%3A0x63346087dff55d7e!2sIndian%20Institute%20of%20Information%20Technology%2C%20Allahabad!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>

                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Curelex. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
