import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, UserCircle, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FILE_BASE_URL } from '../config/constants';

const Navbar = () => {
    const { user, logout, role, isAuthenticated, getDashboardPath } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setDropdownOpen(false);
        setIsOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        setDropdownOpen(false);
        navigate('/login');
    };

    const handleHomeClick = (e) => {
        e.preventDefault();
        setIsOpen(false);
        navigate(isAuthenticated ? getDashboardPath() : '/');
    };

    const dashboardPath = isAuthenticated ? getDashboardPath() : '/';
    const isAdmin = role === 'admin';

    // Public nav links (non-admin)
    const publicLinks = [
        { to: '/', label: 'Home', onClick: handleHomeClick },
        { to: '/about', label: 'About Us' },
        { to: '/services', label: 'Services' },
        { to: '/contact', label: 'Contact Us' },
    ];

    // Admin nav links
    const adminLinks = [
        { to: '/admin/dashboard', label: 'Dashboard' },
    ];

    const navLinks = isAdmin && isAuthenticated ? adminLinks : publicLinks;

    return (
        <nav className={`${isAdmin && isAuthenticated ? 'bg-gradient-to-r from-indigo-700 to-purple-700' : 'bg-white'} shadow-md fixed w-full z-50 top-0 left-0`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <button onClick={handleHomeClick} className="flex items-center gap-2">
                            {isAdmin && isAuthenticated ? (
                                <ShieldCheck size={28} className="text-white" />
                            ) : (
                                <img src="/src/assets/logo.png" alt="Curelex Logo" className="h-8 w-auto" />
                            )}
                            <span className={`text-2xl font-bold tracking-tighter hidden sm:block ${isAdmin && isAuthenticated ? 'text-white' : 'text-blue-600'}`}>
                                {isAdmin && isAuthenticated ? 'Curelex Admin' : 'Curelex'}
                            </span>
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-6 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={(e) => { link.onClick ? link.onClick(e) : setIsOpen(false); }}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isAdmin && isAuthenticated
                                    ? 'text-indigo-100 hover:text-white hover:bg-white/10'
                                    : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {isAuthenticated && user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    {user.profileImageUrl ? (
                                        <img
                                            src={`${FILE_BASE_URL}${user.profileImageUrl}`}
                                            alt={user.name}
                                            className={`h-9 w-9 rounded-full object-cover border-2 ${isAdmin ? 'border-white/50' : 'border-blue-200'}`}
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                        />
                                    ) : null}
                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm ${isAdmin ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}
                                        style={{ display: user.profileImageUrl ? 'none' : 'flex' }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={`text-sm font-medium ${isAdmin ? 'text-white' : 'text-gray-900'}`}>{user.name}</span>
                                    <ChevronDown size={16} className={isAdmin ? 'text-indigo-200' : 'text-gray-500'} />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate capitalize">{role}</p>
                                        </div>
                                        <Link
                                            to={dashboardPath}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        {!isAdmin && (
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                Profile Details
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <UserCircle size={18} />
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className={`${isAdmin && isAuthenticated ? 'text-white' : 'text-gray-700 hover:text-blue-600'} focus:outline-none p-2`}>
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className={`md:hidden ${isAdmin && isAuthenticated ? 'bg-indigo-800' : 'bg-white'} border-t ${isAdmin && isAuthenticated ? 'border-indigo-600' : 'border-gray-100'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={(e) => { link.onClick ? link.onClick(e) : setIsOpen(false); }}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isAdmin && isAuthenticated
                                    ? 'text-indigo-100 hover:text-white hover:bg-white/10'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isAuthenticated && user ? (
                            <>
                                <Link
                                    to={dashboardPath}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isAdmin ? 'text-indigo-100 hover:text-white' : 'text-gray-700 hover:text-blue-600'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                {!isAdmin && (
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600"
                                    >
                                        Profile Details
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 font-bold hover:bg-blue-50">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
