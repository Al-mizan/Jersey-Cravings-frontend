"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { Search, MessageCircle, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: "orders" | "payments" | "shipping" | "products";
}

const faqs: FAQ[] = [
    // Orders
    {
        id: "order-1",
        question: "How do I place an order?",
        answer: "Browse our collection, select your favorite jersey, choose your size, and add it to cart. Proceed to checkout, fill in your shipping details, select your payment method, and confirm your order. You'll receive an order confirmation via email and SMS.",
        category: "orders",
    },
    {
        id: "order-2",
        question: "Can I cancel or modify my order?",
        answer: "Orders can be cancelled within 2 hours of placement. After that, once the order is processed, cancellation is not possible. For modifications, please contact our customer service immediately at +880 1705-094855 or via WhatsApp.",
        category: "orders",
    },
    {
        id: "order-3",
        question: "How do I track my order?",
        answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can track your order using this number on our website or the courier's website. Real-time updates are available throughout the delivery process.",
        category: "orders",
    },
    // Payments
    {
        id: "payment-1",
        question: "What payment methods do you accept?",
        answer: "We accept bKash, Nagad, Rocket, all major credit/debit cards (Visa, MasterCard), and Cash on Delivery (COD) for orders within Bangladesh. For international orders, we accept PayPal and international credit cards.",
        category: "payments",
    },
    {
        id: "payment-2",
        question: "Is my payment information secure?",
        answer: "Absolutely. We use SSL encryption and comply with PCI DSS standards to ensure your payment information is completely secure. We never store your full card details on our servers.",
        category: "payments",
    },
    {
        id: "payment-3",
        question: "What is your refund policy?",
        answer: "Refunds are processed within 7-10 business days for eligible returns. For payment gateway refunds (bKash, Nagad, cards), the amount will be credited back to your original payment method. For COD orders, refunds are processed via bank transfer or bKash/Nagad.",
        category: "payments",
    },
    // Shipping
    {
        id: "shipping-1",
        question: "What are the delivery times?",
        answer: "Inside Dhaka: 1-2 business days. Outside Dhaka: 2-3 business days. Remote areas may take 3-5 business days. Delivery times may vary during peak seasons or holidays.",
        category: "shipping",
    },
    {
        id: "shipping-2",
        question: "Do you offer free shipping?",
        answer: "Yes! We offer free shipping on orders above ৳1500 within Bangladesh. For orders below this threshold, a standard shipping fee of ৳60 applies.",
        category: "shipping",
    },
    {
        id: "shipping-3",
        question: "What if I miss my delivery?",
        answer: "If you miss your delivery, the courier will attempt delivery 2 more times. After 3 failed attempts, the package will be returned to our warehouse. You can contact us to reschedule delivery or arrange pickup from our Dhaka office.",
        category: "shipping",
    },
    // Products
    {
        id: "product-1",
        question: "Are your jerseys authentic?",
        answer: "Yes, all our jerseys are 100% authentic and sourced directly from authorized distributors. We provide authenticity certificates for premium jerseys and offer a quality guarantee on all products.",
        category: "products",
    },
    {
        id: "product-2",
        question: "What sizes do you offer?",
        answer: "We offer sizes from XS to 5XL for most jerseys. Each product page includes a detailed size chart with measurements in both inches and centimeters. If you're unsure, our customer service can help you choose the right size.",
        category: "products",
    },
    {
        id: "product-3",
        question: "Can I get a custom jersey with my name and number?",
        answer: "Absolutely! We offer custom jersey printing with your name and preferred number. Customization options are available on the product page. Please note that custom jerseys cannot be returned or exchanged unless there's a manufacturing defect.",
        category: "products",
    },
    {
        id: "product-4",
        question: "How do I care for my jersey?",
        answer: "Machine wash cold inside out with similar colors. Do not bleach. Tumble dry low or hang dry. Do not iron on the print. For custom printed jerseys, we recommend hand washing or using a gentle cycle to preserve the print quality.",
        category: "products",
    },
];

const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "orders", label: "Orders", icon: MessageCircle },
    { id: "payments", label: "Payments", icon: MessageCircle },
    { id: "shipping", label: "Shipping", icon: MessageCircle },
    { id: "products", label: "Products", icon: MessageCircle },
];

export default function FAQsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const filteredFAQs = faqs.filter((faq) => {
        const matchesSearch =
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === "all" || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryFAQs =
        selectedCategory === "all"
            ? filteredFAQs
            : filteredFAQs.filter((faq) => faq.category === selectedCategory);

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
                            Frequently Asked{" "}
                            <span className="text-red-500">Questions</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Find answers to common questions about orders,
                            payments, shipping, and products.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Search Bar */}
            <section className="py-8 bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 rounded-xl text-lg"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Category Tabs */}
            <section className="py-8 bg-gray-800/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto"
                    >
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <Button
                                    key={category.id}
                                    variant={
                                        selectedCategory === category.id
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() =>
                                        setSelectedCategory(category.id)
                                    }
                                    className={
                                        selectedCategory === category.id
                                            ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                                            : "bg-gray-900/50 border-gray-600 text-gray-300 hover:border-red-500 hover:text-white"
                                    }
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {category.label}
                                </Button>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Accordion */}
            <section className="py-12 lg:py-20 bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        {categoryFAQs.length > 0 ? (
                            <Accordion type="multiple" className="space-y-4">
                                {categoryFAQs.map((faq, index) => (
                                    <motion.div
                                        key={faq.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.05,
                                        }}
                                    >
                                        <AccordionItem
                                            value={faq.id}
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
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16"
                            >
                                <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400 text-lg">
                                    No questions found matching your search.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategory("all");
                                    }}
                                    className="mt-4 border-gray-600 text-gray-300 hover:border-red-500 hover:text-white"
                                >
                                    Clear Filters
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 lg:py-24 bg-gradient-to-r from-red-600 to-orange-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
                            Still Have Questions?
                        </h2>
                        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Can't find the answer you're looking for? Our team
                            is here to help.
                        </p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <Button
                                size="lg"
                                className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
                                asChild
                            >
                                <Link
                                    href="/contact-us"
                                    className="flex items-center"
                                >
                                    Contact Us
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
