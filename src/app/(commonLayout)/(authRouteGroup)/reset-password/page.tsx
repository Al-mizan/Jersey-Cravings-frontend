import ResetPasswordForm from "@/components/modules/Auth/ResetPasswordForm";

interface ResetPasswordPageParams {
    searchParams: Promise<{ identifier?: string }>;
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageParams) => {
    const params = await searchParams;
    const identifier = params.identifier || "";

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <ResetPasswordForm identifier={identifier} />
        </div>
    );
};

export default ResetPasswordPage;
