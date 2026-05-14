"use client";

import { motion } from "motion/react";
import { useForm } from "@tanstack/react-form";
import { contactZodSchema } from "@/zod/contact.validation";
import { contactService } from "@/services/contact.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactUs() {
    const { user, isAuthenticated } = useAuth({ includeUser: true });

    const mutation = useMutation({
        mutationFn: contactService.submitContactForm,
        onSuccess: () => {
            toast.success("Message sent successfully!");
            form.reset();
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message ||
                    "Failed to send message. Please try again.",
            );
        },
    });

    const form = useForm({
        defaultValues: {
            fullName: user?.name || "",
            email: user?.email || "",
            phone: "",
            subject: "",
            message: "",
        },
        onSubmit: async ({ value }) => {
            mutation.mutate(value);
        },
    });

    const subjectOptions = [
        { value: "order", label: "Order Inquiry" },
        { value: "product", label: "Product Information" },
        { value: "shipping", label: "Shipping & Delivery" },
        { value: "payment", label: "Payment Issue" },
        { value: "return", label: "Returns & Refunds" },
        { value: "custom", label: "Custom Jersey Request" },
        { value: "other", label: "Other" },
    ];

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
                            Get in <span className="text-red-500">Touch</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Have questions? We're here to help. Reach out to us
                            and we'll respond as soon as we can.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Form & Info Section */}
            <section className="py-16 lg:py-24 bg-gray-800/50">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-2"
                        >
                            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50">
                                <CardContent className="p-8">
                                    <h2 className="text-2xl font-bold mb-6 text-white">
                                        Send us a Message
                                    </h2>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            form.handleSubmit();
                                        }}
                                        className="space-y-6"
                                    >
                                        <form.Field
                                            name="fullName"
                                            validators={{
                                                onChange: ({ value }) => {
                                                    const result =
                                                        contactZodSchema.shape.fullName.safeParse(
                                                            value,
                                                        );
                                                    if (!result.success) {
                                                        return result.error
                                                            .issues[0].message;
                                                    }
                                                },
                                                onChangeAsyncDebounceMs: 500,
                                            }}
                                        >
                                            {(field) => (
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-gray-300"
                                                    >
                                                        Full Name
                                                    </Label>
                                                    <Input
                                                        id={field.name}
                                                        value={
                                                            field.state.value
                                                        }
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Enter your full name"
                                                        className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500"
                                                    />
                                                    {typeof field.state.meta
                                                        .errors ===
                                                        "string" && (
                                                        <p className="text-sm text-red-500">
                                                            {
                                                                field.state.meta
                                                                    .errors
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </form.Field>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <form.Field
                                                name="email"
                                                validators={{
                                                    onChange: ({ value }) => {
                                                        const result =
                                                            contactZodSchema.shape.email.safeParse(
                                                                value,
                                                            );
                                                        if (!result.success) {
                                                            return result.error
                                                                .issues[0]
                                                                .message;
                                                        }
                                                    },
                                                    onChangeAsyncDebounceMs: 500,
                                                }}
                                            >
                                                {(field) => (
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={field.name}
                                                            className="text-gray-300"
                                                        >
                                                            Email Address
                                                        </Label>
                                                        <Input
                                                            id={field.name}
                                                            type="email"
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="your@email.com"
                                                            disabled={
                                                                isAuthenticated
                                                            }
                                                            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 disabled:opacity-50"
                                                        />
                                                        {typeof field.state.meta
                                                            .errors ===
                                                            "string" && (
                                                            <p className="text-sm text-red-500">
                                                                {
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </form.Field>

                                            <form.Field
                                                name="phone"
                                                validators={{
                                                    onChange: ({ value }) => {
                                                        const result =
                                                            contactZodSchema.shape.phone.safeParse(
                                                                value,
                                                            );
                                                        if (!result.success) {
                                                            return result.error
                                                                .issues[0]
                                                                .message;
                                                        }
                                                    },
                                                    onChangeAsyncDebounceMs: 500,
                                                }}
                                            >
                                                {(field) => (
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor={field.name}
                                                            className="text-gray-300"
                                                        >
                                                            Phone Number
                                                        </Label>
                                                        <Input
                                                            id={field.name}
                                                            type="tel"
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="01XXXXXXXXX"
                                                            inputMode="numeric"
                                                            className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500"
                                                        />
                                                        {typeof field.state.meta
                                                            .errors ===
                                                            "string" && (
                                                            <p className="text-sm text-red-500">
                                                                {
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </form.Field>
                                        </div>

                                        <form.Field
                                            name="subject"
                                            validators={{
                                                onChange: ({ value }) => {
                                                    const result =
                                                        contactZodSchema.shape.subject.safeParse(
                                                            value,
                                                        );
                                                    if (!result.success) {
                                                        return result.error
                                                            .issues[0].message;
                                                    }
                                                },
                                                onChangeAsyncDebounceMs: 500,
                                            }}
                                        >
                                            {(field) => (
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-gray-300"
                                                    >
                                                        Subject
                                                    </Label>
                                                    <Select
                                                        value={
                                                            field.state.value
                                                        }
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            field.handleChange(
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-red-500">
                                                            <SelectValue placeholder="Select a subject" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-gray-900 border-gray-600">
                                                            {subjectOptions.map(
                                                                (option) => (
                                                                    <SelectItem
                                                                        key={
                                                                            option.value
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                        className="text-white focus:bg-red-600/20"
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {typeof field.state.meta
                                                        .errors ===
                                                        "string" && (
                                                        <p className="text-sm text-red-500">
                                                            {
                                                                field.state.meta
                                                                    .errors
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </form.Field>

                                        <form.Field
                                            name="message"
                                            validators={{
                                                onChange: ({ value }) => {
                                                    const result =
                                                        contactZodSchema.shape.message.safeParse(
                                                            value,
                                                        );
                                                    if (!result.success) {
                                                        return result.error
                                                            .issues[0].message;
                                                    }
                                                },
                                                onChangeAsyncDebounceMs: 500,
                                            }}
                                        >
                                            {(field) => (
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor={field.name}
                                                        className="text-gray-300"
                                                    >
                                                        Message
                                                    </Label>
                                                    <Textarea
                                                        id={field.name}
                                                        value={
                                                            field.state.value
                                                        }
                                                        onChange={(e) =>
                                                            field.handleChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Tell us more about your inquiry..."
                                                        rows={6}
                                                        className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 resize-none"
                                                    />
                                                    {typeof field.state.meta
                                                        .errors ===
                                                        "string" && (
                                                        <p className="text-sm text-red-500">
                                                            {
                                                                field.state.meta
                                                                    .errors
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </form.Field>

                                        <Button
                                            type="submit"
                                            disabled={mutation.isPending}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all duration-300"
                                        >
                                            {mutation.isPending ? (
                                                "Sending..."
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Contact Info Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Contact Cards */}
                            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50">
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white mb-1">
                                                Email
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                mdalmizanakon@gmail.com
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white mb-1">
                                                Phone
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                +880 1705-094855
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white mb-1">
                                                Location
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                Savar, Dhaka, Bangladesh
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Social Media */}
                            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-white mb-4">
                                        Follow Us
                                    </h3>
                                    <div className="flex space-x-3">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="bg-gray-800/50 border-gray-600 hover:bg-blue-600 hover:border-blue-600 hover:text-white text-gray-400"
                                            asChild
                                        >
                                            <a
                                                href="https://facebook.com/jerseycravings"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FaFacebook className="h-5 w-5" />
                                            </a>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="bg-gray-800/50 border-gray-600 hover:bg-pink-600 hover:border-pink-600 hover:text-white text-gray-400"
                                            asChild
                                        >
                                            <a
                                                href="https://instagram.com/jerseycravings"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FaInstagram className="h-5 w-5" />
                                            </a>
                                        </Button>
                                        {/* <Button
                                            variant="outline"
                                            size="icon"
                                            className="bg-gray-800/50 border-gray-600 hover:bg-sky-500 hover:border-sky-500 hover:text-white text-gray-400"
                                            asChild
                                        >
                                            <a
                                                href="https://twitter.com/jerseycravings"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <FaTwitter className="h-5 w-5" />
                                            </a>
                                        </Button> */}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Map Card */}
                            <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="relative h-48 bg-gray-800">
                                        <iframe
                                            src="https://maps.google.com/maps?q=23.8805051,90.262598&z=17&output=embed"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                                        ></iframe>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-gray-400 text-center">
                                            Visit our store in Dhaka
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
