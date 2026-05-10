import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileLoading() {
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Header card skeleton */}
            <Card className="overflow-hidden rounded-xl border">
                <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                <CardContent className="-mt-14 px-6 pb-6">
                    <Skeleton className="size-24 rounded-full ring-4 ring-background" />
                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </CardContent>
            </Card>

            {/* Details card skeleton */}
            <Card className="rounded-xl border">
                <CardContent className="space-y-4 py-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-lg" />
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-4 w-44" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
