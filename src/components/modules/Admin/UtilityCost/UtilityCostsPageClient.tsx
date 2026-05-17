"use client";

import { Button } from "@/components/ui/button";
import { useState, useMemo, useCallback } from "react";
import { useUrlPaginationState } from "@/hooks/useUrlPaginationState";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    ColumnDef,
    PaginationState,
    SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Plus, Trash2, Coins, Receipt, Users, TrendingUp, AlertCircle } from "lucide-react";

import DataTable from "@/components/shared/table/DataTable";
import DateCell from "@/components/shared/cell/DateCell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
    getAllUtilityCosts,
    createUtilityCost,
    deleteUtilityCost,
    IUtilityCost,
} from "@/services/utility-cost.service";

const DEFAULT_LIMIT = 10;

const TYPE_CLASSES: Record<string, string> = {
    Electricity: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    Water: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    Rent: "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    Salaries: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    Internet: "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
};

export default function UtilityCostsPageClient() {
    const queryClient = useQueryClient();

    const { paginationState, setPaginationState, page, limit } = useUrlPaginationState(DEFAULT_LIMIT);

    const [sortingState, setSortingState] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        type: "",
        customType: "",
        amount: "",
        details: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch operational costs
    const costsQuery = useQuery({
        queryKey: ["admin", "utility-costs", { page, limit, searchTerm }],
        queryFn: () => getAllUtilityCosts(searchTerm || undefined, page, limit),
        placeholderData: (previousData) => previousData,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (payload: { type: string; amount: number; details: string }) =>
            createUtilityCost(payload),
        onSuccess: () => {
            toast.success("Operational cost logged successfully");
            queryClient.invalidateQueries({ queryKey: ["admin"] });
            setShowCreateDialog(false);
            setFormData({ type: "", customType: "", amount: "", details: "" });
            setFormErrors({});
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to log operational cost");
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUtilityCost(id),
        onSuccess: () => {
            toast.success("Operational cost deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["admin"] });
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete operational cost");
        },
    });

    // Form validation
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        const finalType = formData.type === "Others" ? formData.customType.trim() : formData.type;
        if (!finalType) {
            errors.type = "Please select or type a cost type";
        }

        const amountVal = parseFloat(formData.amount);
        if (isNaN(amountVal) || amountVal <= 0) {
            errors.amount = "Amount must be a positive number";
        }

        if (!formData.details.trim()) {
            errors.details = "Cost details are required";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        createMutation.mutate({
            type: finalType,
            amount: amountVal,
            details: formData.details.trim(),
        });
    };

    // Calculate aggregated metrics
    const metrics = useMemo(() => {
        const list = costsQuery.data?.data || [];
        
        let total = 0;
        let utilities = 0;
        let fixed = 0;
        let others = 0;

        list.forEach((item) => {
            total += item.amount;
            if (["Electricity", "Water", "Internet"].includes(item.type)) {
                utilities += item.amount;
            } else if (["Rent", "Salaries"].includes(item.type)) {
                fixed += item.amount;
            } else {
                others += item.amount;
            }
        });

        return { total, utilities, fixed, others };
    }, [costsQuery.data]);

    const columns = useMemo<ColumnDef<IUtilityCost>[]>(
        () => [
            {
                accessorKey: "type",
                header: "Cost Category",
                cell: ({ row }) => {
                    const type = row.original.type;
                    const badgeClass =
                        TYPE_CLASSES[type] ||
                        "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400";
                    return (
                        <div
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
                        >
                            {type}
                        </div>
                    );
                },
            },
            {
                accessorKey: "amount",
                header: "Amount",
                cell: ({ row }) => (
                    <span className="font-semibold text-foreground">
                        ৳{row.original.amount.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                    </span>
                ),
            },
            {
                accessorKey: "details",
                header: "Details / Remarks",
                cell: ({ row }) => (
                    <span className="text-muted-foreground line-clamp-1 max-w-[300px]">
                        {row.original.details}
                    </span>
                ),
            },
            {
                accessorKey: "createdAt",
                header: "Logged At",
                cell: ({ row }) => <DateCell date={row.original.createdAt} />,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this cost log?")) {
                                deleteMutation.mutate(row.original.id);
                            }
                        }}
                        disabled={deleteMutation.isPending}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                ),
            },
        ],
        [deleteMutation],
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Utility & Operational Costs</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Log and manage administrative, operational, and utility costs
                    </p>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Log Cost Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Log Operational Cost</DialogTitle>
                            <DialogDescription>
                                Input utility or other business expenses to maintain a transparent audit log.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1">
                                <Label htmlFor="type">Cost Category</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => {
                                        setFormData((prev) => ({ ...prev, type: value }));
                                        setFormErrors((prev) => ({ ...prev, type: "" }));
                                    }}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Electricity">Electricity</SelectItem>
                                        <SelectItem value="Water">Water</SelectItem>
                                        <SelectItem value="Internet">Internet</SelectItem>
                                        <SelectItem value="Rent">Rent</SelectItem>
                                        <SelectItem value="Salaries">Salaries</SelectItem>
                                        <SelectItem value="Others">Others (Custom Category)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formErrors.type && (
                                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-3. w-3" />
                                        {formErrors.type}
                                    </p>
                                )}
                            </div>

                            {formData.type === "Others" && (
                                <div className="space-y-1">
                                    <Label htmlFor="customType">Custom Category Name</Label>
                                    <Input
                                        id="customType"
                                        placeholder="e.g., Gas, Maintenance, Marketing"
                                        value={formData.customType}
                                        onChange={(e) => {
                                            setFormData((prev) => ({ ...prev, customType: e.target.value }));
                                            setFormErrors((prev) => ({ ...prev, type: "" }));
                                        }}
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label htmlFor="amount">Amount (৳)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g., 4500"
                                    value={formData.amount}
                                    onChange={(e) => {
                                        setFormData((prev) => ({ ...prev, amount: e.target.value }));
                                        setFormErrors((prev) => ({ ...prev, amount: "" }));
                                    }}
                                />
                                {formErrors.amount && (
                                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-3. w-3" />
                                        {formErrors.amount}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="details">Details / Remarks</Label>
                                <Textarea
                                    id="details"
                                    placeholder="Enter specific details (e.g., electricity bill for April 2026)"
                                    rows={3}
                                    value={formData.details}
                                    onChange={(e) => {
                                        setFormData((prev) => ({ ...prev, details: e.target.value }));
                                        setFormErrors((prev) => ({ ...prev, details: "" }));
                                    }}
                                />
                                {formErrors.details && (
                                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                        <AlertCircle className="h-3. w-3" />
                                        {formErrors.details}
                                    </p>
                                )}
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? "Logging..." : "Log Cost"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Dashboard Cards Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden border bg-card/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total logged operational cost</CardTitle>
                        <Coins className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ৳{metrics.total.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Combined operational metrics</p>
                    </CardContent>
                </Card>

                <Card className="border bg-card/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Utility Expenses</CardTitle>
                        <Receipt className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ৳{metrics.utilities.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Electricity, Water, Internet</p>
                    </CardContent>
                </Card>

                <Card className="border bg-card/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Fixed / Operations</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ৳{metrics.fixed.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Rent and Salaries</p>
                    </CardContent>
                </Card>

                <Card className="border bg-card/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Other Costs</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ৳{metrics.others.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Audit-logged custom items</p>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={costsQuery.data?.data ?? []}
                pagination={{
                    state: paginationState,
                    onPaginationChange: setPaginationState,
                }}
                sorting={{
                    state: sortingState,
                    onSortingChange: setSortingState,
                }}
                search={{
                    initialValue: searchTerm,
                    onDebouncedChange: setSearchTerm,
                    placeholder: "Search operational cost log...",
                }}
                isLoading={costsQuery.isLoading}
                meta={{
                    page: costsQuery.data?.meta?.page ?? 1,
                    limit: costsQuery.data?.meta?.limit ?? DEFAULT_LIMIT,
                    total: costsQuery.data?.meta?.total ?? 0,
                    totalPages: costsQuery.data?.meta?.totalPages ?? 0,
                }}
            />
        </div>
    );
}
