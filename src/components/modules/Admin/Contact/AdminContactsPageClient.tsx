"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getAllContacts,
    updateContactStatus,
    deleteContact,
} from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Trash2,
    Mail,
    Phone,
    User,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    PlayCircle,
    XCircle,
    Eye,
    Calendar,
} from "lucide-react";
import DataTable from "@/components/shared/table/DataTable";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Contact {
    id: string;
    fullName: string;
    credential: string;
    subject: string;
    message: string;
    status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    isRead: boolean;
    createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: {
        label: "Pending",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: Clock,
    },
    IN_PROGRESS: {
        label: "In Progress",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: PlayCircle,
    },
    RESOLVED: {
        label: "Resolved",
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        icon: CheckCircle2,
    },
    CLOSED: {
        label: "Closed",
        color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        icon: XCircle,
    },
};

const DEFAULT_LIMIT = 10;

export default function AdminContactsPageClient() {
    const queryClient = useQueryClient();
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    const [paginationState, setPaginationState] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_LIMIT,
    });

    const page = paginationState.pageIndex + 1;
    const limit = paginationState.pageSize;

    const { data: contactsResponse, isLoading } = useQuery({
        queryKey: ["admin-contacts", page, limit],
        queryFn: () => getAllContacts(page, limit),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({
            id,
            status,
            isRead,
        }: {
            id: string;
            status: string;
            isRead?: boolean;
        }) => updateContactStatus(id, { status, isRead }),
        onSuccess: () => {
            toast.success("Status updated");
            queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
        },
        onError: () => {
            toast.error("Failed to update status");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteContact,
        onSuccess: () => {
            toast.success("Contact deleted");
            queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
            setIsViewOpen(false);
        },
        onError: () => {
            toast.error("Failed to delete contact");
        },
    });

    const handleViewContact = (contact: Contact) => {
        if (!contact.isRead) {
            updateStatusMutation.mutate({
                id: contact.id,
                status: contact.status,
                isRead: true,
            });
        }
        setSelectedContact(contact);
        setIsViewOpen(true);
    };

    const columns: ColumnDef<Contact>[] = useMemo(
        () => [
            {
                accessorKey: "fullName",
                header: "Sender",
                cell: ({ row }) => {
                    const contact = row.original;
                    return (
                        <div className="flex flex-col">
                            <span className={cn(
                                "font-medium",
                                !contact.isRead && "font-bold text-red-500"
                            )}>
                                {contact.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {contact.credential}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "subject",
                header: "Subject",
                cell: ({ row }) => (
                    <span className="capitalize">
                        {row.original.subject.toLowerCase().replace("_", " ")}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    const config = statusConfig[status] || statusConfig.PENDING;
                    const Icon = config.icon;
                    return (
                        <Badge
                            variant="outline"
                            className={cn("flex w-fit items-center gap-1 px-2 py-0.5", config.color)}
                        >
                            <Icon className="h-3 w-3" />
                            {config.label}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "createdAt",
                header: "Date",
                cell: ({ row }) => (
                    <div className="flex flex-col text-xs">
                        <span className="text-muted-foreground">
                            {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
                        </span>
                        <span>
                            {format(new Date(row.original.createdAt), "hh:mm a")}
                        </span>
                    </div>
                ),
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const contact = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewContact(contact)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <DropdownMenuItem
                                        key={key}
                                        onClick={() => updateStatusMutation.mutate({ id: contact.id, status: key })}
                                        className={cn(contact.status === key && "bg-muted font-medium")}
                                    >
                                        <config.icon className="mr-2 h-4 w-4" /> {config.label}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => {
                                        if (confirm("Are you sure?")) {
                                            deleteMutation.mutate(contact.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [updateStatusMutation, deleteMutation]
    );

    return (
        <div className="space-y-8 p-1">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Support Requests
                </h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    Unified communication hub. Monitor customer inquiries, provide timely support, and maintain high service standards.
                </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={contactsResponse?.data || []}
                    isLoading={isLoading}
                    pagination={{
                        state: paginationState,
                        onPaginationChange: setPaginationState,
                    }}
                    meta={{
                        page: contactsResponse?.page || 1,
                        limit: contactsResponse?.limit || DEFAULT_LIMIT,
                        total: contactsResponse?.total || 0,
                        totalPages: contactsResponse?.totalPages || 1,
                    }}
                />
            </div>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-red-500" />
                            Message Details
                        </DialogTitle>
                        <DialogDescription>
                            From {selectedContact?.fullName} on {selectedContact && format(new Date(selectedContact.createdAt), "PPP p")}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedContact && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-xl border">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Sender</Label>
                                    <div className="font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        {selectedContact.fullName}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Contact Info</Label>
                                    <div className="font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        {selectedContact.credential}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Subject</Label>
                                    <div className="font-medium capitalize">
                                        {selectedContact.subject.toLowerCase().replace("_", " ")}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Current Status</Label>
                                    <div className="flex">
                                        <Badge variant="outline" className={cn("gap-1", statusConfig[selectedContact.status].color)}>
                                            {statusConfig[selectedContact.status].label}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Message</Label>
                                <div className="p-4 bg-white rounded-xl border shadow-inner min-h-[150px] whitespace-pre-wrap">
                                    {selectedContact.message}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex gap-2">
                                    <Select
                                        value={selectedContact.status}
                                        onValueChange={(value) => updateStatusMutation.mutate({ id: selectedContact.id, status: value })}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statusConfig).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>
                                                    {config.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        if (confirm("Are you sure?")) {
                                            deleteMutation.mutate(selectedContact.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Inquiry
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <span className={cn("text-sm font-medium", className)}>{children}</span>;
}
