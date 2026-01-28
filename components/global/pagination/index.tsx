'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
	isLoading?: boolean;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, isLoading = false, hasNextPage, hasPreviousPage }: PaginationProps) => {
	if (totalPages <= 1) return null;

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		if (totalPages <= 7) {
			// Show all pages if 7 or fewer
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);
			if (currentPage > 3) {
				pages.push('...');
			}
			// Show pages around current page
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);
			for (let i = start; i <= end; i++) {
				pages.push(i);
			}
			if (currentPage < totalPages - 2) {
				pages.push('...');
			}
			// Always show last page
			pages.push(totalPages);
		}
		return pages;
	};

	return (
		<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
			{/* Pagination Controls */}
			<div className="flex items-center gap-1">
				{/* Previous Button */}
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={!hasPreviousPage || isLoading}
					className={`flex items-center justify-center w-10 h-10 rounded-md font-medium transition ${
						hasPreviousPage && !isLoading
							? 'bg-white border border-gray-300 text-gray-700 hover:bg-amber-500 hover:text-white'
							: 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
					}`}
					aria-label="Previous page">
					<ChevronLeft className="w-5 h-5" />
				</button>

				{/* Page Numbers */}
				<div className="flex items-center gap-1">
					{getPageNumbers().map((pageNum, index) => {
						if (pageNum === '...') {
							return (
								<span
									key={`ellipsis-${index}`}
									className="flex items-center justify-center w-10 h-10 text-gray-500">
									...
								</span>
							);
						}
						return (
							<button
								key={pageNum}
								onClick={() => onPageChange(pageNum as number)}
								disabled={isLoading}
								className={`flex items-center justify-center w-10 h-10 rounded-md font-medium transition ${
									pageNum === currentPage ? 'bg-amber-500 text-white shadow-sm' : 'bg-white border border-gray-300 text-amber-500 hover:bg-gray-50'
								} ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
								aria-label={`Go to page ${pageNum}`}
								aria-current={pageNum === currentPage ? 'page' : undefined}>
								{pageNum}
							</button>
						);
					})}
				</div>

				{/* Next Button */}
				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={!hasNextPage || isLoading}
					className={`flex items-center justify-center w-10 h-10 rounded-md font-medium transition ${
						hasNextPage && !isLoading
							? 'bg-white border border-gray-300 text-gray-700 hover:bg-amber-500 hover:text-white'
							: 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
					}`}
					aria-label="Next page">
					<ChevronRight className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
};
