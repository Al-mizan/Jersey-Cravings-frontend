"use client";

import { motion } from "motion/react";
import { Shield, Truck, CreditCard, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20"></div>
                <div className="relative container mx-auto px-4 py-16 sm:py-20 lg:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-6 tracking-tight">
                            We <span className="text-red-500">Live</span> for
                            the <span className="text-orange-500">Game</span>
                        </h1>
                        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Premium football jerseys for passionate fans who
                            demand quality, authenticity, and style that stands
                            out on and off the pitch.
                        </p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <Button
                                size="lg"
                                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold rounded-full shadow-2xl hover:shadow-red-600/25 transition-all duration-300"
                                asChild
                            >
                                <Link
                                    href="/products"
                                    className="flex items-center"
                                >
                                    Shop Now
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-12 sm:py-16 lg:py-32 bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center max-w-6xl mx-auto"
                    >
                        <div className="space-y-8">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-white">
                                Our Story
                            </h2>
                            <div className="space-y-6 text-gray-300 leading-relaxed">
                                <p>
                                    Born from the streets of Dhaka to the global
                                    stage, Jersey Cravings represents the fusion
                                    of football passion and premium quality
                                    craftsmanship. What started as a small dream
                                    has grown into Bangladesh's most trusted
                                    destination for authentic football jerseys.
                                </p>
                                <p>
                                    Every stitch, every fabric, and every design
                                    tells a story of dedication to the beautiful
                                    game. We don't just sell jerseys – we
                                    deliver pride, identity, and belonging to
                                    fans who live and breathe football.
                                </p>
                                <p>
                                    From local pitches to international
                                    stadiums, our jerseys have become the
                                    uniform of champions, worn with pride by
                                    supporters who understand that true quality
                                    never goes out of style.
                                </p>
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative aspect-[4/5] sm:aspect-3/4 lg:aspect-4/5 overflow-hidden rounded-2xl shadow-2xl">
                                <Image
                                    src="/jersey_craftsmanship.png"
                                    alt="Jersey craftsmanship"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-12 sm:py-16 lg:py-32 bg-gray-900">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white">
                            Why Choose Jersey Cravings
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto">
                            We're not just another jersey store. We're your
                            partner in football excellence.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                icon: Shield,
                                title: "Authentic Imported Products",
                                description:
                                    "100% genuine jerseys with verified quality certificates and authenticity guarantees.",
                            },
                            {
                                icon: Truck,
                                title: "Fast Delivery",
                                description:
                                    "Quick delivery across Bangladesh with real-time tracking and secure packaging.",
                            },
                            {
                                icon: CreditCard,
                                title: "100% Secure Payment",
                                description:
                                    "Multiple payment options with bank-level security and buyer protection.",
                            },
                            {
                                icon: Trophy,
                                title: "Custom Jerseys",
                                description:
                                    "Personalized jerseys with custom names, numbers, and unique designs.",
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.1,
                                }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center hover:bg-gray-800/70 transition-all duration-300 border border-gray-700/50 hover:border-red-500/50"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-600/20 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                                    <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-3 text-white">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Brand Values Section */}
            <section className="py-12 sm:py-16 lg:py-32 bg-gradient-to-r from-red-600/10 to-orange-600/10">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-white">
                            Our Values
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto">
                            The principles that guide everything we do, every
                            single day.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
                        {[
                            {
                                value: "PASSION",
                                description:
                                    "Football runs through our veins. Every jersey represents our love for the beautiful game.",
                            },
                            {
                                value: "QUALITY",
                                description:
                                    "No compromises on craftsmanship. Premium materials, stitched to perfection.",
                            },
                            {
                                value: "COMMUNITY",
                                description:
                                    "Building a family of football fans who share our dreams and values.",
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={item.value}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.15,
                                }}
                                className="text-center"
                            >
                                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-red-500 mb-4 tracking-wider">
                                    {item.value}
                                </div>
                                <p className="text-gray-300 leading-relaxed max-w-sm mx-auto">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 lg:py-32 bg-gradient-to-r from-red-600 to-orange-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 text-white">
                            Ready to Wear Your Pride?
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
                            Join thousands of satisfied customers who trust
                            Jersey Cravings for authentic football jerseys that
                            make a statement.
                        </p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <Button
                                size="lg"
                                className="bg-white text-red-600 hover:bg-gray-100 px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
                                asChild
                            >
                                <Link
                                    href="/products"
                                    className="flex items-center"
                                >
                                    Shop Collection
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
