import { getUserInfo } from "@/services/auth.service";
import { getAllAdmins } from "@/services/admin.service";
import { MyProfileWorkspace } from "@/components/modules/Admin/MyProfile/MyProfileWorkspace";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";

const MyProfile = async () => {
    const userInfo = await getUserInfo();

    console.log("user email", userInfo?.identifier);
    if (!userInfo) {
        redirect("/login");
    }

    // getAllAdmins returns the array directly (unwrapData extracts ApiResponse.data)
    const adminsResponse = await getAllAdmins(userInfo.identifier, 1, 3);
    const admins = Array.isArray(adminsResponse)
        ? adminsResponse
        : (adminsResponse as any)?.data ?? [];
    const adminProfile = admins.find(
        (a: any) => a.identifier === userInfo.identifier,
    ) ?? null;

    if (!adminProfile) {
        return (
            <div className="mx-auto max-w-3xl">
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    Could not load your admin profile. Please contact support.
                </div>
            </div>
        );
    }

    return <MyProfileWorkspace adminId={adminProfile.id} />;
};

export default MyProfile;
