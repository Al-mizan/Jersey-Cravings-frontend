interface ProductInfoCellProps {
    title: string;
    slug: string;
    teamName: string;
}

export default function ProductInfoCell({
    title,
    slug,
    teamName,
}: ProductInfoCellProps) {
    return (
        <div className="space-y-1">
            <div className="font-medium">{title}</div>
            <div className="text-xs text-muted-foreground">
                {teamName} • {slug}
            </div>
        </div>
    );
}
