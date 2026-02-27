import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import PatientSignup from './pages/PatientSignup';
import DoctorSignup from './pages/DoctorSignup';
import PatientDashboard from './pages/PatientDashboard';
import PatientRecords from './pages/PatientRecords';
import ProfileDetails from './pages/ProfileDetails';
import DoctorDashboard from './pages/DoctorDashboard';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import DoctorConsultation from './components/dashboard/DoctorConsultation';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import { AuthProvider, useAuth } from './context/AuthContext';

// Smart Home: redirects authenticated users to their dashboard
const SmartHome = () => {
    const { isAuthenticated, getDashboardPath } = useAuth();
    if (isAuthenticated) {
        return <Navigate to={getDashboardPath()} replace />;
    }
    return <Home />;
};

function AppContent() {
    return (
        <Router>
            <ScrollToTop />
            <div className="bg-white min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<SmartHome />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/register/patient" element={<PatientSignup />} />
                        <Route path="/register/doctor" element={<DoctorSignup />} />

                        {/* Protected: Patient */}
                        <Route path="/patient/dashboard" element={
                            <RoleProtectedRoute allowedRoles={['patient']}>
                                <PatientDashboard />
                            </RoleProtectedRoute>
                        } />
                        <Route path="/patient/records" element={
                            <RoleProtectedRoute allowedRoles={['patient']}>
                                <PatientRecords />
                            </RoleProtectedRoute>
                        } />

                        {/* Protected: Profile (Patient + Doctor) */}
                        <Route path="/profile" element={
                            <RoleProtectedRoute allowedRoles={['patient', 'doctor']}>
                                <ProfileDetails />
                            </RoleProtectedRoute>
                        } />

                        {/* Protected: Doctor */}
                        <Route path="/doctor/dashboard" element={
                            <RoleProtectedRoute allowedRoles={['doctor']}>
                                <DoctorDashboard />
                            </RoleProtectedRoute>
                        } />
                        <Route path="/doctor/consultation/:patientId" element={
                            <RoleProtectedRoute allowedRoles={['doctor']}>
                                <DoctorConsultation />
                            </RoleProtectedRoute>
                        } />

                        {/* Admin Login (public) */}
                        <Route path="/admin/login" element={<AdminLogin />} />

                        {/* Protected: Admin */}
                        <Route path="/admin/dashboard" element={
                            <RoleProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </RoleProtectedRoute>
                        } />

                        {/* Public pages */}
                        <Route path="/about" element={<About />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
