import type { IProduct } from "@/types/product.types";
import { ProductCard } from "./ProductCard";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface ProductGridProps {
    products: IProduct[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

/**
 * Product grid with pagination
 */
export function ProductGrid({
    products,
    currentPage,
    totalPages,
    onPageChange,
}: ProductGridProps) {
    const pageNumbers = [];

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        if (currentPage <= 3) {
            for (let i = 1; i <= 3; i++) {
                pageNumbers.push(i);
            }
            pageNumbers.push("ellipsis");
            pageNumbers.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            pageNumbers.push(1);
            pageNumbers.push("ellipsis");
            for (let i = totalPages - 2; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            pageNumbers.push("ellipsis");
            pageNumbers.push(currentPage - 1);
            pageNumbers.push(currentPage);
            pageNumbers.push(currentPage + 1);
            pageNumbers.push("ellipsis");
            pageNumbers.push(totalPages);
        }
    }

    return (
        <div className="space-y-6">
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onPageChange(currentPage - 1);
                                        }}
                                    />
                                </PaginationItem>
                            )}

                            {pageNumbers.map((num, idx) =>
                                num === "ellipsis" ? (
                                    <PaginationItem key={`ellipsis-${idx}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={num}>
                                        <PaginationLink
                                            href="#"
                                            isActive={currentPage === num}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onPageChange(num as number);
                                            }}
                                        >
                                            {num}
                                        </PaginationLink>
                                    </PaginationItem>
                                ),
                            )}

                            {currentPage < totalPages && (
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onPageChange(currentPage + 1);
                                        }}
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
