import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Jersey Cravings",
    description: "Learn how Jersey Cravings collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
            <div className="space-y-8">
                <div className="space-y-2 border-b border-zinc-200 pb-8 dark:border-zinc-800">
                    <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Last updated: May 17, 2026
                    </p>
                </div>

                <div className="max-w-none space-y-10">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">1. Information Collection</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            We collect information that you provide directly to us when you create an account, place an order, or contact us. This may include your name, email address, phone number, shipping address, and payment details.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">2. How We Use Your Information</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            We use your information to process orders, manage your account, provide customer support, and send you updates about your order. With your consent, we may also send you marketing communications.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">3. Data Security</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            We implement a variety of security measures to maintain the safety of your personal information. Your sensitive data is encrypted via Secure Socket Layer (SSL) technology and is only accessible by persons with special access rights.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">4. Third-Party Services</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            We do not sell or trade your personally identifiable information. We may share data with trusted third parties who assist us in operating our website, such as shipping partners and payment processors, as long as they agree to keep this information confidential.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">5. Cookies</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Our website uses cookies to enhance your browsing experience. Cookies help us remember your cart items and understand your preferences based on previous site activity. You can choose to disable cookies through your browser settings.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">6. Contact Us</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            If you have any questions regarding this privacy policy, you may contact us at support@jerseycravings.app.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
