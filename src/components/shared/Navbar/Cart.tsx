import { AnimatePresence, motion, useAnimation } from "motion/react";
import { Button } from "../../ui/button";
import { getMediaUrl } from "@/lib/media";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "../../ui/sheet";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Badge } from "../../ui/badge";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ICartItem } from "@/types/commerce.types";
import { cartQueryKey, useCart } from "@/hooks/useCart";
import { CartResponse } from "@/services/cart.service";
import { ApiResponse } from "@/types/api.types";
import axios from "axios";

{
    /* this is cart and other menu */
}

const formatCurrency = (value: number) => `৳${value.toLocaleString("en-US")}`;

const maxCartQty = 10;

const clampQty = (qty: number) => Math.min(Math.max(qty, 1), maxCartQty);

const updateCartItemQty = (
    cart: CartResponse | null | undefined,
    itemId: string,
    qty: number,
): CartResponse | null | undefined => {
    if (!cart) return cart;
    return {
        ...cart,
        items: cart.items.map((item) =>
            item.id === itemId ? { ...item, qty } : item,
        ),
    };
};

const removeCartItem = (
    cart: CartResponse | null | undefined,
    itemId: string,
): CartResponse | null | undefined => {
    if (!cart) return cart;
    return {
        ...cart,
        items: cart.items.filter((item) => item.id !== itemId),
    };
};

