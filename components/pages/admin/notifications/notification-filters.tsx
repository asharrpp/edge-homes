'use client';

import { AlertCircle, Calendar, Eye, EyeOff, Filter, Info, Settings } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface NotificationsFiltersProps {
	currentType: string;
	currentStatus: string;
	stats: {
		bookingCount: number;
		alertCount: number;
		systemCount: number;
		infoCount: number;
	};
}

export function NotificationsFilters({ currentType, currentStatus, stats }: NotificationsFiltersProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleFilterChange = (type: 'type' | 'status', value: string) => {
		const params = new URLSearchParams(searchParams.toString());

		if (value === 'all') {
			params.delete(type);
		} else {
			params.set(type, value);
		}

		params.delete('page'); // Reset to first page
		router.push(`/admin/notifications?${params.toString()}`);
	};

	const typeFilters = [
		{ value: 'all', label: 'All Types', count: stats.bookingCount + stats.alertCount + stats.systemCount + stats.infoCount },
		{ value: 'booking', label: 'Bookings', icon: Calendar, count: stats.bookingCount },
		{ value: 'alert', label: 'Alerts', icon: AlertCircle, count: stats.alertCount },
		{ value: 'system', label: 'System', icon: Settings, count: stats.systemCount },
		{ value: 'info', label: 'Info', icon: Info, count: stats.infoCount },
	];

	const statusFilters = [
		{ value: 'all', label: 'All', icon: null },
		{ value: 'unread', label: 'Unread Only', icon: EyeOff },
		{ value: 'read', label: 'Read Only', icon: Eye },
	];

	return (
		<div className="space-y-6">
			{/* Type Filters */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
				<div className="flex items-center space-x-2 mb-4">
					<Filter className="w-5 h-5 text-gray-400" />
					<h3 className="text-lg font-semibold text-gray-900">Filter by Type</h3>
				</div>

				<div className="space-y-2">
					{typeFilters.map((filter) => {
						const Icon = filter.icon;

						return (
							<button
								key={filter.value}
								onClick={() => handleFilterChange('type', filter.value)}
								className={`flex items-center justify-between w-full p-3 rounded-lg transition ${
									currentType === filter.value ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'hover:bg-gray-50 text-gray-700'
								}`}>
								<div className="flex items-center space-x-3">
									{Icon && <Icon className="w-5 h-5" />}
									<span className="font-medium">{filter.label}</span>
								</div>
								<span className={`px-2 py-1 text-xs rounded-full ${currentType === filter.value ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
									{filter.count}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Status Filters */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h3>

				<div className="space-y-2">
					{statusFilters.map((filter) => {
						const Icon = filter.icon;

						return (
							<button
								key={filter.value}
								onClick={() => handleFilterChange('status', filter.value)}
								className={`flex items-center space-x-3 w-full p-3 rounded-lg transition ${
									currentStatus === filter.value ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'hover:bg-gray-50 text-gray-700'
								}`}>
								{Icon && <Icon className="w-5 h-5" />}
								<span className="font-medium">{filter.label}</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Help Card */}
			<div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
				<h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
				<p className="text-blue-700 text-sm mb-4">Notifications help you stay updated on bookings, alerts, and system events.</p>
				<button
					onClick={() => window.open('/admin/help/notifications', '_blank')}
					className="text-sm text-blue-600 hover:text-blue-700 font-medium">
					Learn more →
				</button>
			</div>
		</div>
	);
}
