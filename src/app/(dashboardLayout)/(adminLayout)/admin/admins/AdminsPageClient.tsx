"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import AdminsTable from "@/components/modules/Dashboard/AdminsTable";
import CreateAdminForm from "@/components/modules/Dashboard/CreateAdminForm";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllAdmins } from "@/services/admin.services";
import type { IAdmin, IAdminListResponse } from "@/types/admin.types";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { adminUserKeys } from "@/hooks/queries/adminQueryKeys";
import {
    ADMIN_PAGINATION_DEFAULTS,
    ADMIN_STALE_TIMES,
    ADMIN_QUERY_DEFAULTS,
} from "@/config/adminPageDefaults";

const emptyAdminsResponse: IAdminListResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};

export default function AdminsPageClient() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<IAdmin | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: ADMIN_PAGINATION_DEFAULTS.limit,
    });
    const [sortingState, setSortingState] = useState<SortingState>([]);

    const page = paginationState.pageIndex + 1;
    const limit = paginationState.pageSize;

    const { data, isLoading, refetch } = useQuery({
        queryKey: adminUserKeys.admins.list({ searchTerm, page, limit }),
        queryFn: async () => {
            const response = await getAllAdmins(
                searchTerm || undefined,
                page,
                limit,
                false,
            );
            return response ?? { ...emptyAdminsResponse, page };
        },
        placeholderData: (previousData) => previousData,
        staleTime: ADMIN_STALE_TIMES.adminList,
    });

    const handleCreateSuccess = () => {
        setIsDialogOpen(false);
        refetch();
        setPaginationState((s) => ({ ...s, pageIndex: 0 }));
    };

    const handleEditAdmin = (admin: IAdmin) => {
        setSelectedAdmin(admin);
        setIsDialogOpen(true);
    };

    const handleDeleteAdmin = (admin: IAdmin) => {
        // TODO: Implement delete confirmation dialog
        console.log("Delete admin:", admin.id);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Admin Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage admin users and their permissions.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setSelectedAdmin(null)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Admin
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedAdmin ? "Edit Admin" : "Create Admin"}
                            </DialogTitle>
                        </DialogHeader>
                        <CreateAdminForm
                            admin={selectedAdmin || undefined}
                            onSuccess={handleCreateSuccess}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search admins by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPaginationState((s) => ({ ...s, pageIndex: 0 }));
                    }}
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                />
            </div>

            <AdminsTable
                admins={data?.data || []}
                meta={data ?? undefined}
                isLoading={isLoading}
                paginationState={paginationState}
                sortingState={sortingState}
                onPaginationChange={setPaginationState}
                onSortingChange={setSortingState}
                onEdit={handleEditAdmin}
                onDelete={handleDeleteAdmin}
            />
        </div>
    );
}
