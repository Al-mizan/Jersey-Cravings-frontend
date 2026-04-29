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

const emptyAdminsResponse: IAdminListResponse = {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
};

export default function AdminsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<IAdmin | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["admins", searchTerm, page],
        queryFn: async () => {
            const response = await getAllAdmins(
                searchTerm || undefined,
                page,
                10,
                false,
            );
            return response ?? { ...emptyAdminsResponse, page };
        },
        staleTime: 60000,
    });

    const handleCreateSuccess = () => {
        setIsDialogOpen(false);
        refetch();
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
            {/* Header */}
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

            {/* Search and Filters */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search admins by name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                />
            </div>

            {/* Admins Table */}
            <AdminsTable
                admins={data?.data || null}
                isLoading={isLoading}
                onEdit={handleEditAdmin}
                onDelete={handleDeleteAdmin}
            />

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {data.totalPages}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() =>
                            setPage((p) => Math.min(data.totalPages, p + 1))
                        }
                        disabled={page === data.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
