import { getDefaultDashboardRoute, getNavItemsByRole } from "@/lib/auth";
import { getUserInfo } from "@/services/auth.services";
import { NavSection } from "@/types/dashboard.types";
import DashboardNavbarContent from "./DashboardNavbarContent";

const DashboardNavbar = async () => {
    const userInfo = await getUserInfo();

    if (!userInfo || !userInfo.role) {
        return null;
    }

    const navItems: NavSection[] = getNavItemsByRole(userInfo.role);

    const dashboardHome = getDefaultDashboardRoute(userInfo.role);
    return (
        <DashboardNavbarContent
            userInfo={userInfo}
            navItems={navItems}
            dashboardHome={dashboardHome}
        />
    );
};

export default DashboardNavbar;
