"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { useState, useEffect } from "react";

interface ProductSearchProps {
    value?: string;
    onSearch: (term: string) => void;
    placeholder?: string;
    isLoading?: boolean;
}

/**
 * Search input for product browsing
 * Debounces search input to avoid excessive API calls
 */
export function ProductSearch({
    value = "",
    onSearch,
    placeholder = "Search products, teams, jerseys...",
    isLoading,
}: ProductSearchProps) {
    const [searchTerm, setSearchTerm] = useState(value);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    const handleClear = () => {
        setSearchTerm("");
        onSearch("");
    };

    return (
        <div className="relative flex-1">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 pr-10"
                />
                {searchTerm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        disabled={isLoading}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
