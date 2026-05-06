"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { IAddress, IReview } from "@/types/customer.types";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AddressFormDialog } from "./address/AddressFormDialog";
import { AddressList } from "./address/AddressList";
import { LoyaltySummaryCard } from "./loyalty/LoyaltySummaryCard";
import { PointTransactionsTable } from "./loyalty/PointTransactionsTable";
import { ProfileSummaryCard } from "./profile/ProfileSummaryCard";
import { UpdateProfileForm } from "./profile/UpdateProfileForm";
import { ReferralCodeCard } from "./referral/ReferralCodeCard";
import { ReferralEventsTable } from "./referral/ReferralEventsTable";
import { ReviewFormDialog } from "./review/ReviewFormDialog";
import { MyReviewsTable } from "./review/MyReviewsTable";
import { useDeleteAddress, useDeleteReview, useMyAddresses, useMyCustomerProfile, useMyLoyaltySummary, useMyPointTransactions, useMyReferralCode, useMyReferralEvents, useMyReviews } from "../hooks";

const DEFAULT_PAGE_SIZE = 10;

const getServerPaginationQuery = (
    paginationState: PaginationState,
    sortingState: SortingState,
) => {
    const currentSorting = sortingState[0];
    const sortOrder: "asc" | "desc" = currentSorting?.desc ? "desc" : "asc";

    return {
        page: paginationState.pageIndex + 1,
        limit: paginationState.pageSize,
        sortBy: currentSorting?.id,
        sortOrder: currentSorting ? sortOrder : undefined,
    };
};

