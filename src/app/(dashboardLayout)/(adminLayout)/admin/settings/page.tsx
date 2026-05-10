"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStorefrontSettings, updateStorefrontSettings } from "@/services/setting.service";
import { getAllCategories } from "@/services/product.service";
import { adminCategoryKeys } from "@/hooks/queries/adminQueryKeys";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
    const queryClient = useQueryClient();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

    // Fetch categories
    const categoriesQuery = useQuery({
        queryKey: adminCategoryKeys.options(),
        queryFn: () => getAllCategories(undefined, 1, 100, true, false),
    });

    // Fetch storefront settings
    const settingsQuery = useQuery({
        queryKey: ["storefront-settings"],
        queryFn: getStorefrontSettings,
    });

    // Initialize state when settings load
    useEffect(() => {
        if (settingsQuery.data?.findYourTeamCategoryId) {
            setSelectedCategoryId(settingsQuery.data.findYourTeamCategoryId);
        }
    }, [settingsQuery.data]);

    // Mutation to update settings
    const updateMutation = useMutation({
        mutationFn: updateStorefrontSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["storefront-settings"] });
            toast.success("Settings updated successfully");
        },
        onError: () => {
            toast.error("Failed to update settings");
        },
    });

    const handleSave = () => {
        updateMutation.mutate([
            { key: "findYourTeamCategoryId", value: selectedCategoryId }
        ]);
    };

    const isLoading = categoriesQuery.isLoading || settingsQuery.isLoading;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage global storefront configurations.</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Homepage Configurations</CardTitle>
                        <CardDescription>Configure the sections displayed on the storefront homepage.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isLoading ? (
                            <div className="flex justify-center p-6">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Find Your Team Section Category</Label>
                                    <Select
                                        value={selectedCategoryId}
                                        onValueChange={setSelectedCategoryId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoriesQuery.data?.data?.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Select which category's teams should be featured in the "Find Your Team" section on the homepage.
                                    </p>
                                </div>
                                <div className="flex justify-end">
                                    <Button 
                                        onClick={handleSave} 
                                        disabled={updateMutation.isPending || !selectedCategoryId}
                                    >
                                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
