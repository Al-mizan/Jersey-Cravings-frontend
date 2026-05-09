"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, Filter, X } from "lucide-react";
import { useMemo, useState } from "react";

export interface DataTableFilterOption {
    label: string;
    value: string;
}

export type RangeOperator = "gte" | "lte";

interface BaseFilterConfig {
    id: string;
    label: string;
}

export interface SingleSelectFilterConfig extends BaseFilterConfig {
    type: "single-select";
    options: DataTableFilterOption[];
}

export interface MultiSelectFilterConfig extends BaseFilterConfig {
    type: "multi-select";
    options: DataTableFilterOption[];
}

export interface RangeFilterConfig extends BaseFilterConfig {
    type: "range";
}

export type DataTableFilterConfig =
    | SingleSelectFilterConfig
    | MultiSelectFilterConfig
    | RangeFilterConfig;

export type DataTableRangeValue = Partial<Record<RangeOperator, string>>;
export type DataTableFilterValue = string | string[] | DataTableRangeValue;
export type DataTableFilterValues = Record<string, DataTableFilterValue | undefined>;

interface DataTableFiltersProps {
    filters: DataTableFilterConfig[];
    values: DataTableFilterValues;
    onFilterChange: (filterId: string, value: DataTableFilterValue | undefined) => void;
    onClearAll?: () => void;
    isLoading?: boolean;
}

const RANGE_OPERATOR_LABEL: Record<RangeOperator, string> = {
    gte: "Min",
    lte: "Max",
};
const RANGE_OPERATORS: RangeOperator[] = ["gte", "lte"];

const isRangeValue = (
    value: DataTableFilterValue | undefined,
): value is DataTableRangeValue =>
    !!value && !Array.isArray(value) && typeof value === "object";

const getFilterActiveCount = (
    filter: DataTableFilterConfig,
    value: DataTableFilterValue | undefined,
): number => {
    if (!value) return 0;
    if (filter.type === "single-select")
        return typeof value === "string" && value.length > 0 ? 1 : 0;
    if (filter.type === "multi-select")
        return Array.isArray(value) ? value.length : 0;
    if (isRangeValue(value))
        return Object.values(value).filter((v) => v && v.length > 0).length;
    return 0;
};

