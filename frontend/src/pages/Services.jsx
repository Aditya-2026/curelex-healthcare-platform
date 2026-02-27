import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Globe, Users, ShieldCheck } from 'lucide-react';

const Services = () => {
    return (
        <div className="bg-gray-50 min-h-screen pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">What We Offer</h2>
                    <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Our Healthcare Services
                    </h3>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        We provide a comprehensive range of digital and physical healthcare solutions designed to make quality medical care accessible to everyone.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col"
                        >
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-50 w-16 h-16 rounded-lg flex items-center justify-center text-blue-600 mr-4">
                                    {service.icon}
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900">{service.title}</h4>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed flex-grow">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const services = [
    {
        title: "Hybrid e-Clinics",
        description: "Bridging the physical-digital divide with clinics equipped for initial diagnosis and tele-consultations. Our centers are staffed with trained paramedics who assist in collecting vitals and facilitating the digital connection with specialist doctors, ensuring that even remote patients receive a physical touchpoint for their healthcare journey.",
        icon: <Cpu size={32} />
    },
    {
        title: "Telemedicine",
        description: "Seamless video consultations connecting patients directly with specialists from the comfort of their location. Our high-definition video platform ensures clear communication, allowing doctors to visually inspect patients and discuss symptoms in real-time, reducing the need for travel and waiting times.",
        icon: <Globe size={32} />
    },
    {
        title: "Specialist Connect",
        description: "Access to a wide network of super-specialist doctors across various disciplines including Cardiology, Neurology, Pediatrics, and more. We curate a panel of top-tier medical experts to ensure that patients have access to the best possible advice and treatment plans, regardless of their geographical location.",
        icon: <Users size={32} />
    },
    {
        title: "Patient Records",
        description: "Secure, digital maintenance of health records ensuring continuity of care and easy history tracking. Our encrypted database stores prescriptions, lab reports, and consultation history, making it easy for both patients and doctors to review past medical data for better informed decision-making.",
        icon: <ShieldCheck size={32} />
    }
];

export default Services;
