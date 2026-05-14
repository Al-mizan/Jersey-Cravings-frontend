"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getAllBanners,
    createBanner,
    updateBannerOrder,
    deleteBanner,
    restoreBanner,
} from "@/services/banner.service";
import { type IBanner } from "@/types/banner.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Upload,
    Loader2,
    Trash2,
    RotateCcw,
    ImageIcon,
    ArrowUpDown,
    CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

const bannerQueryKey = ["admin", "banners"] as const;

const MAX_ORIGINAL_SIZE_MB = 10; // Reject files over 10MB immediately
const COMPRESSION_TARGET_MB = 1; // Compress down to ~1MB
const MAX_DIMENSION = 1920;

/** Format bytes to a human-readable string */
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

type UploadPhase = "idle" | "compressing" | "uploading" | "done";

export default function BannerManagement() {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const [editingOrderValue, setEditingOrderValue] = useState<number>(0);

    // Upload state
    const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
    const [compressionProgress, setCompressionProgress] = useState(0);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);
    const [originalSize, setOriginalSize] = useState<number | null>(null);

    /* ─── Queries ────────────────────────────────────────────── */

    const { data: banners = [], isLoading } = useQuery({
        queryKey: bannerQueryKey,
        queryFn: () => getAllBanners(),
    });

    /* ─── Mutations ──────────────────────────────────────────── */

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            setUploadPhase("uploading");
            const formData = new FormData();
            formData.append("bannerImage", file);
            return createBanner(formData);
        },
        onSuccess: (data) => {
            if (data) {
                setUploadPhase("done");
                toast.success("Banner uploaded successfully", {
                    description: `Compressed from ${formatFileSize(originalSize ?? 0)} → ${formatFileSize(compressedSize ?? 0)}`,
                });
                queryClient.invalidateQueries({ queryKey: bannerQueryKey });
                // Reset after a short delay to show the success state
                setTimeout(() => {
                    setUploadPhase("idle");
                    setCompressedSize(null);
                    setOriginalSize(null);
                    setCompressionProgress(0);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                }, 1500);
            } else {
                setUploadPhase("idle");
                toast.error("Failed to upload banner", {
                    description:
                        "The server returned an empty response. Please try again.",
                });
            }
        },
        onError: (error: Error) => {
            setUploadPhase("idle");
            toast.error("Upload failed", {
                description:
                    error.message || "An unexpected error occurred during upload.",
            });
        },
    });

    const orderMutation = useMutation({
        mutationFn: ({ id, order }: { id: string; order: number }) =>
            updateBannerOrder(id, order),
        onSuccess: (data) => {
            if (data) {
                toast.success("Order updated");
                queryClient.invalidateQueries({ queryKey: bannerQueryKey });
                setEditingOrderId(null);
            } else {
                toast.error("Failed to update order");
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteBanner(id),
        onSuccess: (data) => {
            if (data) {
                toast.success("Banner deleted");
                queryClient.invalidateQueries({ queryKey: bannerQueryKey });
            } else {
                toast.error("Failed to delete banner");
            }
        },
    });

    const restoreMutation = useMutation({
        mutationFn: (id: string) => restoreBanner(id),
        onSuccess: (data) => {
            if (data) {
                toast.success("Banner restored");
                queryClient.invalidateQueries({ queryKey: bannerQueryKey });
            } else {
                toast.error("Failed to restore banner");
            }
        },
    });

    /* ─── Handlers ───────────────────────────────────────────── */

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate original file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > MAX_ORIGINAL_SIZE_MB) {
            toast.error("Image too large", {
                description: `Your file is ${fileSizeMB.toFixed(1)}MB. Please use an image under ${MAX_ORIGINAL_SIZE_MB}MB.`,
            });
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setOriginalSize(file.size);

        // Compress the image
        try {
            setUploadPhase("compressing");
            setCompressionProgress(0);

            const compressed = await imageCompression(file, {
                maxSizeMB: COMPRESSION_TARGET_MB,
                maxWidthOrHeight: MAX_DIMENSION,
                useWebWorker: true,
                onProgress: (progress: number) => {
                    setCompressionProgress(Math.round(progress));
                },
            });

            setCompressedSize(compressed.size);
            setCompressionProgress(100);

            // Brief pause to show 100% before uploading
            await new Promise((r) => setTimeout(r, 300));

            // Upload the compressed file
            uploadMutation.mutate(
                new File([compressed], file.name, {
                    type: compressed.type,
                }),
            );
        } catch (err) {
            setUploadPhase("idle");
            setCompressionProgress(0);
            console.error("Compression failed:", err);
            toast.error("Image compression failed", {
                description:
                    "Could not compress the image. Trying to upload the original…",
            });
            // Fallback: upload original
            uploadMutation.mutate(file);
        }
    };

    const handleOrderSave = (id: string) => {
        orderMutation.mutate({ id, order: editingOrderValue });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const isUploading = uploadPhase !== "idle";

    /* ─── Upload Status Indicator ────────────────────────────── */

    const renderUploadStatus = () => {
        if (uploadPhase === "idle") return null;

        return (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border bg-muted/30 text-sm">
                {uploadPhase === "compressing" && (
                    <>
                        <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium">
                                Compressing image…{" "}
                                <span className="text-muted-foreground">
                                    {compressionProgress}%
                                </span>
                            </p>
                            <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{
                                        width: `${compressionProgress}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </>
                )}

                {uploadPhase === "uploading" && (
                    <>
                        <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium">
                                Uploading to cloud…
                            </p>
                            {originalSize && compressedSize && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {formatFileSize(originalSize)} →{" "}
                                    {formatFileSize(compressedSize)}
                                </p>
                            )}
                        </div>
                    </>
                )}

                {uploadPhase === "done" && (
                    <>
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                        <p className="font-medium text-emerald-600">
                            Upload complete!
                        </p>
                    </>
                )}
            </div>
        );
    };

    /* ─── UI ─────────────────────────────────────────────────── */

    return (
        <div className="space-y-6">
            {/* Header + Upload */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Banner Management
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage hero slider banners for the homepage
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        id="banner-upload-input"
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="gap-2"
                    >
                        {isUploading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Upload className="size-4" />
                        )}
                        {isUploading ? "Processing…" : "Upload Banner"}
                    </Button>
                </div>
            </div>

            {/* Upload Progress Indicator */}
            {renderUploadStatus()}

            {/* Table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    Preview
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    <span className="inline-flex items-center gap-1">
                                        <ArrowUpDown className="size-3.5" />
                                        Order
                                    </span>
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                    Created
                                </th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-12 text-center text-muted-foreground"
                                    >
                                        <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                                        Loading banners…
                                    </td>
                                </tr>
                            ) : banners.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-12 text-center text-muted-foreground"
                                    >
                                        <ImageIcon className="size-8 mx-auto mb-2 opacity-40" />
                                        <p>No banners yet</p>
                                        <p className="text-xs mt-1">
                                            Upload your first banner image
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                banners.map((banner: IBanner) => (
                                    <tr
                                        key={banner.id}
                                        className={`transition-colors hover:bg-muted/20 ${
                                            banner.isDeleted
                                                ? "opacity-50"
                                                : ""
                                        }`}
                                    >
                                        {/* Preview */}
                                        <td className="px-4 py-3">
                                            <div className="relative h-14 w-28 rounded-md overflow-hidden border bg-muted/30">
                                                <Image
                                                    src={banner.imageUrl}
                                                    alt="Banner preview"
                                                    fill
                                                    className="object-cover"
                                                    sizes="112px"
                                                />
                                            </div>
                                        </td>

                                        {/* Order */}
                                        <td className="px-4 py-3">
                                            {editingOrderId === banner.id ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={
                                                            editingOrderValue
                                                        }
                                                        onChange={(e) =>
                                                            setEditingOrderValue(
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 0,
                                                            )
                                                        }
                                                        className="h-8 w-20"
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                "Enter"
                                                            )
                                                                handleOrderSave(
                                                                    banner.id,
                                                                );
                                                            if (
                                                                e.key ===
                                                                "Escape"
                                                            )
                                                                setEditingOrderId(
                                                                    null,
                                                                );
                                                        }}
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 px-2 text-xs"
                                                        onClick={() =>
                                                            handleOrderSave(
                                                                banner.id,
                                                            )
                                                        }
                                                        disabled={
                                                            orderMutation.isPending
                                                        }
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            ) : (
                                                <button
                                                    className="text-sm font-mono hover:text-primary transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        setEditingOrderId(
                                                            banner.id,
                                                        );
                                                        setEditingOrderValue(
                                                            banner.displayOrder,
                                                        );
                                                    }}
                                                >
                                                    {banner.displayOrder}
                                                </button>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            {banner.isDeleted ? (
                                                <Badge
                                                    variant="destructive"
                                                    className="text-xs"
                                                >
                                                    Deleted
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                >
                                                    Active
                                                </Badge>
                                            )}
                                        </td>

                                        {/* Created */}
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatDate(banner.createdAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-right">
                                            {banner.isDeleted ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() =>
                                                        restoreMutation.mutate(
                                                            banner.id,
                                                        )
                                                    }
                                                    disabled={
                                                        restoreMutation.isPending
                                                    }
                                                >
                                                    <RotateCcw className="size-3.5" />
                                                    Restore
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() =>
                                                        deleteMutation.mutate(
                                                            banner.id,
                                                        )
                                                    }
                                                    disabled={
                                                        deleteMutation.isPending
                                                    }
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    Delete
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