export const CustomerWorkspace = () => {
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<IAddress | undefined>();

    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<IReview | undefined>();
    const [deletingAddressId, setDeletingAddressId] = useState<string | undefined>();

    const [transactionPagination, setTransactionPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
    });
    const [transactionSorting, setTransactionSorting] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);

    const [referralPagination, setReferralPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
    });
    const [referralSorting, setReferralSorting] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);

    const [reviewPagination, setReviewPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
    });
    const [reviewSorting, setReviewSorting] = useState<SortingState>([
        { id: "createdAt", desc: true },
    ]);

    const { data: profile, isLoading: isProfileLoading, error: profileError } =
        useMyCustomerProfile();

    const { data: addressesResponse, isLoading: isAddressesLoading } = useMyAddresses({
        page: 1,
        limit: 100,
        sortBy: "isDefault",
        sortOrder: "desc",
    });

    const { mutateAsync: deleteAddress, isPending: isDeletingAddress } =
        useDeleteAddress();

    const { data: loyaltySummary, isLoading: isLoyaltySummaryLoading } =
        useMyLoyaltySummary();

    const transactionQueryParams = useMemo(() => {
        return getServerPaginationQuery(transactionPagination, transactionSorting);
    }, [transactionPagination, transactionSorting]);

    const { data: transactionsResponse, isLoading: isTransactionsLoading } =
        useMyPointTransactions(transactionQueryParams);

    const { data: referralCode, isLoading: isReferralCodeLoading } =
        useMyReferralCode();

    const referralQueryParams = useMemo(() => {
        return getServerPaginationQuery(referralPagination, referralSorting);
    }, [referralPagination, referralSorting]);

    const { data: referralEventsResponse, isLoading: isReferralEventsLoading } =
        useMyReferralEvents(referralQueryParams);

    const reviewQueryParams = useMemo(() => {
        return getServerPaginationQuery(reviewPagination, reviewSorting);
    }, [reviewPagination, reviewSorting]);

    const { data: myReviewsResponse, isLoading: isReviewsLoading } = useMyReviews(
        reviewQueryParams,
    );

    const { mutateAsync: deleteReview, isPending: isDeletingReview } =
        useDeleteReview();

    const onAddressCreateClick = () => {
        setSelectedAddress(undefined);
        setAddressDialogOpen(true);
    };

    const onAddressEditClick = (address: IAddress) => {
        setSelectedAddress(address);
        setAddressDialogOpen(true);
    };

    const onAddressDeleteClick = async (address: IAddress) => {
        const confirmDelete = window.confirm(
            "Delete this address? This action cannot be undone.",
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setDeletingAddressId(address.id);
            await deleteAddress(address.id);
            toast.success("Address deleted");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Delete failed");
        } finally {
            setDeletingAddressId(undefined);
        }
    };

    const onReviewCreateClick = () => {
        setSelectedReview(undefined);
        setReviewDialogOpen(true);
    };

    const onReviewEditClick = (review: IReview) => {
        setSelectedReview(review);
        setReviewDialogOpen(true);
    };

    const onReviewDeleteClick = async (review: IReview) => {
        const confirmDelete = window.confirm(
            "Delete this review? This action cannot be undone.",
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteReview(review.id);
            toast.success("Review deleted");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Delete failed");
        }
    };

    if (profileError) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    {profileError instanceof Error
                        ? profileError.message
                        : "Failed to load profile"}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-8">
            <section className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                    <p className="text-muted-foreground">
                        Manage your customer profile, addresses, loyalty points, referrals, and
                        reviews.
                    </p>
                </div>

                {isProfileLoading || !profile ? (
                    <Alert>
                        <AlertDescription>Loading profile...</AlertDescription>
                    </Alert>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        <ProfileSummaryCard profile={profile} />
                        <UpdateProfileForm
                            key={`${profile.id}-${profile.updatedAt}`}
                            profile={profile}
                        />
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Addresses</h2>

                    <Button type="button" onClick={onAddressCreateClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Address
                    </Button>
                </div>

                <AddressList
                    addresses={addressesResponse?.data ?? []}
                    isLoading={isAddressesLoading}
                    onEdit={onAddressEditClick}
                    onDelete={onAddressDeleteClick}
                    deletingAddressId={isDeletingAddress ? deletingAddressId : undefined}
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Loyalty</h2>

                <LoyaltySummaryCard
                    summary={loyaltySummary}
                    isLoading={isLoyaltySummaryLoading}
                />

                <PointTransactionsTable
                    transactions={transactionsResponse?.data ?? []}
                    meta={transactionsResponse?.meta}
                    isLoading={isTransactionsLoading}
                    paginationState={transactionPagination}
                    sortingState={transactionSorting}
                    onPaginationChange={setTransactionPagination}
                    onSortingChange={setTransactionSorting}
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Referrals</h2>

                <ReferralCodeCard
                    referralCode={referralCode}
                    isLoading={isReferralCodeLoading}
                />

                <ReferralEventsTable
                    events={referralEventsResponse?.data ?? []}
                    meta={referralEventsResponse?.meta}
                    isLoading={isReferralEventsLoading}
                    paginationState={referralPagination}
                    sortingState={referralSorting}
                    onPaginationChange={setReferralPagination}
                    onSortingChange={setReferralSorting}
                />
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">My Reviews</h2>

                    <Button type="button" onClick={onReviewCreateClick}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Review
                    </Button>
                </div>

                <MyReviewsTable
                    reviews={myReviewsResponse?.data ?? []}
                    meta={myReviewsResponse?.meta}
                    isLoading={isReviewsLoading}
                    paginationState={reviewPagination}
                    sortingState={reviewSorting}
                    onPaginationChange={setReviewPagination}
                    onSortingChange={setReviewSorting}
                    onEdit={onReviewEditClick}
                    onDelete={onReviewDeleteClick}
                />

                {isDeletingReview && (
                    <Alert>
                        <AlertDescription>Deleting review...</AlertDescription>
                    </Alert>
                )}
            </section>

            <AddressFormDialog
                key={selectedAddress?.id ?? "create-address"}
                isOpen={addressDialogOpen}
                onOpenChange={setAddressDialogOpen}
                initialAddress={selectedAddress}
            />

            <ReviewFormDialog
                key={selectedReview?.id ?? "create-review"}
                isOpen={reviewDialogOpen}
                onOpenChange={setReviewDialogOpen}
                initialReview={selectedReview}
            />
        </div>
    );
};
