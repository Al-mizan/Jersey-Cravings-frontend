"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useCustomers,
    useRestoreCustomer,
} from "@/features/customers/hooks/useCustomerProfile";
import { ICustomerProfile } from "@/types/customer.types";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminCustomersTable } from "./AdminCustomersTable";
import { CustomerStatusDialog } from "./CustomerStatusDialog";

const DEFAULT_PAGE_SIZE = 10;

const getServerQuery = (
    paginationState: PaginationState,
    sortingState: SortingState,
    searchTerm: string,
    isDeleted: "ALL" | "true" | "false",
) => {
    const sorting = sortingState[0];
    const sortOrder: "asc" | "desc" = sorting?.desc ? "desc" : "asc";

    return {
        page: paginationState.pageIndex + 1,
        limit: paginationState.pageSize,
        searchTerm: searchTerm.trim() || undefined,
        isDeleted: isDeleted === "ALL" ? undefined : isDeleted === "true",
        sortBy: sorting?.id,
        sortOrder: sorting ? sortOrder : undefined,
    };
};

export const AdminCustomersWorkspace = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeletedFilter, setIsDeletedFilter] = useState<"ALL" | "true" | "false">(
        "false",
    );

    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
    });

    const [sortingState, setSortingState] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);

    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<ICustomerProfile | null>(
        null,
    );

    const listParams = useMemo(
        () =>
            getServerQuery(
                paginationState,
                sortingState,
                searchTerm,
                isDeletedFilter,
            ),
        [isDeletedFilter, paginationState, searchTerm, sortingState],
    );

    const { data: customersResponse, isLoading } = useCustomers(listParams);
    const { mutateAsync: restoreCustomer, isPending: isRestoringCustomer } =
        useRestoreCustomer();

    const onViewCustomer = (customer: ICustomerProfile) => {
        router.push(`/admin/customers/${customer.id}`);
    };

    const onChangeStatus = (customer: ICustomerProfile) => {
        setSelectedCustomer(customer);
        setStatusDialogOpen(true);
    };

    const onRestoreCustomer = async (customer: ICustomerProfile) => {
        const confirmed = window.confirm(
            `Restore customer ${customer.name}?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            await restoreCustomer(customer.id);
            toast.success("Customer restored successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Restore failed");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                <p className="text-muted-foreground mt-1">
                    Monitor customer profiles, lifecycle status, and account recovery.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                    value={searchTerm}
                    onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setPaginationState((prevState) => ({
                            ...prevState,
                            pageIndex: 0,
                        }));
                    }}
                    placeholder="Search by name, email, or contact"
                    className="sm:max-w-md"
                />

                <Select
                    value={isDeletedFilter}
                    onValueChange={(value: "ALL" | "true" | "false") => {
                        setIsDeletedFilter(value);
                        setPaginationState((prevState) => ({
                            ...prevState,
                            pageIndex: 0,
                        }));
                    }}
                >
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Deleted status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="false">Active Records</SelectItem>
                        <SelectItem value="true">Deleted Records</SelectItem>
                        <SelectItem value="ALL">All Records</SelectItem>
                    </SelectContent>
                </Select>

                {isRestoringCustomer && (
                    <Button disabled variant="secondary" className="sm:ml-auto">
                        Restoring...
                    </Button>
                )}
            </div>

            <AdminCustomersTable
                customers={customersResponse?.data ?? []}
                meta={customersResponse?.meta}
                isLoading={isLoading}
                paginationState={paginationState}
                sortingState={sortingState}
                onPaginationChange={setPaginationState}
                onSortingChange={setSortingState}
                onViewCustomer={onViewCustomer}
                onChangeStatus={onChangeStatus}
                onRestoreCustomer={onRestoreCustomer}
            />

            {selectedCustomer && (
                <CustomerStatusDialog
                    key={selectedCustomer.id}
                    customerId={selectedCustomer.id}
                    currentStatus={selectedCustomer.user.status}
                    isOpen={statusDialogOpen}
                    onOpenChange={setStatusDialogOpen}
                />
            )}
        </div>
    );
};
