"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    getAllContacts,
    updateContactStatus,
    deleteContact,
} from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Mail, Phone, User } from "lucide-react";

interface Contact {
    id: string;
    fullName: string;
    phone: string;
    subject: string;
    message: string;
    status: string;
    isRead: boolean;
    createdAt: string;
}

const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30",
    IN_PROGRESS: "bg-blue-500/20 text-blue-700 hover:bg-blue-500/30",
    RESOLVED: "bg-green-500/20 text-green-700 hover:bg-green-500/30",
    CLOSED: "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30",
};

export default function AdminContactsPageClient() {
    const queryClient = useQueryClient();
    const [selectedContact, setSelectedContact] = useState<Contact | null>(
        null,
    );

    const { data: contacts = [], isLoading } = useQuery({
        queryKey: ["admin-contacts"],
        queryFn: getAllContacts,
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
            toast.success("Contact status updated successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
        },
        onError: () => {
            toast.error("Failed to update contact status");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteContact,
        onSuccess: () => {
            toast.success("Contact deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
            setSelectedContact(null);
        },
        onError: () => {
            toast.error("Failed to delete contact");
        },
    });

    const handleStatusChange = (contactId: string, newStatus: string) => {
        updateStatusMutation.mutate({
            id: contactId,
            status: newStatus,
            isRead: true,
        });
    };

    const handleMarkAsRead = (contact: Contact) => {
        if (!contact.isRead) {
            updateStatusMutation.mutate({
                id: contact.id,
                status: contact.status,
                isRead: true,
            });
        }
        setSelectedContact(contact);
    };

    const handleDelete = (contactId: string) => {
        if (confirm("Are you sure you want to delete this contact?")) {
            deleteMutation.mutate(contactId);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Loading contacts...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Messages</CardTitle>
                </CardHeader>
                <CardContent>
                    {!contacts || contacts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No contact messages yet</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contacts?.map((contact: Contact) => (
                                        <TableRow
                                            key={contact.id}
                                            className={`cursor-pointer hover:bg-muted/50 ${
                                                !contact.isRead
                                                    ? "font-semibold bg-muted/30"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleMarkAsRead(contact)
                                            }
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    {contact.fullName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {contact.phone}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {contact.subject
                                                    .toLowerCase()
                                                    .replace("_", " ")}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={contact.status}
                                                    onValueChange={(value) =>
                                                        handleStatusChange(
                                                            contact.id,
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">
                                                            Pending
                                                        </SelectItem>
                                                        <SelectItem value="IN_PROGRESS">
                                                            In Progress
                                                        </SelectItem>
                                                        <SelectItem value="RESOLVED">
                                                            Resolved
                                                        </SelectItem>
                                                        <SelectItem value="CLOSED">
                                                            Closed
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(contact.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(
                                                        e: React.MouseEvent,
                                                    ) => {
                                                        e.stopPropagation();
                                                        handleDelete(
                                                            contact.id,
                                                        );
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedContact && (
                <Card>
                    <CardHeader>
                        <CardTitle>Message Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    From
                                </p>
                                <p className="font-semibold">
                                    {selectedContact.fullName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Phone
                                </p>
                                <p>{selectedContact.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Subject
                                </p>
                                <p className="capitalize">
                                    {selectedContact.subject
                                        .toLowerCase()
                                        .replace("_", " ")}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">
                                Message
                            </p>
                            <div className="p-4 bg-muted rounded-lg">
                                <p>{selectedContact.message}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <Badge
                                className={statusColors[selectedContact.status]}
                            >
                                {selectedContact.status.replace("_", " ")}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                                Received:{" "}
                                {formatDate(selectedContact.createdAt)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
