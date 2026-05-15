"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import type { IAdmin } from "@/types/admin.types";

interface AdminViewDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    admin: IAdmin;
    onStatusChange: (status: string) => void;
    isUpdating: boolean;
}

export default function AdminViewDetailsDialog({
    open,
    onOpenChange,
    admin,
    onStatusChange,
    isUpdating,
}: AdminViewDetailsDialogProps) {
    const initials = admin.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    const currentStatus = admin.user?.status || "ACTIVE";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Admin Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={admin.profilePhoto || ""} alt={admin.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <h3 className="mt-4 text-lg font-semibold">{admin.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            @{admin.identifier}
                        </p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Email
                            </p>
                            <p className="text-sm">{admin.user?.id || "N/A"}</p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Contact
                            </p>
                            <p className="text-sm">
                                {admin.contactNumber || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Role
                            </p>
                            <div
                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                                    admin.user?.role === "SUPER_ADMIN"
                                        ? "border-purple-500/20 bg-purple-500/10 text-purple-600"
                                        : "border-blue-500/20 bg-blue-500/10 text-blue-600"
                                }`}
                            >
                                {admin.user?.role}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-muted-foreground">
                                Created
                            </p>
                            <p className="text-sm">
                                {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Status Management */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            User Status
                        </label>
                        <Select
                            value={currentStatus}
                            onValueChange={onStatusChange}
                            disabled={isUpdating}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="BLOCKED">Blocked</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <Button
                        onClick={() => onOpenChange(false)}
                        className="w-full"
                        disabled={isUpdating}
                    >
                        {isUpdating && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
