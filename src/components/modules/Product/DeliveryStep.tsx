export function DeliveryStep({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-1.5 flex flex-col items-center">
                <span className="size-2.5 rounded-full bg-foreground" />
                <span className="mt-1 h-7 w-px bg-border/70" />
            </div>
            <div className="pb-2">
                <p className="text-sm font-bold text-foreground">{title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}