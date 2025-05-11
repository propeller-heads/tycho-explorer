import React, { useState, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronFirst, ChevronLast } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TablePagination: React.FC<TablePaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  const [pageInputValue, setPageInputValue] = useState<string>(currentPage.toString());
  
  // Update the input value when currentPage changes
  useEffect(() => {
    setPageInputValue(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numeric input
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPageInputValue(value);
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  const handleGoToPage = () => {
    const pageNumber = parseInt(pageInputValue, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    } else {
      // Reset to current page if invalid input
      setPageInputValue(currentPage.toString());
    }
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <Pagination className="mt-4 w-full">
      <div className="flex flex-col items-center w-full gap-4">
        <PaginationContent className="flex flex-wrap items-center justify-center gap-2 mx-auto">
          {/* First Page Button */}
          <PaginationItem className="hidden sm:inline-flex">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
            >
              <ChevronFirst className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
          </PaginationItem>
          
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          
          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <PaginationItem key={i} className="hidden sm:inline-flex">
                <PaginationLink 
                  isActive={currentPage === pageNum}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          {/* Current page indicator for mobile */}
          <PaginationItem className="sm:hidden">
            <span className="text-sm px-3 py-1.5 border rounded-md bg-muted">
              {currentPage} / {totalPages}
            </span>
          </PaginationItem>
          
          {/* Next Button */}
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
            />
          </PaginationItem>
          
          {/* Last Page Button */}
          <PaginationItem className="hidden sm:inline-flex">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
            >
              <ChevronLast className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </PaginationItem>
        </PaginationContent>
        
        {/* Jump to Page */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Go to page:</span>
          <Input
            type="text"
            value={pageInputValue}
            onChange={handlePageInputChange}
            onKeyDown={handlePageInputKeyDown}
            className="w-16 h-8 text-center"
            aria-label="Go to page number"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            of {totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGoToPage}
            className="h-8 whitespace-nowrap"
          >
            Go
          </Button>
        </div>
      </div>
    </Pagination>
  );
};

export default memo(TablePagination);