// ─── Single Select ──────────────────────────────────────────────────────────
// ✅ Fix 3: DropdownMenu instead of Popover+Select — one click shows options
const SingleSelectFilter = ({
    filter,
    value,
    isLoading,
    onFilterChange,
}: {
    filter: SingleSelectFilterConfig;
    value: string;
    isLoading?: boolean;
    onFilterChange: (id: string, value: DataTableFilterValue | undefined) => void;
}) => {
    const activeOption = filter.options.find((o) => o.value === value);
    const isActive = Boolean(value);

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className={cn(
                        "h-9 gap-1.5",
                        isActive && "border-primary text-primary",
                    )}
                >
                    {filter.label}
                    {isActive ? (
                        <>
                            <span className="text-primary/60">·</span>
                            <span className="font-semibold">{activeOption?.label ?? value}</span>
                            {/* inline ×  — stops propagation so dropdown doesn't toggle */}
                            <span
                                role="button"
                                aria-label={`Clear ${filter.label}`}
                                className="ml-0.5 rounded-sm p-0.5 hover:bg-primary/20"
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFilterChange(filter.id, undefined);
                                }}
                            >
                                <X className="h-3 w-3" />
                            </span>
                        </>
                    ) : (
                        <Badge className="h-5 min-w-5 px-1.5" variant="secondary">
                            {getFilterActiveCount(filter, value) || "▾"}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="min-w-40">
                {filter.options.map((option) => {
                    const selected = option.value === value;
                    return (
                        <DropdownMenuItem
                            key={option.value}
                            className={cn("gap-2", selected && "font-medium text-primary")}
                            onClick={() =>
                                onFilterChange(filter.id, selected ? undefined : option.value)
                            }
                        >
                            <Check
                                className={cn(
                                    "h-3.5 w-3.5 shrink-0",
                                    selected ? "opacity-100" : "opacity-0",
                                )}
                            />
                            {option.label}
                        </DropdownMenuItem>
                    );
                })}

                {isActive && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="gap-2 text-muted-foreground"
                            onClick={() => onFilterChange(filter.id, undefined)}
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

// ─── Multi Select ───────────────────────────────────────────────────────────
const MultiSelectFilter = ({
    filter,
    value,
    isLoading,
    onFilterChange,
}: {
    filter: MultiSelectFilterConfig;
    value: string[];
    isLoading?: boolean;
    onFilterChange: (id: string, value: DataTableFilterValue | undefined) => void;
}) => {
    const [selected, setSelected] = useState<string[]>(value);
    const activeCount = value.length;

    const apply = () =>
        onFilterChange(filter.id, selected.length > 0 ? selected : undefined);

    return (
        // ✅ Fix: key is just filter.id — no filterValue in key
        // Previously key={`${filter.id}-${JSON.stringify(filterValue)}`} caused
        // the Popover to unmount/remount on every value change, closing it instantly.
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className={cn("h-9", activeCount > 0 && "border-primary text-primary")}
                >
                    {filter.label}
                    {activeCount > 0 && (
                        <Badge className="h-5 min-w-5 px-1.5" variant="secondary">
                            {activeCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
                <h3 className="mb-3 text-sm font-semibold">{filter.label}</h3>
                <div className="max-h-52 space-y-2 overflow-auto pr-1">
                    {filter.options.map((option) => {
                        const checked = selected.includes(option.value);
                        return (
                            <label
                                key={option.value}
                                className="flex cursor-pointer items-center gap-2 text-sm"
                            >
                                <Checkbox
                                    checked={checked}
                                    disabled={isLoading}
                                    onCheckedChange={(state) =>
                                        setSelected((prev) =>
                                            state
                                                ? [...prev, option.value]
                                                : prev.filter((v) => v !== option.value),
                                        )
                                    }
                                />
                                {option.label}
                            </label>
                        );
                    })}
                </div>
                <div className="mt-3 flex justify-between">
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected([])}
                        disabled={isLoading}
                    >
                        Clear
                    </Button>
                    <Button type="button" size="sm" onClick={apply} disabled={isLoading}>
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

// ─── Range ──────────────────────────────────────────────────────────────────
const RangeFilter = ({
    filter,
    value,
    isLoading,
    onFilterChange,
}: {
    filter: RangeFilterConfig;
    value: DataTableRangeValue;
    isLoading?: boolean;
    onFilterChange: (id: string, value: DataTableFilterValue | undefined) => void;
}) => {
    const [rangeValue, setRangeValue] = useState<DataTableRangeValue>(value);
    const activeCount = RANGE_OPERATORS.filter((op) => value[op]?.trim()).length;

    const apply = () => {
        const hasAny = RANGE_OPERATORS.some((op) => rangeValue[op]?.trim());
        onFilterChange(filter.id, hasAny ? rangeValue : undefined);
    };

    const clear = () => {
        setRangeValue({});
        onFilterChange(filter.id, undefined);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className={cn("h-9", activeCount > 0 && "border-primary text-primary")}
                >
                    {filter.label}
                    {activeCount > 0 && (
                        <Badge className="h-5 min-w-5 px-1.5" variant="secondary">
                            {activeCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
                <h3 className="mb-3 text-sm font-semibold">{filter.label}</h3>
                <div className="grid grid-cols-2 gap-2">
                    {RANGE_OPERATORS.map((op) => (
                        <div key={op} className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                                {RANGE_OPERATOR_LABEL[op]}
                            </Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={rangeValue[op] ?? ""}
                                disabled={isLoading}
                                onChange={(e) =>
                                    setRangeValue((prev) => ({ ...prev, [op]: e.target.value }))
                                }
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex justify-between">
                    <Button type="button" size="sm" variant="ghost" onClick={clear} disabled={isLoading}>
                        Clear
                    </Button>
                    <Button type="button" size="sm" onClick={apply} disabled={isLoading}>
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

// ─── Main ───────────────────────────────────────────────────────────────────
type ActiveBadge = { key: string; label: string; onRemove: () => void };

const DataTableFilters = ({
    filters,
    values,
    onFilterChange,
    onClearAll,
    isLoading,
}: DataTableFiltersProps) => {
    const totalActiveFilters = useMemo(
        () => filters.reduce((sum, f) => sum + getFilterActiveCount(f, values[f.id]), 0),
        [filters, values],
    );

    // const activeBadges = useMemo<ActiveBadge[]>(() => {
    //     const badges: ActiveBadge[] = [];
    //     for (const filter of filters) {
    //         const fv = values[filter.id];
    //         if (filter.type === "single-select" && typeof fv === "string" && fv) {
    //             const opt = filter.options.find((o) => o.value === fv);
    //             badges.push({
    //                 key: `${filter.id}:${fv}`,
    //                 label: `${filter.label}: ${opt?.label ?? fv}`,
    //                 onRemove: () => onFilterChange(filter.id, undefined),
    //             });
    //         }
    //         if (filter.type === "multi-select" && Array.isArray(fv)) {
    //             for (const val of fv) {
    //                 const opt = filter.options.find((o) => o.value === val);
    //                 badges.push({
    //                     key: `${filter.id}:${val}`,
    //                     label: `${filter.label}: ${opt?.label ?? val}`,
    //                     onRemove: () => {
    //                         const next = (fv as string[]).filter((v) => v !== val);
    //                         onFilterChange(filter.id, next.length > 0 ? next : undefined);
    //                     },
    //                 });
    //             }
    //         }
    //         if (filter.type === "range" && isRangeValue(fv)) {
    //             for (const op of RANGE_OPERATORS) {
    //                 const val = fv[op]?.trim();
    //                 if (val) {
    //                     badges.push({
    //                         key: `${filter.id}:${op}`,
    //                         label: `${filter.label}: ${RANGE_OPERATOR_LABEL[op]} ${val}`,
    //                         onRemove: () => {
    //                             const next: DataTableRangeValue = { ...fv, [op]: "" };
    //                             const hasAny = RANGE_OPERATORS.some((o) => next[o]?.trim());
    //                             onFilterChange(filter.id, hasAny ? next : undefined);
    //                         },
    //                     });
    //                 }
    //             }
    //         }
    //     }
    //     return badges;
    // }, [filters, values, onFilterChange]);

    if (filters.length === 0) return null;

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                {filters.map((filter) => {
                    const fv = values[filter.id];

                    if (filter.type === "single-select") {
                        return (
                            <SingleSelectFilter
                                key={filter.id}
                                filter={filter}
                                value={typeof fv === "string" ? fv : ""}
                                isLoading={isLoading}
                                onFilterChange={onFilterChange}
                            />
                        );
                    }
                    if (filter.type === "multi-select") {
                        return (
                            <MultiSelectFilter
                                key={filter.id}
                                filter={filter}
                                value={Array.isArray(fv) ? fv : []}
                                isLoading={isLoading}
                                onFilterChange={onFilterChange}
                            />
                        );
                    }
                    if (filter.type === "range") {
                        return (
                            <RangeFilter
                                key={filter.id}
                                filter={filter}
                                value={isRangeValue(fv) ? fv : {}}
                                isLoading={isLoading}
                                onFilterChange={onFilterChange}
                            />
                        );
                    }
                })}

                {onClearAll && totalActiveFilters > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9"
                        onClick={onClearAll}
                        disabled={isLoading}
                    >
                        <X className="h-4 w-4" />
                        Clear Filters
                    </Button>
                )}

                <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    <span>{totalActiveFilters} active</span>
                </div>
            </div>

            {/* {activeBadges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {activeBadges.map((badge) => (
                        <Badge
                            key={badge.key}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1 text-xs"
                        >
                            {badge.label}
                            <button
                                type="button"
                                onClick={badge.onRemove}
                                disabled={isLoading}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 disabled:pointer-events-none"
                                aria-label={`Remove ${badge.label}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )} */}
        </div>
    );
};

export default DataTableFilters;