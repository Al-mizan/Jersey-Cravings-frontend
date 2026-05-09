import { AdminCustomerDetailsWorkspace } from "@/components/modules/Admin/Customer/AdminCustomerDetailsWorkspace";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface AdminCustomerDetailsPageProps {
    params: Promise<{ customerId: string }>;
}

const AdminCustomerDetailsPage = async ({
    params,
}: AdminCustomerDetailsPageProps) => {
    const { customerId } = await params;

    return (
        <div className="space-y-4">
            <Button asChild variant="outline">
                <Link href="/admin/customers">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Back</span>
                </Link>
            </Button>

            <AdminCustomerDetailsWorkspace customerId={customerId} />
        </div>
    );
};

export default AdminCustomerDetailsPage;

