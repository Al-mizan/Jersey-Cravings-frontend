import { getDefaultDashboardRoute, getNavItemsByRole } from "@/lib/auth";
import { getUserInfo } from "@/services/auth.services";
import { NavSection } from "@/types/dashboard.types";
import DashboardSidebarContent from "./DashboardSidebarContent";

const DashboardSidebar = async () => {
    const userInfo = await getUserInfo();
    const { role } = userInfo || {};

    if (!userInfo || !role) {
        return null; // or todo: a loading state
    }
    const navItems: NavSection[] = getNavItemsByRole(userInfo.role);

    const dashboardHome = getDefaultDashboardRoute(userInfo.role);
    return (
        <DashboardSidebarContent
            userInfo={userInfo}
            navItems={navItems}
            dashboardHome={dashboardHome}
        />
    );
};

export default DashboardSidebar;
