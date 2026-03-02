import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Globe, ShieldCheck, Heart, Cpu } from 'lucide-react';
import iiitLogo from '../assets/IIIT_Allahabad.png';
import unitedLogo from '../assets/United University.jpeg';
import aitLogo from '../assets/Asian Institute of Technology.jpg';

const About = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-16">
            {/* 1. Brief Company Introduction Section */}
            <section className="relative bg-white overflow-hidden">
                <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-6">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
                        <main className="mt-10 md:mt-12 mx-auto w-full">
                            <div className="grid lg:grid-cols-12 gap-2 lg:gap-4 items-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40">
                                {/* Logo Section */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6 }}
                                    className="flex justify-center lg:justify-end lg:pr-4 order-1 lg:col-span-4"
                                >
                                    <img
                                        src="/src/assets/logo.png"
                                        alt="Curelex Logo"
                                        className="w-40 md:w-56 lg:w-64 max-w-full h-auto"
                                    />
                                </motion.div>

                                {/* About Content */}
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeIn}
                                    transition={{ duration: 0.6 }}
                                    className="text-left order-2 lg:col-span-8 max-w-none"
                                >
                                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center md:text-left">
                                        <span className="block">About</span>
                                        <span className="block text-blue-600 mt-2">Curelex HealthTech</span>
                                    </h1>
                                    <p className="mt-3 text-gray-600 leading-relaxed text-lg text-center md:text-left">
                                        Bridging the gap between patients and super specialist doctors through our innovative hybrid e-clinics and advanced telemedicine platform.
                                    </p>
                                    <p className="mt-3 text-gray-600 leading-relaxed text-lg text-center md:text-left">
                                        At Curelex, we are building a digital medical ecosystem that leverages technology to provide accessible, efficient, and affordable healthcare. We connect patients in remote and urban areas directly with top-tier specialists, ensuring that quality care is never out of reach.
                                    </p>
                                </motion.div>
                            </div>
                        </main>
                    </div>
                </div>
            </section>

            {/* 2. Vision and Mission Section */}
            <section className="py-16 bg-blue-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Vision */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-white rounded-2xl p-8 shadow-xl"
                        >
                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <Globe className="text-blue-600 h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                To lead the digital healthcare transformation by creating a scalable telemedicine ecosystem where expert specialist care is accessible to everyone, everywhere. We envision a future where technology eliminates geographical barriers, putting patient well-being at the center of innovation.
                            </p>
                        </motion.div>

                        {/* Mission */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-white rounded-2xl p-8 shadow-xl"
                        >
                            <div className="flex items-center mb-6">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <Activity className="text-blue-600 h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                To urge the gap between rural and urban healthcare through our hybrid physical-digital model. We are committed to empowering patients with instant access to super specialists, ensuring continuity of care through technology-enabled consultations that are both affordable and efficient.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. Healthcare Service Overview Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">What We Do</h2>
                        <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Comprehensive Healthcare Services
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col items-center text-center"
                            >
                                <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                                    {service.icon}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900">{service.title}</h4>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <motion.a
                            href="/services"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Explore Our Services
                        </motion.a>
                    </div>
                </div>
            </section>

            {/* 4. Supported By Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-12">
                        Supported By
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
                        {/* IIIT Allahabad */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="h-32 flex items-center justify-center mb-6 p-4 rounded-lg transition-transform transform group-hover:scale-105">
                                <img src={iiitLogo} alt="IIIT Allahabad" className="max-h-full max-w-full object-contain" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Indian Institute of Information Technology, Allahabad</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                An Institute of National Importance capable of delivering high-quality education and research in Information Technology.
                            </p>
                        </div>

                        {/* United University */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="h-32 flex items-center justify-center mb-6 p-4 rounded-lg transition-transform transform group-hover:scale-105">
                                <img src={unitedLogo} alt="United University" className="max-h-full max-w-full object-contain" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Startup and Incubation Cell United University</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                Dedicated to fostering innovation and entrepreneurship, providing resources and mentorship to budding startups.
                            </p>
                        </div>

                        {/* AIT */}
                        <div className="flex flex-col items-center text-center group">
                            <div className="h-32 flex items-center justify-center mb-6 p-4 rounded-lg transition-transform transform group-hover:scale-105">
                                <img src={aitLogo} alt="Asian Institute of Technology" className="max-h-full max-w-full object-contain" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Asian Institute of Technology</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                A leading international postgraduate institution promoting technological change and sustainable development in the region.
                            </p>
                        </div>
                    </div>
                </div>
            </section >
        </div >
    );
};

const services = [
    {
        title: "Hybrid e-Clinics",
        description: "Bridging the physical-digital divide with clinics equipped for initial diagnosis and tele-consultations.",
        icon: <Cpu size={28} />
    },
    {
        title: "Telemedicine",
        description: "Seamless video consultations connecting patients directly with specialists from the comfort of their location.",
        icon: <Globe size={28} />
    },
    {
        title: "Specialist Connect",
        description: "Access to a wide network of super-specialist doctors across various disciplines.",
        icon: <Users size={28} />
    },
    {
        title: "Patient Records",
        description: "Secure, digital maintenance of health records ensuring continuity of care and easy history tracking.",
        icon: <ShieldCheck size={28} />
    }
];

export default About;
