import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/admin/login', { email, password });
            if (response.status === 200) {
                const { token, name, role, id } = response.data;
                login({ name, role, id }, token);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-12 flex flex-col justify-center sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                        <ShieldCheck size={32} className="text-white" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Admin Portal
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Secure admin access to the Curelex platform
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-2xl sm:px-10 border border-gray-100">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700">
                                Admin Email
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="admin-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                                    placeholder="admin@curelex.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="admin-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-lg py-2.5 border"
                                    placeholder="••••••••"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign in as Admin'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1">
                            <ArrowLeft size={14} /> Back to User Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
