import { BarChartData } from "@/types/dashboard.types";
import { format } from "date-fns";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";

interface AppointmentBarChartProps {
    data: BarChartData[];
}

const OrderBarChart = ({ data }: AppointmentBarChartProps) => {
    if (!data || !Array.isArray(data)) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Order Trends</CardTitle>
                    <CardDescription>
                        Monthly Order Statistics
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-75">
                    <p className="text-sm text-muted-foreground">
                        Invalid data provided for the chart.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const formattedData = data.map((item) => {
        const rawLabel =
            typeof item.month === "string"
                ? item.month
                : format(item.month, "MMM yyyy");
        const dateCandidate =
            typeof item.month === "string" ? new Date(item.month) : item.month;

        return {
            month:
                dateCandidate instanceof Date &&
                !Number.isNaN(dateCandidate.getTime())
                    ? format(dateCandidate, "MMM yyyy")
                    : rawLabel,
            orders: Number(item.count),
        };
    });

    if (
        !formattedData.length ||
        formattedData.every((item) => item.orders === 0)
    ) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Order Trends</CardTitle>
                    <CardDescription>
                        Monthly Order Statistics
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-75">
                    <p className="text-sm text-muted-foreground">
                        No order data available.
                    </p>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card className="col-span-4 border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
                <CardTitle>Order Trends</CardTitle>
                <CardDescription>
                    Monthly Order Statistics
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            tickLine={false}
                            axisLine={false}
                            dataKey="month"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "0.75rem",
                                border: "1px solid oklch(0.92 0.01 286.3)",
                                background: "oklch(1 0 0 / 0.95)",
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="orders"
                            fill="oklch(0.646 0.222 41.116)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default OrderBarChart;
