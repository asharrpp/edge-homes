'use client';

import { Bell, CheckCircle, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface NotificationsHeaderProps {
	totalCount: number;
	unreadCount: number;
}

export function NotificationsHeader({ totalCount, unreadCount }: NotificationsHeaderProps) {
	const router = useRouter();

	const handleMarkAllAsRead = async () => {
		try {
			// Call API to mark all as read
			toast.success('All notifications marked as read');
			router.refresh();
		} catch (error) {
			toast.error('Failed to mark notifications as read');
		}
	};

	const handleClearAll = async () => {
		try {
			// Call API to clear all notifications
			toast.success('All notifications cleared');
			router.refresh();
		} catch (error) {
			toast.error('Failed to clear notifications');
		}
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
					<p className="text-gray-500 mt-2">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}</p>
				</div>

				<div className="flex items-center space-x-4">
					<div className="relative">
						<Bell className="w-6 h-6 text-gray-600" />
						{unreadCount > 0 && (
							<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
								{unreadCount > 9 ? '9+' : unreadCount}
							</span>
						)}
					</div>

					<button className="p-2 text-gray-400 hover:text-gray-600 transition">
						<Settings className="w-5 h-5" />
					</button>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
				<div className="flex flex-wrap gap-3">
					<button
						onClick={handleMarkAllAsRead}
						disabled={unreadCount === 0}
						className="flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
						<CheckCircle className="w-5 h-5" />
						<span>Mark All as Read</span>
					</button>

					<button
						onClick={handleClearAll}
						disabled={totalCount === 0}
						className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
						Clear All
					</button>

					<button
						onClick={() => toast.info('Notification settings coming soon')}
						className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
						Notification Settings
					</button>
				</div>
			</div>
		</div>
	);
}