export default function Cart() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isAuthenticated, user } = useAuth();

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [justClosed, setJustClosed] = useState(false);
    const [showRing, setShowRing] = useState(false);

    const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevCountRef = useRef(0);
    const debounceTimersRef = useRef(
        new Map<string, ReturnType<typeof setTimeout>>(),
    );

    const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

    const ensureCartAccess = useCallback(() => {
        if (isCustomer) return true;
        toast.error("Please sign in to view your cart");
        router.push("/login?redirect=/");
        return false;
    }, [isCustomer, router]);

    const handleCartIconClick = () => {
        if (!ensureCartAccess()) return;
        setIsCartOpen(true);
    };

    const iconControls = useAnimation();
    const badgeControls = useAnimation();

    const { cartItems, itemCount } = useCart();

    const cartCount = itemCount;

    const cartSubtotal = useMemo(
        () =>
            cartItems.reduce(
                (sum, item) =>
                    sum +
                    item.qty *
                        ((item.variant?.priceAmount ?? 0) +
                            (item.customizationCharge ?? 0)),
                0,
            ),
        [cartItems],
    );

    const triggerCloseAnimation = useCallback(() => {
        setJustClosed(true);
        iconControls
            .start({
                scale: [1, 1.12, 1],
                transition: { duration: 0.35, ease: "easeOut" },
            })
            .finally(() => {
                setJustClosed(false);
            });
        badgeControls.start({
            scale: [1, 1.35, 1],
            transition: { duration: 0.35, ease: "easeOut" },
        });
    }, [badgeControls, iconControls]);

    const triggerCartIconAnimation = useCallback(() => {
        iconControls.start({
            scale: [1, 1.4, 1],
            rotate: [0, -8, 8, -6, 0],
            transition: { duration: 0.6, ease: "easeOut" },
        });
        setShowRing(true);
        if (ringTimeoutRef.current) {
            clearTimeout(ringTimeoutRef.current);
        }
        ringTimeoutRef.current = setTimeout(() => {
            setShowRing(false);
        }, 1500);
    }, [iconControls]);

    const triggerBadgeAnimation = useCallback(() => {
        badgeControls.start({
            scale: [1, 1.5, 1],
            transition: { duration: 0.35, ease: "easeOut" },
        });
    }, [badgeControls]);

    useEffect(() => {
        const previousCount = prevCountRef.current;
        if (cartCount > previousCount) {
            triggerBadgeAnimation();
        }
        prevCountRef.current = cartCount;
    }, [cartCount, triggerBadgeAnimation]);

    useEffect(() => {
        const handleCartAdded = () => {
            if (!ensureCartAccess()) return;
            setIsCartOpen(true);
            triggerCartIconAnimation();
        };

        window.addEventListener("cart:added", handleCartAdded as EventListener);
        return () => {
            window.removeEventListener(
                "cart:added",
                handleCartAdded as EventListener,
            );
        };
    }, [ensureCartAccess, triggerCartIconAnimation]);

    const handleCartOpenChange = (open: boolean) => {
        if (!open) {
            setIsCartOpen(false);
            if (!justClosed) {
                triggerCloseAnimation();
            }
            return;
        }
        if (ensureCartAccess()) {
            setIsCartOpen(true);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (cartCount > 0) {
                triggerCartIconAnimation();
            }
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [cartCount, triggerCartIconAnimation]);

    useEffect(() => {
        return () => {
            if (ringTimeoutRef.current) {
                clearTimeout(ringTimeoutRef.current);
            }
            debounceTimersRef.current.forEach((timer) => clearTimeout(timer));
        };
    }, []);

    const updateCartItemMutation = useMutation({
        mutationFn: async (payload: {
            itemId: string;
            qty: number;
            previousCart?: CartResponse | null;
        }) => {
            await axios.patch<ApiResponse<ICartItem>>(
                `/api/proxy/carts/my/items/${payload.itemId}`,
                { qty: payload.qty },
            );
        },
        onMutate: async (variables) => {
            return { previousCart: variables.previousCart ?? null };
        },
        onError: (_error, variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(cartQueryKey, context.previousCart);
            }
            toast.error("Failed to update quantity");
        },
    });

    const removeCartItemMutation = useMutation({
        mutationFn: async (itemId: string) => {
            await axios.delete<ApiResponse<unknown>>(
                `/api/proxy/carts/my/items/${itemId}`,
            );
        },
        onMutate: async (itemId: string) => {
            await queryClient.cancelQueries({ queryKey: cartQueryKey });
            const previousCart =
                queryClient.getQueryData<CartResponse>(cartQueryKey);
            queryClient.setQueryData<CartResponse | null>(
                cartQueryKey,
                (current) => removeCartItem(current, itemId) ?? null,
            );
            return { previousCart };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousCart) {
                queryClient.setQueryData(cartQueryKey, context.previousCart);
            }
            toast.error("Failed to remove item");
        },
        onSuccess: () => {
            toast.success("Item removed from cart");
        },
    });

    const scheduleQtyUpdate = useCallback(
        (itemId: string, qty: number, previousCart?: CartResponse | null) => {
            const existingTimer = debounceTimersRef.current.get(itemId);
            if (existingTimer) {
                clearTimeout(existingTimer);
            }
            const timeout = setTimeout(() => {
                updateCartItemMutation.mutate({
                    itemId,
                    qty,
                    previousCart,
                });
            }, 450);
            debounceTimersRef.current.set(itemId, timeout);
        },
        [updateCartItemMutation],
    );

    const handleQuantityChange = useCallback(
        (item: ICartItem, nextQty: number) => {
            const clampedQty = clampQty(nextQty);
            if (clampedQty === item.qty) return;
            const previousCart =
                queryClient.getQueryData<CartResponse>(cartQueryKey);
            queryClient.setQueryData<CartResponse | null>(
                cartQueryKey,
                (current) =>
                    updateCartItemQty(current, item.id, clampedQty) ?? null,
            );
            scheduleQtyUpdate(item.id, clampedQty, previousCart ?? null);
        },
        [queryClient, scheduleQtyUpdate],
    );

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.push("/checkout");
    };

    return (
        <Sheet open={isCartOpen} onOpenChange={handleCartOpenChange}>
            <Button
                variant="ghost"
                size="icon"
                aria-label="View cart"
                onClick={handleCartIconClick}
            >
                <div className="relative">
                    <AnimatePresence>
                        {showRing && (
                            <motion.span
                                className="pointer-events-none absolute -inset-3 rounded-full"
                                style={{
                                    background:
                                        "conic-gradient(from 0deg, #10b981, #3b82f6, #f59e0b, #10b981)",
                                    WebkitMask:
                                        "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
                                    mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
                                }}
                                initial={{ opacity: 0, rotate: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    rotate: 360,
                                }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 1.5,
                                    ease: "easeOut",
                                }}
                            />
                        )}
                    </AnimatePresence>

                    <motion.div initial={false} animate={iconControls}>
                        <ShoppingCart className="size-5" />
                    </motion.div>

                    {cartCount > 0 && (
                        <motion.span
                            initial={false}
                            animate={badgeControls}
                            className="absolute -right-2 -top-2"
                        >
                            <Badge className="h-4 px-1 text-[10px]">
                                {cartCount}
                            </Badge>
                        </motion.span>
                    )}
                </div>
            </Button>

            <SheetContent
                side="right"
                className="flex h-full flex-col p-0 sm:max-w-md"
            >
                <SheetHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle>Your Cart</SheetTitle>
                        <Badge variant="outline">{cartCount} items</Badge>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    {cartItems.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                                <ShoppingCart className="size-7 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    Your cart is empty
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Add something to get started.
                                </p>
                            </div>
                            <Link href="/products" className="cursor-pointer">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsCartOpen(false)}
                                >
                                    Continue Shopping
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence initial={false}>
                                {cartItems.map((item) => {
                                    const productTitle =
                                        item.variant?.product?.title ??
                                        "Product";
                                    const variantLabel = [
                                        item.variant?.size,
                                        item.variant?.fit,
                                        item.variant?.sleeveType,
                                    ]
                                        .filter(Boolean)
                                        .join(" • ");
                                    const productMedia = getMediaUrl(
                                        item.variant?.product?.media,
                                    ) ||
                                        item.variant?.product?.thumbNail ||
                                        "/jersey_cravings.png";
                                    const unitPrice =
                                        item.variant?.priceAmount ?? 0;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{
                                                opacity: 0,
                                                x: 20,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                x: 40,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                            }}
                                            className="flex gap-3 rounded-xl border border-border/60 p-3"
                                        >
                                            <div className="relative size-16 overflow-hidden rounded-lg bg-muted">
                                                <Image
                                                    src={productMedia}
                                                    alt={productTitle}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-1 flex-col gap-2">
                                                <div>
                                                    <p className="text-sm font-semibold line-clamp-1">
                                                        {productTitle}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {variantLabel ||
                                                            "Standard"}
                                                    </p>
                                                    {item.customPlayerName &&
                                                        item.customJerseyNumber && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {item.customPlayerName && (
                                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                        Name:{" "}
                                                                        {
                                                                            item.customPlayerName
                                                                        }
                                                                    </span>
                                                                )}
                                                                {item.customJerseyNumber && (
                                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                                        Number:{" "}
                                                                        {
                                                                            item.customJerseyNumber
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                    {/* Unit Price */}
                                                    <div className="flex items-center justify-between">
                                                        <span>Unit price:</span>
                                                        <span>
                                                            {formatCurrency(
                                                                unitPrice,
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Customization Charge */}
                                                    {item.customJerseyNumber &&
                                                        item.customPlayerName && (
                                                            <div className="flex items-center justify-between">
                                                                <span>
                                                                    Customization:
                                                                </span>
                                                                <span className="font-semibold tabular-nums">
                                                                    +
                                                                    {formatCurrency(
                                                                        item.customizationCharge *
                                                                            item.qty,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}

                                                    {/* Divider + Subtotal (only when customized) */}
                                                    {item.customJerseyNumber &&
                                                        item.customPlayerName && (
                                                            <>
                                                                <hr className="border-border my-0.5" />
                                                                <div className="flex items-center justify-between font-black text-foreground">
                                                                    <span>
                                                                        Item
                                                                        total:
                                                                    </span>
                                                                    <span>
                                                                        {formatCurrency(
                                                                            (unitPrice +
                                                                                item.customizationCharge) *
                                                                                item.qty,
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                </div>
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex items-center rounded-full border border-input">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item,
                                                                    item.qty -
                                                                        1,
                                                                )
                                                            }
                                                            disabled={
                                                                item.qty <= 1
                                                            }
                                                        >
                                                            <Minus className="size-3" />
                                                        </Button>
                                                        <span className="w-8 text-center text-xs font-semibold">
                                                            {item.qty}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    item,
                                                                    item.qty +
                                                                        1,
                                                                )
                                                            }
                                                            disabled={
                                                                item.qty >=
                                                                maxCartQty
                                                            }
                                                        >
                                                            <Plus className="size-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    removeCartItemMutation.mutate(
                                                        item.id,
                                                    )
                                                }
                                                aria-label="Remove item"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                <SheetFooter className="border-t">
                    <div className="flex w-full flex-col gap-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>
                            <span className="font-semibold">
                                {formatCurrency(cartSubtotal)}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Shipping calculated at checkout
                        </p>
                        <Button
                            className="w-full"
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                        >
                            অর্ডার করতে এগিয়ে যান →
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
