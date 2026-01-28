import { NotificationsFilters } from '@/components/pages/admin/notifications/notification-filters';
import { NotificationsHeader } from '@/components/pages/admin/notifications/notification-header';
import { NotificationsList } from '@/components/pages/admin/notifications/notification-list';
import { configurations } from '@/config';

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

export default async function NotificationsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
	const { backEndUrl } = configurations.envs;

	// Build query params
	const type = searchParams.type as string;
	const status = searchParams.status as string;
	const page = searchParams.page ? Number(searchParams.page) : 1;
	const limit = searchParams.limit ? Number(searchParams.limit) : 20;

	// Mock data - replace with actual API call
	const notifications: Notification[] = [
		{
			id: '1',
			type: 'booking',
			title: 'New Booking Request',
			message: 'John Doe has requested to book The Ikate Super-house from Dec 25 - Dec 30',
			isRead: false,
			timestamp: '2024-12-20T10:30:00Z',
			metadata: {
				bookingId: 'BOOK-001',
				propertyId: 'PROP-001',
				customerId: 'CUST-001',
				actionUrl: '/admin/bookings/BOOK-001',
			},
		},
		{
			id: '2',
			type: 'booking',
			title: 'Booking Confirmed',
			message: 'Booking #BOOK-002 has been automatically confirmed',
			isRead: true,
			timestamp: '2024-12-19T14:20:00Z',
			metadata: {
				bookingId: 'BOOK-002',
				propertyId: 'PROP-002',
				actionUrl: '/admin/bookings/BOOK-002',
			},
		},
		{
			id: '3',
			type: 'alert',
			title: 'Payment Failed',
			message: 'Payment for booking #BOOK-003 has failed. Please review.',
			isRead: false,
			timestamp: '2024-12-19T09:15:00Z',
			metadata: {
				bookingId: 'BOOK-003',
				actionUrl: '/admin/bookings/BOOK-003',
			},
		},
		{
			id: '4',
			type: 'system',
			title: 'System Maintenance',
			message: 'Scheduled maintenance will occur on Dec 22, 2024 from 2:00 AM to 4:00 AM',
			isRead: true,
			timestamp: '2024-12-18T16:45:00Z',
		},
		{
			id: '5',
			type: 'info',
			title: 'New Feature Available',
			message: 'Advanced analytics dashboard is now available for your properties',
			isRead: true,
			timestamp: '2024-12-17T11:20:00Z',
			metadata: {
				actionUrl: '/admin/analytics',
			},
		},
		{
			id: '6',
			type: 'booking',
			title: 'Check-in Reminder',
			message: 'Guest check-in for The Ikate Super-house is tomorrow',
			isRead: false,
			timestamp: '2024-12-17T09:00:00Z',
			metadata: {
				bookingId: 'BOOK-004',
				propertyId: 'PROP-001',
				actionUrl: '/admin/bookings/BOOK-004',
			},
		},
		{
			id: '7',
			type: 'alert',
			title: 'Property Issue Reported',
			message: 'Brownstone property has reported a maintenance issue in room 203',
			isRead: false,
			timestamp: '2024-12-16T15:30:00Z',
			metadata: {
				propertyId: 'PROP-003',
				actionUrl: '/admin/properties/PROP-003',
			},
		},
		{
			id: '8',
			type: 'system',
			title: 'Backup Complete',
			message: 'Daily database backup completed successfully',
			isRead: true,
			timestamp: '2024-12-16T04:00:00Z',
		},
	];

	// Filter notifications based on search params
	let filteredNotifications = notifications;

	if (type && type !== 'all') {
		filteredNotifications = filteredNotifications.filter((n) => n.type === type);
	}

	if (status === 'unread') {
		filteredNotifications = filteredNotifications.filter((n) => !n.isRead);
	} else if (status === 'read') {
		filteredNotifications = filteredNotifications.filter((n) => n.isRead);
	}

	// Calculate stats
	const totalCount = notifications.length;
	const unreadCount = notifications.filter((n) => !n.isRead).length;
	const bookingCount = notifications.filter((n) => n.type === 'booking').length;
	const alertCount = notifications.filter((n) => n.type === 'alert').length;

	return (
		<main className="space-y-6">
			<NotificationsHeader
				totalCount={totalCount}
				unreadCount={unreadCount}
			/>

			<div className="grid lg:grid-cols-4 gap-6">
				{/* Filters Sidebar */}
				<div className="lg:col-span-1">
					<NotificationsFilters
						currentType={type || 'all'}
						currentStatus={status || 'all'}
						stats={{
							bookingCount,
							alertCount,
							systemCount: notifications.filter((n) => n.type === 'system').length,
							infoCount: notifications.filter((n) => n.type === 'info').length,
						}}
					/>
				</div>

				{/* Notifications List */}
				<div className="lg:col-span-3">
					<NotificationsList
						notifications={filteredNotifications}
						currentPage={page}
						itemsPerPage={limit}
					/>
				</div>
			</div>
		</main>
	);
}
