import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions | Jersey Cravings",
    description: "Read the terms and conditions for using Jersey Cravings e-commerce platform.",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
            <div className="space-y-8">
                <div className="space-y-2 border-b border-zinc-200 pb-8 dark:border-zinc-800">
                    <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                        Terms & Conditions
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Last updated: May 17, 2026
                    </p>
                </div>

                <div className="max-w-none space-y-10">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">1. Introduction</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Welcome to Jersey Cravings. By accessing and using our website, you agree to comply with and be bound by the following terms and conditions. If you disagree with any part of these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">2. Product Information</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            We strive to provide accurate descriptions and images of our jerseys. However, we do not warrant that product descriptions, colors, or other content are 100% accurate, complete, or error-free. Small variations in color may occur due to screen settings.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">3. Ordering & Payment</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            By placing an order, you are offering to purchase a product. All orders are subject to availability and confirmation of the order price. We reserve the right to refuse any order. Payments are processed securely through our authorized payment gateways.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">4. Shipping & Delivery</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Delivery times may vary depending on availability and your location. Any delivery estimates provided are just that—estimates. Jersey Cravings is not responsible for delays caused by shipping carriers or customs processes.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">5. Returns & Exchanges</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            We offer returns for defective or incorrect items within 7 days of receipt. Custom-printed jerseys (with names/numbers) are non-returnable unless there is a manufacturing defect. Items must be unworn and in original packaging with tags.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">6. Limitation of Liability</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Jersey Cravings shall not be liable for any indirect, incidental, or consequential damages arising out of the use or inability to use our products or services.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
