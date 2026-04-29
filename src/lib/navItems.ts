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
        ],
    },
    {
        title: "Catalog",
        items: [
            {
                title: "Products",
                href: "/admin/products",
                icon: "Shirt",
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
                title: "Activity",
                href: "/admin/activity",
                icon: "History",
            },
        ],
    },
    {
        title: "Account",
        items: [
            {
                title: "My Profile",
                href: "/my-profile",
                icon: "User",
            },
            {
                title: "Change Password",
                href: "/change-password",
                icon: "KeyRound",
            },
        ],
    },
];

const customerNavItems: NavSection[] = [
    {
        title: "My Account",
        items: [
            {
                title: "Dashboard",
                href: "/dashboard",
                icon: "LayoutDashboard",
            },
            {
                title: "My Profile",
                href: "/my-profile",
                icon: "User",
            },
            {
                title: "Change Password",
                href: "/change-password",
                icon: "KeyRound",
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
