// import { AdminCustomerDetailsWorkspace } from "@/components/modules/Customer/components/admin/AdminCustomerDetailsWorkspace";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";

// interface AdminCustomerDetailsPageProps {
//     params: Promise<{ customerId: string }>;
// }

// const AdminCustomerDetailsPage = async ({
//     params,
// }: AdminCustomerDetailsPageProps) => {
//     const { customerId } = await params;

//     return (
//         <div className="space-y-4">
//             <Button asChild variant="outline">
//                 <Link href="/admin/customers">Back to Customers</Link>
//             </Button>

//             <AdminCustomerDetailsWorkspace customerId={customerId} />
//         </div>
//     );
// };

// export default AdminCustomerDetailsPage;

export default function CustomerDetailsPage() {
    return <div>Customer Details Page</div>;
}
