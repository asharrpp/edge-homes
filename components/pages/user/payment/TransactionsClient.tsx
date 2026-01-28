'use client';

import { Building, CheckCircle, ChevronDown, ChevronUp, Clock, CreditCard, Download, Eye, Loader, Plus, Receipt, Search, TrendingUp, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Pagination } from '@/components/global/pagination';
import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';

import type { TransactionsPageData, Transaction, PaginationType } from '@/lib/types';
interface TransactionsClientProps {
	data: TransactionsPageData;
}

type SortField = 'date' | 'amount' | 'status';
type SortDirection = 'asc' | 'desc';

export default function TransactionsClient({ data }: TransactionsClientProps) {
	const { push } = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
	const [selectedType, setSelectedType] = useState<string[]>([]);
	const [sortField, setSortField] = useState<SortField>('date');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationType | null>(null);

	useEffect(() => {
		setTransactions(data.transactions);
		setPagination(data.pagination);
		setCurrentPage(data.pagination.page || 1);
	}, [data]);

	const fetchTransactions = async (query: string = '', page: number = 1) => {
		setIsLoading(true);

		try {
			const { backEndUrl } = configurations.envs;
			const accessToken = await getCookie(USER_COOKIE_NAME);

			if (!accessToken) {
				push(`${configurations.urls.User.SignIn}?redirect=${encodeURIComponent(configurations.urls.User.Payment)}`);
				return;
			}

			const params = new URLSearchParams();

			params.append('page', String(page));

			if (query.trim()) {
				params.append('search', query.trim());
			}

			const res = await fetch(`${backEndUrl}/transaction?${params.toString()}`, {
				headers: {
					'Authorization': `Bearer ${accessToken.value}`,
					'Content-Type': 'application/json',
				},
			});

			if (!res.ok) {
				throw new Error('Failed to fetch transactions');
			}

			const result = await res.json();

			setTransactions(result.transactions);
			setPagination(result.pagination);
			setCurrentPage(result.pagination.page);
		} catch (err) {
			void err;
			toast.error('Failed to fetch transactions');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = async () => {
		if (isLoading) return;

		await fetchTransactions(searchQuery, 1);
	};

	const handlePageChange = async (newPage: number) => {
		if (isLoading || newPage === currentPage) return;

		await fetchTransactions(searchQuery, newPage);
	};

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-NG', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// Get status icon and color
	const getStatusInfo = (status: string) => {
		switch (status) {
			case 'SUCCESS':
				return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Success' };
			case 'PENDING':
				return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending' };
			case 'FAILED':
				return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' };
			default:
				return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown' };
		}
	};

	// Get type label
	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'CREDIT_PURCHASE':
				return 'Credit Purchase';
			case 'SUBSCRIPTION_RENEWAL':
				return 'Subscription Renewal';
			case 'UNLIMITED_PLAN':
				return 'Unlimited Plan';
			default:
				return type;
		}
	};

	// Export transactions as CSV
	const exportToCSV = () => {
		const headers = ['Date', 'Reference', 'Type', 'Amount (₦)', 'Credits', 'Status'];
		const rows = transactions.map((t) => [
			new Date(t.createdAt).toLocaleDateString(),
			t.paymentReference,
			getTypeLabel(t.type),
			t.amount.toLocaleString(),
			t.creditsPurchased || 'N/A',
			t.status,
		]);

		const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	// Handle sort
	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('desc');
		}
	};

	return (
		<main className="space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transaction History</h1>
					<p className="text-gray-600 mt-2">View and manage all your payment transactions</p>
				</div>
				<div className="mt-4 md:mt-0 flex items-center gap-3">
					<div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
						<CreditCard className="w-5 h-5 text-amber-600" />
						<span className="font-bold text-amber-700">
							{data.userProfile.credits} Credit{data.userProfile.credits !== 1 ? 's' : ''}
						</span>
					</div>
					<button
						onClick={exportToCSV}
						className="flex items-center justify-center py-2 px-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-200 hover:text-gray-600 transition-colors duration-500 ease-in-out">
						<Download className="w-4 h-4 mr-2" />
						Export CSV
					</button>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Total Transactions</p>
							<p className="text-2xl font-bold mt-1 text-gray-400">{data.stats.totalTransactions}</p>
						</div>
						<div className="bg-blue-100 p-3 rounded-lg">
							<Receipt className="w-6 h-6 text-blue-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">All payment records</p>
				</div>

				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Total Amount</p>
							<p className="text-2xl font-bold mt-1 text-gray-400">₦ {data.stats.totalAmount.toLocaleString()}</p>
						</div>
						<div className="bg-green-100 p-3 rounded-lg">
							<TrendingUp className="w-6 h-6 text-green-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">Successful transactions only</p>
				</div>

				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Credits Purchased</p>
							<p className="text-2xl font-bold mt-1 text-gray-400">{data.stats.creditsPurchased}</p>
						</div>
						<div className="bg-purple-100 p-3 rounded-lg">
							<Building className="w-6 h-6 text-purple-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">Total credits bought</p>
				</div>

				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Pending</p>
							<p className="text-2xl font-bold mt-1 text-gray-400">{data.stats.pendingTransactions}</p>
						</div>
						<div className="bg-amber-100 p-3 rounded-lg">
							<Clock className="w-6 h-6 text-amber-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">Awaiting confirmation</p>
				</div>
			</div>

			{/* Search and Filters Bar */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					{/* Search */}
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search by reference or amount..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-3 border border-gray-300 text-black placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
						/>
					</div>

					{/* Filter Toggle */}
					<button
						onClick={handleSearch}
						className="size-10 flex items-center justify-center rounded-lg border-gray-300 text-black hover:bg-amber-500 hover:text-white">
						<Search className="size-5" />
					</button>
				</div>
			</div>

			{/* Transactions Table */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				{/* Table Header */}
				<div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
					<div className="grid grid-cols-12 gap-4">
						<div className="col-span-5">
							<button
								onClick={() => handleSort('date')}
								className="flex items-center gap-1 font-medium text-gray-900 hover:text-amber-600">
								Date & Reference
								{sortField === 'date' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
							</button>
						</div>
						<div className="col-span-2">
							<button
								onClick={() => handleSort('amount')}
								className="flex items-center gap-1 font-medium text-gray-900 hover:text-amber-600">
								Amount
								{sortField === 'amount' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
							</button>
						</div>
						<div className="col-span-2">
							<span className="font-medium text-gray-900">Credits</span>
						</div>
						<div className="col-span-2">
							<button
								onClick={() => handleSort('status')}
								className="flex items-center gap-1 font-medium text-gray-900 hover:text-amber-600">
								Status
								{sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
							</button>
						</div>
						<div className="col-span-1">
							<span className="font-medium text-gray-900">Actions</span>
						</div>
					</div>
				</div>

				{/* Table Body */}
				<div className="divide-y divide-gray-200 min-h-[300px] relative">
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
							<Loader />
						</div>
					)}

					{!isLoading &&
						transactions.length > 0 &&
						transactions.map((transaction) => {
							const statusInfo = getStatusInfo(transaction.status);
							const StatusIcon = statusInfo.icon;

							return (
								<div
									key={transaction._id}
									className="px-6 py-4 hover:bg-gray-50 transition">
									<div className="grid grid-cols-12 gap-4 items-center">
										{/* Date & Reference */}
										<div className="col-span-5">
											<div className="flex items-start gap-3">
												<div className={`p-2 rounded-lg ${statusInfo.bg}`}>
													<StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
												</div>
												<div>
													<div className="font-medium text-gray-900">{formatDate(transaction.createdAt)}</div>
													<div className="text-sm text-gray-500 mt-1">
														Ref: <span className="font-mono">{transaction.paymentReference}</span>
													</div>
													<div className="text-xs text-gray-400 mt-1">{getTypeLabel(transaction.type)}</div>
												</div>
											</div>
										</div>

										{/* Amount */}
										<div className="col-span-2">
											<div className="flex items-center gap-2">
												<span className="font-bold text-gray-900">₦{transaction.amount.toLocaleString()}</span>
											</div>
										</div>

										{/* Credits */}
										<div className="col-span-2">
											<div className="flex items-center gap-2">
												{/* <Building className="w-4 h-4 text-gray-400" /> */}
												<span className="font-medium text-gray-900 flex items-center justify-center">
													{transaction.creditsPurchased > 0 ? (
														<>
															<span className="font-bold flex items-center justify-center">
																<Plus className="w-4 h-4 text-gray-400" /> {transaction.creditsPurchased}
															</span>
															<span className="text-sm text-gray-500 ml-1">credits</span>
														</>
													) : (
														<span className="text-gray-500">Unlimited</span>
													)}
												</span>
											</div>
										</div>

										{/* Status */}
										<div className="col-span-2">
											<span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
												<StatusIcon className="w-3 h-3" />
												{statusInfo.label}
											</span>
										</div>

										{/* Actions */}
										<div className="col-span-1">
											<button
												onClick={() => setSelectedTransaction(transaction)}
												className="p-2 hover:bg-gray-100 rounded-lg transition"
												title="View Details">
												<Eye className="w-5 h-5 text-gray-600" />
											</button>
										</div>
									</div>
								</div>
							);
						})}

					{!isLoading && transactions.length === 0 && (
						<div className="px-6 py-12 text-center">
							<Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
							<p className="text-gray-600 mb-6">
								{searchQuery || selectedStatus.length > 0 || selectedType.length > 0
									? 'Try adjusting your filters or search query'
									: "You haven't made any transactions yet"}
							</p>
							{!searchQuery && selectedStatus.length === 0 && selectedType.length === 0 && (
								<Link
									href="/user/subscription"
									className="inline-flex items-center gap-2 px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium">
									<CreditCard className="w-4 h-4" />
									Purchase Credits
								</Link>
							)}
						</div>
					)}
				</div>

				{/* Table Footer */}
				{transactions.length > 0 && (
					<div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
						<div className="text-sm text-gray-600">
							Showing {transactions.length} of {pagination?.itemCount} transactions
						</div>
						<div className="text-sm text-gray-600">
							Total: ₦
							{transactions
								.filter((t) => t.status === 'SUCCESS')
								.reduce((sum, t) => sum + t.amount, 0)
								.toLocaleString()}
						</div>
					</div>
				)}
			</div>

			{/* Pagination */}
			{pagination && pagination.totalPages > 1 && (
				<div className="mt-8">
					<Pagination
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						totalItems={pagination.itemCount}
						itemsPerPage={pagination.limit}
						hasNextPage={pagination.hasNextPage}
						onPageChange={handlePageChange}
						hasPreviousPage={pagination.hasPreviousPage}
					/>
				</div>
			)}

			{/* Transaction Details Modal */}
			{selectedTransaction && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							{/* Modal Header */}
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-3">
									<div className={`p-3 rounded-lg ${getStatusInfo(selectedTransaction.status).bg}`}>
										<Receipt className={`w-6 h-6 ${getStatusInfo(selectedTransaction.status).color}`} />
									</div>
									<div>
										<h3 className="font-bold text-gray-900">Transaction Details</h3>
										<p className="text-sm text-gray-500">Reference: {selectedTransaction.paymentReference}</p>
									</div>
								</div>
								<button
									onClick={() => setSelectedTransaction(null)}
									className="p-2 hover:bg-gray-100 rounded-lg transition">
									<XCircle className="w-5 h-5 text-gray-500" />
								</button>
							</div>

							{/* Details Grid */}
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500 mb-1">Amount</p>
										<p className="text-2xl font-bold text-gray-900">₦{selectedTransaction.amount.toLocaleString()}</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500 mb-1">Credits</p>
										<p className="text-2xl font-bold text-gray-900">
											{selectedTransaction.creditsPurchased > 0 ? `+${selectedTransaction.creditsPurchased}` : 'Unlimited'}
										</p>
									</div>
								</div>

								<div className="space-y-3">
									{[
										{ label: 'Transaction ID', value: selectedTransaction._id },
										{ label: 'Type', value: getTypeLabel(selectedTransaction.type) },
										{ label: 'Status', value: getStatusInfo(selectedTransaction.status).label },
										{ label: 'Created', value: formatDate(selectedTransaction.createdAt) },
									].map((item) => (
										<div
											key={item.label}
											className="flex justify-between items-center py-2 border-b border-gray-100">
											<span className="text-gray-600">{item.label}</span>
											<span className="font-medium text-gray-900">{item.value}</span>
										</div>
									))}
								</div>

								{/* Actions */}
								<div className="pt-4 border-t border-gray-200">
									{selectedTransaction.status === 'PENDING' && (
										<div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
											<div className="flex items-center gap-2 text-amber-700 mb-2">
												<Clock className="w-4 h-4" />
												<span className="font-medium">Payment Pending</span>
											</div>
											<p className="text-sm text-amber-600">This payment is still being processed. Please check back later or contact support if it takes too long.</p>
										</div>
									)}

									<div className="flex gap-3">
										<button
											onClick={() => setSelectedTransaction(null)}
											className="flex-1 py-3 rounded-lg bg-amber-600 hover:bg-amber-700">
											Close
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
