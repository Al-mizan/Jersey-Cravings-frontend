"use client";

import { motion } from "motion/react";
import { useForm } from "@tanstack/react-form";
import { contactZodSchema } from "@/zod/contact.validation";
import { contactService } from "@/services/contact.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles, User as UserIcon } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

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
import { cn } from "@/lib/utils";

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
            credential: user?.identifier || "",
            subject: "",
            message: "",
        },
        onSubmit: async ({ value }) => {
            const payload = {
                fullName: value.fullName || user?.name || "Guest",
                credential: value.credential || user?.identifier || "Not Provided",
                subject: value.subject,
                message: value.message,
            };
            mutation.mutate(payload as any);
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
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-red-500/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3b0a0a,transparent_60%)]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                
                <div className="container relative mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl mx-auto space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold tracking-widest uppercase">
                            <Sparkles className="size-3" />
                            Get In Touch
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                            Let&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Connect</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
                            Have questions or custom requests? Our team is ready to help you gear up with premium jerseys.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="pb-32 container mx-auto px-4">
                <div className="grid lg:grid-cols-[1fr_380px] gap-12 max-w-7xl mx-auto">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 overflow-hidden">
                            <div className="h-1.5 w-full bg-gradient-to-r from-red-600 to-orange-600" />
                            <CardContent className="p-4 sm:p-8 md:p-12">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        form.handleSubmit();
                                    }}
                                    className="space-y-6 md:space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <form.Field
                                            name="fullName"
                                            validators={{
                                                onChange: ({ value }) => {
                                                    const result = contactZodSchema.shape.fullName.safeParse(value);
                                                    return result.success ? undefined : result.error.issues[0].message;
                                                }
                                            }}
                                        >
                                            {(field) => (
                                                <div className="space-y-3">
                                                    <Label htmlFor={field.name} className="text-gray-300 font-medium ml-1">Full Name</Label>
                                                    <div className="relative group">
                                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                                        <Input
                                                            id={field.name}
                                                            value={field.state.value}
                                                            onChange={(e) => field.handleChange(e.target.value)}
                                                            placeholder="John Doe"
                                                            className="h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500/20 transition-all rounded-xl"
                                                        />
                                                    </div>
                                                    {field.state.meta.errors?.[0] && (
                                                        <p className="text-xs text-red-500 ml-1 font-medium italic">{field.state.meta.errors[0]}</p>
                                                    )}
                                                </div>
                                            )}
                                        </form.Field>

                                        <form.Field
                                            name="subject"
                                            validators={{
                                                onChange: ({ value }) => {
                                                    const result = contactZodSchema.shape.subject.safeParse(value);
                                                    return result.success ? undefined : result.error.issues[0].message;
                                                }
                                            }}
                                        >
                                            {(field) => (
                                                <div className="space-y-3">
                                                    <Label htmlFor={field.name} className="text-gray-300 font-medium ml-1">Subject</Label>
                                                    <Select
                                                        value={field.state.value}
                                                        onValueChange={(val) => field.handleChange(val)}
                                                    >
                                                        <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white focus:ring-red-500/20 rounded-xl">
                                                            <SelectValue placeholder="What's this about?" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#1a1a1a] border-white/10">
                                                            {subjectOptions.map((option) => (
                                                                <SelectItem 
                                                                    key={option.value} 
                                                                    value={option.value}
                                                                    className="text-gray-300 focus:bg-red-500 focus:text-white"
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {field.state.meta.errors?.[0] && (
                                                        <p className="text-xs text-red-500 ml-1 font-medium italic">{field.state.meta.errors[0]}</p>
                                                    )}
                                                </div>
                                            )}
                                        </form.Field>
                                    </div>

                                    <form.Field
                                        name="message"
                                        validators={{
                                            onChange: ({ value }) => {
                                                const result = contactZodSchema.shape.message.safeParse(value);
                                                return result.success ? undefined : result.error.issues[0].message;
                                            }
                                        }}
                                    >
                                        {(field) => (
                                            <div className="space-y-3">
                                                <Label htmlFor={field.name} className="text-gray-300 font-medium ml-1">Message</Label>
                                                <div className="relative group overflow-hidden rounded-2xl">
                                                    <MessageSquare className="absolute left-4 top-4 size-4 text-gray-500 group-focus-within:text-red-500 transition-colors z-10" />
                                                    <Textarea
                                                        id={field.name}
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        placeholder="Write your message here..."
                                                        rows={6}
                                                        className="pl-11 pt-4 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-red-500 focus:ring-red-500/20 transition-all rounded-2xl resize-none w-full min-h-[150px] max-w-full"
                                                    />
                                                </div>
                                                {field.state.meta.errors?.[0] && (
                                                    <p className="text-xs text-red-500 ml-1 font-medium italic">{field.state.meta.errors[0]}</p>
                                                )}
                                            </div>
                                        )}
                                    </form.Field>

                                    <Button
                                        type="submit"
                                        disabled={mutation.isPending}
                                        className="w-full h-14 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-red-600/20 active:scale-[0.98] group"
                                    >
                                        {mutation.isPending ? (
                                            <span className="flex items-center gap-3">
                                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-3">
                                                <Send className="size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                Send Message
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="space-y-8"
                    >
                        {/* Info Card */}
                        <div className="space-y-6">
                            <ContactInfoItem 
                                icon={Mail} 
                                title="Email Us" 
                                value="mdalmizanakon@gmail.com" 
                                href="mailto:mdalmizanakon@gmail.com"
                            />
                            <ContactInfoItem 
                                icon={Phone} 
                                title="Call Us" 
                                value="+880 1705-094855" 
                                href="tel:+8801705094855"
                            />
                            <ContactInfoItem 
                                icon={MapPin} 
                                title="Visit Us" 
                                value="Savar, Dhaka, Bangladesh" 
                                href="https://maps.google.com/?q=Savar,Dhaka"
                            />
                        </div>

                        {/* Social Links */}
                        <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6">
                            <h3 className="text-xl font-bold tracking-tight">Social Connect</h3>
                            <div className="flex gap-4">
                                <SocialButton icon={FaFacebook} href="https://facebook.com/jerseycravings" color="bg-blue-600" />
                                <SocialButton icon={FaInstagram} href="https://instagram.com/jerseycravings" color="bg-pink-600" />
                            </div>
                        </div>

                        {/* Map Preview */}
                        <div className="rounded-[2.5rem] border border-white/10 overflow-hidden bg-white/[0.03] group">
                            <div className="relative h-48 w-full grayscale contrast-125 opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                <iframe
                                    src="https://maps.google.com/maps?q=23.8805051,90.262598&z=17&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                            <div className="p-6 text-center">
                                <p className="text-sm font-medium text-gray-400">Headquarters in Savar</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

function ContactInfoItem({ icon: Icon, title, value, href }: { icon: any; title: string; value: string; href: string }) {
    return (
        <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-5 p-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] hover:bg-white/[0.06] hover:border-white/20 transition-all group"
        >
            <div className="size-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                <Icon className="size-6 text-red-500" />
            </div>
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-base font-semibold group-hover:text-red-400 transition-colors">{value}</p>
            </div>
        </a>
    );
}

function SocialButton({ icon: Icon, href, color }: { icon: any; href: string; color: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "size-14 rounded-2xl flex items-center justify-center border border-white/10 text-white/50 hover:text-white transition-all hover:scale-110",
                `hover:${color} hover:border-transparent`
            )}
        >
            <Icon className="size-6" />
        </a>
    );
}
