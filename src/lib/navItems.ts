import { NavSection } from "@/types/dashboard.types";
import { UserRole } from "@/types/auth.types";

const adminNavItems: NavSection[] = [
    {
        title: "Overview",
        items: [
            {
                title: "Dashboard",
                href: "/admin/dashboard",
                icon: "LayoutDashboard",
            },
            {
                title: "Settings",
                href: "/admin/settings",
                icon: "Settings",
            },
        ],
    },
    {
        title: "Catalog",
        items: [
            // {
            //     title: "Categories",
            //     href: "/admin/categories",
            //     icon: "FolderTree",
            // },
            {
                title: "Products",
                href: "/admin/products",
                icon: "Shirt",
            },
            {
                title: "Banners",
                href: "/admin/banners",
                icon: "Image",
            },
            // {
            //     title: "Product Variants",
            //     href: "/admin/product-variants",
            //     icon: "Layers",
            // },
            {
                title: "Orders",
                href: "/admin/orders",
                icon: "ShoppingBag",
            },
            {
                title: "Payments",
                href: "/admin/payments",
                icon: "CreditCard",
            },
            {
                title: "Coupons",
                href: "/admin/coupons",
                icon: "Ticket",
            },
            {
                title: "Fulfillment",
                href: "/admin/fulfillment",
                icon: "Truck",
            },
            {
                title: "Audit Logs",
                href: "/admin/audit-logs",
                icon: "History",
            },
        ],
    },
    {
        title: "Customers",
        items: [
            {
                title: "Customers",
                href: "/admin/customers",
                icon: "Users",
            },
        ],
    },
    {
        title: "Governance",
        items: [
            {
                title: "Admins",
                href: "/admin/admins",
                icon: "Shield",
            },
            {
                title: "Utility Cost",
                href: "/admin/utility-cost",
                icon: "Coins",
            },
            // {
            //     title: "Activity",
            //     href: "/admin/activity",
            //     icon: "History",
            // },
        ],
    },
    {
        title: "Account",
        items: [
            {
                title: "My Profile",
                href: "/admin/my-profile",
                icon: "UserCircle",
            },
        ],
    },
];

export const customerNavItems: NavSection[] = [
    {
        title: "My Account",
        items: [
            {
                title: "My Profile",
                href: "/my-section/profile",
                icon: "UserCircle",
            },
            {
                title: "My Orders",
                href: "/my-section/orders",
                icon: "ShoppingBag",
            },
            {
                title: "My Ratings and Reviews",
                href: "/my-section/reviews/not-reviewed",
                icon: "MessageSquare",
            },
            // {
            //     title: "My Address",
            //     href: "/my-section/addresses",
            //     icon: "MapPin",
            // },
            {
                title: "My Points",
                href: "/my-section/points",
                icon: "Gift",
            },
            {
                title: "Referral Code",
                href: "/my-section/referral-code",
                icon: "Share2",
            },
            {
                title: "Logout",
                href: "/logout",
                icon: "LogOut",
            },
        ],
    },
];

export const getNavItemsByRole = (role: UserRole): NavSection[] => {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return adminNavItems;
    }

    return customerNavItems;
};
