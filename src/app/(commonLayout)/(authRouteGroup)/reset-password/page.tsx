import ResetPasswordForm from "@/components/modules/Auth/ResetPasswordForm";

interface ResetPasswordPageParams {
    searchParams: Promise<{ email?: string }>;
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageParams) => {
    const params = await searchParams;
    const email = params.email || "";

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <ResetPasswordForm email={email} />
        </div>
    );
};

export default ResetPasswordPage;
