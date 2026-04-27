import VerifyEmailForm from "@/components/modules/Auth/VerifyEmailForm";

interface VerifyEmailPageParams {
    searchParams: Promise<{ email?: string }>;
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageParams) => {
    const params = await searchParams;
    const email = params.email || "";

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <VerifyEmailForm email={email} />
        </div>
    );
};

export default VerifyEmailPage;
