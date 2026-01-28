'use client';

import { AlertCircle, Bell, Calendar, CheckCircle, ExternalLink, Eye, EyeOff, Info, Settings, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface Notification {
	id: string;
	type: 'booking' | 'system' | 'alert' | 'info';
	title: string;
	message: string;
	isRead: boolean;
	timestamp: string;
	metadata?: {
		bookingId?: string;
		propertyId?: string;
		customerId?: string;
		actionUrl?: string;
	};
}

interface NotificationsListProps {
	notifications: Notification[];
	currentPage: number;
	itemsPerPage: number;
}

export function NotificationsList({ notifications, currentPage, itemsPerPage }: NotificationsListProps) {
	const router = useRouter();
	const [loadingId, setLoadingId] = useState<string | null>(null);

	const getTypeIcon = (type: string) => {
		switch (type) {
			case 'booking':
				return { icon: Calendar, color: 'text-blue-500 bg-blue-100' };
			case 'alert':
				return { icon: AlertCircle, color: 'text-red-500 bg-red-100' };
			case 'system':
				return { icon: Settings, color: 'text-gray-500 bg-gray-100' };
			case 'info':
				return { icon: Info, color: 'text-green-500 bg-green-100' };
			default:
				return { icon: Info, color: 'text-gray-500 bg-gray-100' };
		}
	};

	const formatTimeAgo = (timestamp: string) => {
		const now = new Date();
		const past = new Date(timestamp);
		const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

		if (diffInSeconds < 60) return 'Just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
		if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
		return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
	};

	const formatDate = (timestamp: string) => {
		return new Date(timestamp).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const handleMarkAsRead = async (id: string) => {
		setLoadingId(id);
		try {
			// Call API to mark as read
			toast.success('Notification marked as read');
			router.refresh();
		} catch (error) {
			toast.error('Failed to update notification');
		} finally {
			setLoadingId(null);
		}
	};

	const handleDelete = async (id: string) => {
		setLoadingId(id);
		try {
			// Call API to delete notification
			toast.success('Notification deleted');
			router.refresh();
		} catch (error) {
			toast.error('Failed to delete notification');
		} finally {
			setLoadingId(null);
		}
	};

	const handleAction = (notification: Notification) => {
		if (notification.metadata?.actionUrl) {
			router.push(notification.metadata.actionUrl);
		}
	};

	if (notifications.length === 0) {
		return (
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
				<Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
				<p className="text-gray-500">You're all caught up! Check back later for new notifications.</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
			<div className="divide-y divide-gray-200">
				{notifications.map((notification) => {
					const { icon: Icon, color } = getTypeIcon(notification.type);

					return (
						<div
							key={notification.id}
							className={`p-6 transition ${notification.isRead ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50`}>
							<div className="flex items-start space-x-4">
								{/* Icon */}
								<div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
									<Icon className="w-6 h-6" />
								</div>

								{/* Content */}
								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between">
										<div>
											<div className="flex items-center space-x-2">
												<h3 className={`font-semibold text-lg ${notification.isRead ? 'text-gray-900' : 'text-gray-900'}`}>{notification.title}</h3>
												{!notification.isRead && <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">New</span>}
											</div>
											<p className="text-gray-600 mt-1">{notification.message}</p>

											{/* Metadata */}
											{notification.metadata && (
												<div className="flex flex-wrap gap-2 mt-3">
													{notification.metadata.bookingId && (
														<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Booking: {notification.metadata.bookingId}</span>
													)}
													{notification.metadata.propertyId && (
														<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Property ID: {notification.metadata.propertyId}</span>
													)}
												</div>
											)}
										</div>

										<div className="text-right">
											<p className="text-sm text-gray-500">{formatTimeAgo(notification.timestamp)}</p>
											<p className="text-xs text-gray-400 mt-1">{formatDate(notification.timestamp)}</p>
										</div>
									</div>

									{/* Actions */}
									<div className="flex items-center justify-between mt-4">
										<div className="flex items-center space-x-3">
											{notification.metadata?.actionUrl && (
												<button
													onClick={() => handleAction(notification)}
													className="flex items-center space-x-1 text-amber-600 hover:text-amber-700 font-medium">
													<span>View Details</span>
													<ExternalLink className="w-4 h-4" />
												</button>
											)}
										</div>

										<div className="flex items-center space-x-2">
											{!notification.isRead && (
												<button
													onClick={() => handleMarkAsRead(notification.id)}
													disabled={loadingId === notification.id}
													className="p-2 text-gray-400 hover:text-green-600 transition disabled:opacity-50"
													title="Mark as read">
													<CheckCircle className="w-5 h-5" />
												</button>
											)}
											{notification.isRead && (
												<button
													onClick={() => handleMarkAsRead(notification.id)}
													disabled={loadingId === notification.id}
													className="p-2 text-gray-400 hover:text-blue-600 transition disabled:opacity-50"
													title="Mark as unread">
													<EyeOff className="w-5 h-5" />
												</button>
											)}
											<button
												onClick={() => handleDelete(notification.id)}
												disabled={loadingId === notification.id}
												className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
												title="Delete">
												<Trash2 className="w-5 h-5" />
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Pagination */}
			{notifications.length > itemsPerPage && (
				<div className="px-6 py-4 border-t border-gray-200">
					<div className="flex items-center justify-between">
						<div className="text-sm text-gray-500">
							Showing {notifications.length > itemsPerPage ? itemsPerPage : notifications.length} of {notifications.length} notifications
						</div>
						<div className="flex space-x-2">
							<button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
								Previous
							</button>
							<button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
