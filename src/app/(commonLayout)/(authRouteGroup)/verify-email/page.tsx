import VerifyEmailForm from "@/components/modules/Auth/VerifyEmailForm";

interface VerifyEmailPageParams {
    searchParams: Promise<{ identifier?: string }>;
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageParams) => {
    const params = await searchParams;
    const identifier = params.identifier || "";

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <VerifyEmailForm identifier={identifier} />
        </div>
    );
};

export default VerifyEmailPage;
