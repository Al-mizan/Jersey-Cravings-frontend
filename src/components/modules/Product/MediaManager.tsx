"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp, Save, Trash2, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
    createProductMedia,
    deleteProductMedia,
    reorderProductMedia,
} from "@/services/product.services";
import { useFormError } from "@/hooks/useFormError";
import type { IProductMedia } from "@/types/product.types";

interface MediaManagerProps {
    productId: string;
    media: IProductMedia[] | null;
    isLoading?: boolean;
    onRefresh: () => void;
}

const MediaManager = ({
    productId,
    media,
    isLoading,
    onRefresh,
}: MediaManagerProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [altText, setAltText] = useState("");
    const { serverError, clearError, handleError } = useFormError();
    const [localOrder, setLocalOrder] = useState<IProductMedia[]>([]);

    useEffect(() => {
        setLocalOrder(media ? [...media] : []);
    }, [media]);

    const { mutateAsync: uploadMedia, isPending: isUploading } = useMutation({
        mutationFn: async () => {
            if (!selectedFile) {
                throw new Error("Please select a file");
            }

            const formData = new FormData();
            formData.append("file", selectedFile);
            if (altText) formData.append("altText", altText);

            return await createProductMedia(productId, formData);
        },
    });

    const { mutateAsync: deleteMediaMutation, isPending: isDeleting } =
        useMutation({
            mutationFn: async (mediaId: string) => {
                await deleteProductMedia(productId, mediaId);
            },
        });

    const { mutateAsync: reorderMediaMutation, isPending: isReordering } =
        useMutation({
            mutationFn: async (payload: {
                mediaOrder: { id: string; sortOrder: number }[];
            }) => {
                await reorderProductMedia(productId, payload);
            },
        });

    const handleUpload = async () => {
        clearError();
        try {
            await uploadMedia();
            setSelectedFile(null);
            setAltText("");
            onRefresh();
        } catch (error) {
            handleError(error);
        }
    };

    const handleDelete = async (mediaId: string) => {
        clearError();
        try {
            await deleteMediaMutation(mediaId);
            onRefresh();
        } catch (error) {
            handleError(error);
        }
    };

    const handleMove = (index: number, direction: "up" | "down") => {
        setLocalOrder((prev) => {
            const next = [...prev];
            const targetIndex = direction === "up" ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= next.length) return prev;
            const [item] = next.splice(index, 1);
            next.splice(targetIndex, 0, item);
            return next;
        });
    };

    const handleSaveOrder = async () => {
        clearError();
        try {
            const mediaOrder = localOrder.map((item, index) => ({
                id: item.id,
                sortOrder: index,
            }));
            await reorderMediaMutation({ mediaOrder });
            onRefresh();
        } catch (error) {
            handleError(error);
        }
    };

    return (
        <div className="space-y-4">
            {serverError && (
                <Alert variant="destructive">
                    <AlertDescription>{serverError}</AlertDescription>
                </Alert>
            )}

            <div className="rounded-md border p-4 space-y-3">
                <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                        <Label>Upload Image</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setSelectedFile(e.target.files?.[0] || null)
                            }
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Alt Text</Label>
                        <Input
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            placeholder="Front view"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload Media"}
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Media Order</p>
                    <p className="text-xs text-muted-foreground">
                        Dragging is not enabled yet. Use arrows and save.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleSaveOrder}
                    disabled={isReordering || localOrder.length === 0}
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isReordering ? "Saving..." : "Save Order"}
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : !media || media.length === 0 ? (
                <Alert>
                    <AlertDescription>No media uploaded yet.</AlertDescription>
                </Alert>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {localOrder.map((item, index) => (
                        <div
                            key={item.id}
                            className="rounded-md border p-2 space-y-2"
                        >
                            <img
                                src={item.secureUrl}
                                alt={item.altText || "Product image"}
                                className="w-full h-32 object-cover rounded"
                            />
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground truncate">
                                    {item.altText || "No alt text"}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleMove(index, "up")}
                                        disabled={index === 0}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            handleMove(index, "down")
                                        }
                                        disabled={
                                            index === localOrder.length - 1
                                        }
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        disabled={isDeleting}
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MediaManager;
