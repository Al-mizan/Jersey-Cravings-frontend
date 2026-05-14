"use client";

import { motion } from "motion/react";
import {
    Truck,
    Package,
    CheckCircle,
    Clock,
    MapPin,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface ShippingZone {
    zone: string;
    coverageArea: string;
    estimatedDelivery: string;
    shippingFee: string;
}

const shippingZones: ShippingZone[] = [
    {
        zone: "Dhaka City",
        coverageArea: "Dhaka North & South City Corporation areas",
        estimatedDelivery: "1-2 business days",
        shippingFee: "৳60",
    },
    {
        zone: "Dhaka Division",
        coverageArea: "Gazipur, Narayanganj, Manikganj, Munshiganj, Narsingdi",
        estimatedDelivery: "2-3 business days",
        shippingFee: "৳80",
    },
    {
        zone: "Chittagong",
        coverageArea: "Chittagong City & District",
        estimatedDelivery: "2-3 business days",
        shippingFee: "৳100",
    },
    {
        zone: "Sylhet",
        coverageArea: "Sylhet City & District",
        estimatedDelivery: "2-3 business days",
        shippingFee: "৳100",
    },
    {
        zone: "Major Districts",
        coverageArea: "Rajshahi, Khulna, Barisal, Rangpur, Comilla",
        estimatedDelivery: "2-3 business days",
        shippingFee: "৳120",
    },
    {
        zone: "Other Districts",
        coverageArea: "All other districts across Bangladesh",
        estimatedDelivery: "3-5 business days",
        shippingFee: "৳150",
    },
];

const deliverySteps = [
    {
        icon: Package,
        title: "Order Placed",
        description: "Your order is confirmed and being processed",
    },
    {
        icon: CheckCircle,
        title: "Processing",
        description: "We're preparing your jersey for shipment",
    },
    {
        icon: Truck,
        title: "Dispatched",
        description: "Your package is on its way to you",
    },
    {
        icon: MapPin,
        title: "Delivered",
        description: "Your jersey has arrived!",
    },
];

const shippingFAQs = [
    {
        question: "What is the order cut-off time?",
        answer: "Orders placed before 2:00 PM are processed the same day. Orders after 2:00 PM are processed the next business day.",
    },
    {
        question: "Are there any delivery delays during holidays?",
        answer: "Delivery times may be extended during major holidays like Eid, Pohela Boishakh, and other national holidays. We recommend placing orders in advance during these periods.",
    },
    {
        question: "Is Cash on Delivery (COD) available?",
        answer: "Yes, COD is available for all orders within Bangladesh. You can choose this option at checkout and pay the delivery agent when your package arrives.",
    },
    {
        question: "Can I track my shipment?",
        answer: "Absolutely! Once your order is shipped, you'll receive a tracking number via SMS and email. You can track your package in real-time through our website or the courier's tracking portal.",
    },
];

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20"></div>
                <div className="relative container mx-auto px-4 py-20 lg:py-28">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight">
                            Fast & Reliable{" "}
                            <span className="text-red-500">Delivery</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            We deliver premium jerseys across Bangladesh with
                            speed, care, and real-time tracking.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Delivery Timeline Cards */}
            <section className="py-16 lg:py-24 bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold mb-4 text-white">
                            Delivery Timeline
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Get your jerseys delivered quickly based on your
                            location
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border-green-500/50 overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                                            <Truck className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                Inside Dhaka
                                            </h3>
                                            <p className="text-green-400 font-semibold">
                                                1–2 business days
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm">
                                        Fast delivery within Dhaka North & South
                                        City Corporation areas
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border-blue-500/50 overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                                            <Package className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                Outside Dhaka
                                            </h3>
                                            <p className="text-blue-400 font-semibold">
                                                2–3 business days
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm">
                                        Reliable delivery to all districts
                                        across Bangladesh
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Order Process Flow */}
            <section className="py-16 lg:py-24 bg-gray-900">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold mb-4 text-white">
                            How It Works
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Track your order from placement to delivery
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {deliverySteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.8,
                                        delay: index * 0.1,
                                    }}
                                    className="text-center"
                                >
                                    <div className="relative">
                                        <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500/50">
                                            <Icon className="w-10 h-10 text-red-500" />
                                        </div>
                                        {index < deliverySteps.length - 1 && (
                                            <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-red-500/50 to-transparent -translate-x-1/2" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        {step.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Shipping Zones Table */}
            {/* <section className="py-16 lg:py-24 bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold mb-4 text-white">
                            Shipping Zones & Fees
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Delivery times and fees by region
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-5xl mx-auto"
                    >
                        <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gray-700/50 hover:bg-transparent">
                                                <TableHead className="text-white font-semibold">
                                                    Zone
                                                </TableHead>
                                                <TableHead className="text-white font-semibold">
                                                    Coverage Area
                                                </TableHead>
                                                <TableHead className="text-white font-semibold">
                                                    Estimated Delivery
                                                </TableHead>
                                                <TableHead className="text-white font-semibold text-right">
                                                    Shipping Fee
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {shippingZones.map(
                                                (zone, index) => (
                                                    <TableRow
                                                        key={zone.zone}
                                                        className="border-gray-700/30 hover:bg-gray-800/50 transition-colors"
                                                    >
                                                        <TableCell className="text-white font-medium">
                                                            {zone.zone}
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">
                                                            {zone.coverageArea}
                                                        </TableCell>
                                                        <TableCell className="text-gray-300">
                                                            {
                                                                zone.estimatedDelivery
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-red-400 font-bold text-right">
                                                            {zone.shippingFee}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section> */}

            {/* Free Shipping Banner */}
            <section className="py-12 bg-gradient-to-r from-red-600 to-orange-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex items-center justify-center mb-4">
                            <Shield className="w-12 h-12 text-white mr-4" />
                            <h2 className="text-3xl lg:text-4xl font-bold text-white">
                                Free Delivery on Orders Above ৳3000
                            </h2>
                        </div>
                        <p className="text-xl text-gray-200 mb-6">
                            Shop more and save on shipping costs!
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Shipping Policy Notes */}
            <section className="py-16 lg:py-24 bg-gray-900">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold mb-4 text-white">
                            Shipping Policy
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Important information about our shipping process
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
                                <CardContent className="p-6">
                                    <div className="flex items-start mb-4">
                                        <Clock className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-white mb-2">
                                                Order Processing Time
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                Orders are processed within
                                                24-48 hours on business days.
                                                Custom jerseys may take
                                                additional 2-3 business days for
                                                printing.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700/50">
                                <CardContent className="p-6">
                                    <div className="flex items-start mb-4">
                                        <Shield className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-white mb-2">
                                                Secure Packaging
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                All jerseys are carefully
                                                packaged in protective materials
                                                to ensure they arrive in perfect
                                                condition.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Shipping FAQ Accordion */}
            <section className="py-16 lg:py-24 bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold mb-4 text-white">
                            Shipping FAQs
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Quick answers to common shipping questions
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-4xl mx-auto"
                    >
                        <Accordion type="multiple" className="space-y-4">
                            {shippingFAQs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1,
                                    }}
                                >
                                    <AccordionItem
                                        value={`faq-${index}`}
                                        className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 rounded-xl overflow-hidden"
                                    >
                                        <AccordionTrigger className="px-6 py-5 text-left hover:no-underline hover:bg-gray-800/50 transition-colors">
                                            <span className="text-base font-semibold text-white">
                                                {faq.question}
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-5 text-gray-300 leading-relaxed">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                </motion.div>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
