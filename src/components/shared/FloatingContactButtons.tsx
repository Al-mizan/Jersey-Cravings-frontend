"use client";

import { motion } from "motion/react";
import { FaFacebook, FaWhatsapp } from "react-icons/fa";

export function FloatingContactButtons() {
    const whatsappUrl = "https://wa.me/8801705094855";
    const facebookUrl = "https://www.facebook.com/groups/1678483723154956";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 sm:bottom-6 sm:right-6"
            style={{
                bottom: "1.5rem",
                right: "1rem",
            }}
        >
            {/* Facebook Button */}
            <motion.a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="group relative"
                title="Join our community"
            >
                <div className="relative">
                    {/* Pulse ring animation */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 0.3, 0.7],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0 bg-blue-600 rounded-full"
                    />

                    {/* Main button */}
                    <div className="relative w-12 h-12 sm:w-12 sm:h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                        <FaFacebook size={20} />
                    </div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Join our community
                </div>
            </motion.a>

            {/* WhatsApp Button */}
            <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
                className="group relative"
                title="Chat with us"
            >
                <div className="relative">
                    {/* Pulse ring animation */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.7, 0.3, 0.7],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0 bg-green-500 rounded-full"
                    />

                    {/* Main button */}
                    <div className="relative w-12 h-12 sm:w-12 sm:h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
                        <FaWhatsapp size={20} />
                    </div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    Chat with us
                </div>
            </motion.a>
        </motion.div>
    );
}
