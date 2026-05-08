import { NavSection } from "@/types/dashboard.types";
import { getUserInfo } from "@/services/auth.service";
import DashboardNavbarContent from "./DashboardNavbarContent";
import { getNavItemsByRole } from "@/lib/navItems";
import { getDefaultDashboardRoute } from "@/lib/authUtils";

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
