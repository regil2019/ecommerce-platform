import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/Button";

export const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className={`flex items-center justify-center gap-2 py-8 ${className}`}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-10 w-10 rounded-full"
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
            </Button>

            <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Logic for showing limited pages if total is large
                    if (
                        totalPages > 7 &&
                        (page < currentPage - 2 || page > currentPage + 2) &&
                        page !== 1 &&
                        page !== totalPages
                    ) {
                        if (page === currentPage - 3 || page === currentPage + 3) {
                            return <span key={page} className="px-2 text-muted-foreground">...</span>;
                        }
                        return null;
                    }

                    return (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "ghost"}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            className={`h-10 w-10 rounded-full ${currentPage === page
                                    ? "bg-primary text-primary-foreground font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {page}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-10 w-10 rounded-full"
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
            </Button>
        </div>
    );
};
