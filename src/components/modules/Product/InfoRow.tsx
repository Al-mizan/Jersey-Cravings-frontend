export function InfoRow({
    icon,
    title,
    text,
}: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-muted/20 p-3.5">
            <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-xl bg-foreground/8 text-foreground">
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wide text-foreground">
                    {title}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {text}
                </p>
            </div>
        </div>
    );
}