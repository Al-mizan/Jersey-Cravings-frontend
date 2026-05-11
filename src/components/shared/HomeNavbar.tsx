"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { GlowEffect } from "../ui/glow-effect";
import { useAuth } from "@/hooks/useAuth";
import { NavbarUserMenu } from "./NavbarUserMenu";
import type { ApiResponse } from "@/types/api.types";
import type { ICart, ICartItem } from "@/types/commerce.types";

const primaryLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    // { label: "Collections", href: "/collections" },
    { label: "About", href: "/about" },
];

const cartQueryKey = ["cart", "my"] as const;
const maxCartQty = 10;

type CartSummary = {
    itemCount: number;
    subtotalAmount: number;
};

type CartResponse = ICart & {
    summary?: CartSummary;
};

const fetchMyCart = async (): Promise<CartResponse | null> => {
    const response = await axios.get<ApiResponse<CartResponse>>(
        "/api/proxy/carts/my",
    );
    return response.data.data ?? null;
};

const formatCurrency = (value: number) => `৳${value.toLocaleString("en-US")}`;

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

const HomeNavbar = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isAuthenticated, user } = useAuth();
    const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [justClosed, setJustClosed] = useState(false);
    const [showRing, setShowRing] = useState(false);

    const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevCountRef = useRef(0);
    const debounceTimersRef = useRef(
        new Map<string, ReturnType<typeof setTimeout>>(),
    );
    const iconControls = useAnimation();
    const badgeControls = useAnimation();

    const { data: cart } = useQuery({
        queryKey: cartQueryKey,
        queryFn: fetchMyCart,
        enabled: isCustomer,
        staleTime: 60_000,
    });

    const cartItems = cart?.items ?? [];

    const cartCount = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.qty, 0),
        [cartItems],
    );

    const cartSubtotal = useMemo(
        () =>
            cartItems.reduce(
                (sum, item) =>
                    sum + item.qty * (item.variant?.priceAmount ?? 0),
                0,
            ),
        [cartItems],
    );

    const ensureCartAccess = useCallback(() => {
        if (isCustomer) return true;
        toast.error("Please sign in to view your cart");
        router.push("/login?redirect=/");
        return false;
    }, [isCustomer, router]);

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

    const handleCartIconClick = () => {
        if (!ensureCartAccess()) return;
        setIsCartOpen(true);
    };

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

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.push("/checkout");
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0">
                            <SheetHeader className="border-b">
                                <SheetTitle>JerseyCravings</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-5 px-4 py-6">
                                <form action="/products" className="space-y-2">
                                    <label
                                        htmlFor="mobile-search"
                                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                    >
                                        Search
                                    </label>
                                </form>
                                <nav className="grid gap-1">
                                    {primaryLinks.map((link) => (
                                        <Button
                                            key={link.href}
                                            variant="ghost"
                                            className="justify-start text-md font-semibold"
                                            asChild
                                        >
                                            <Link href={link.href}>
                                                {link.label}
                                            </Link>
                                        </Button>
                                    ))}
                                </nav>
                                <Separator />
                                <div className="grid gap-2">
                                    <Button variant="outline" asChild>
                                        <Link href="/contact">Contact us</Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/jersey_cravings.png"
                            alt="JerseyCravings Logo"
                            width={38}
                            height={38}
                            className="rounded-full"
                        />
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {primaryLinks.map((link) => (
                            <Button
                                key={link.href}
                                variant="ghost"
                                size="sm"
                                className="text-md font-semibold"
                                asChild
                            >
                                <Link href={link.href}>{link.label}</Link>
                            </Button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2">
                    <form
                        action="/products"
                        className="relative hidden w-65 items-center md:flex lg:w-[320px]"
                    >
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            name="q"
                            type="search"
                            placeholder="Search jerseys, clubs"
                            className="pl-9"
                        />
                    </form>

                    <Sheet
                        open={isCartOpen}
                        onOpenChange={handleCartOpenChange}
                    >
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

                                <motion.div
                                    initial={false}
                                    animate={iconControls}
                                >
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
                                    <Badge variant="outline">
                                        {cartCount} items
                                    </Badge>
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
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsCartOpen(false)}
                                        >
                                            Continue Shopping
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <AnimatePresence initial={false}>
                                            {cartItems.map((item) => {
                                                const productTitle =
                                                    item.variant?.product
                                                        ?.title ?? "Product";
                                                const variantLabel = [
                                                    item.variant?.size,
                                                    item.variant?.fit,
                                                    item.variant?.sleeveType,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" • ");
                                                const productThumb =
                                                    item.variant?.product
                                                        ?.thumbNail ??
                                                    "/jersey_cravings.png";
                                                const unitPrice =
                                                    item.variant?.priceAmount ??
                                                    0;

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
                                                                src={
                                                                    productThumb
                                                                }
                                                                alt={
                                                                    productTitle
                                                                }
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex flex-1 flex-col gap-2">
                                                            <div>
                                                                <p className="text-sm font-semibold line-clamp-1">
                                                                    {
                                                                        productTitle
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {variantLabel ||
                                                                        "Standard"}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                <span>
                                                                    Unit price:{" "}
                                                                    {formatCurrency(
                                                                        unitPrice,
                                                                    )}
                                                                </span>
                                                                <span>
                                                                    Item total:{" "}
                                                                    <span className="text-sm font-semibold text-foreground">
                                                                        {formatCurrency(
                                                                            unitPrice *
                                                                                item.qty,
                                                                        )}
                                                                    </span>
                                                                </span>
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
                                                                            item.qty <=
                                                                            1
                                                                        }
                                                                    >
                                                                        <Minus className="size-3" />
                                                                    </Button>
                                                                    <span className="w-8 text-center text-xs font-semibold">
                                                                        {
                                                                            item.qty
                                                                        }
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

                    {isCustomer ? (
                        <NavbarUserMenu />
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="inline-flex"
                            asChild
                        >
                            <Link href="/login">
                                <div className="relative">
                                    <GlowEffect
                                        colors={[
                                            "#FF5733",
                                            "#33FF57",
                                            "#3357FF",
                                            "#F1C40F",
                                        ]}
                                        mode="colorShift"
                                        blur="soft"
                                        duration={3}
                                        scale={1.0}
                                    />
                                    <button className="relative inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-50 outline-1 outline-[#fff2f21f]">
                                        Sign In
                                    </button>
                                </div>
                            </Link>
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:inline-flex"
                        asChild
                    >
                        <Link href="/contact">Contact us</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default HomeNavbar;
