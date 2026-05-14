export default function GlobalLoading() {
    const dots = [
        { color: "#E24B4A", delay: "0s" },
        { color: "#378ADD", delay: "0.15s" },
        { color: "#3B9E22", delay: "0.30s" },
        { color: "#EF9F27", delay: "0.45s" },
        { color: "#E07520", delay: "0.60s" },
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
            <style>{`
                @keyframes wave {
                    0%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-22px); }
                }
            `}</style>
            <div className="flex items-center gap-3.5">
                {dots.map((dot, i) => (
                    <div
                        key={i}
                        style={{
                            width: 20,
                            height: 20,
                            backgroundColor: dot.color,
                            borderRadius: "50%",
                            animation: `wave 1.2s ease-in-out infinite`,
                            animationDelay: dot.delay,
                        }}
                    />
                ))}
            </div>
            <span className="text-xs tracking-widest uppercase text-muted-foreground font-medium">
                Loading...
            </span>
        </div>
    );
}