// import { httpClient } from "@/lib/axios/httpClient";
// import type { ApiResponse } from "@/types/api.types";
// import { IAdminDashboardData } from "@/types/dashboard.types";

// type DashboardResponse =
//     | ApiResponse<IAdminDashboardData>
//     | { success: false; message: string; data: null; meta?: null };

// export async function getDashboardData(): Promise<DashboardResponse> {
//     try {
//         return await httpClient.get<IAdminDashboardData>("/dashboard");
//     } catch (error) {
//         const message =
//             error instanceof Error
//                 ? error.message
//                 : "An error occurred while fetching dashboard data.";
//         console.error("Failed to fetch dashboard data:", error);
//         return {
//             success: false,
//             message,
//             data: null,
//             meta: null,
//         };
//     }
// }
