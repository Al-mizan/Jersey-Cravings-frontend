import { Input } from "@/components/ui/input";

interface ProfileFieldProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    isEditing: boolean;
    editValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    inputId?: string;
}

export default function ProfileField({
    icon,
    label,
    value,
    isEditing,
    editValue,
    onChange,
    placeholder,
    inputId,
}: ProfileFieldProps) {
    return (
        <div className="flex items-center gap-4 py-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                <span className="text-muted-foreground">{icon}</span>
            </div>
            <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                </p>
                {isEditing && onChange ? (
                    <Input
                        id={inputId}
                        className="mt-1"
                        value={editValue ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                    />
                ) : (
                    <p className="mt-0.5 text-sm text-foreground">{value}</p>
                )}
            </div>
        </div>
    );
}
