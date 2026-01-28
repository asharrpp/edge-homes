import { CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

import { configurations } from '@/config';

interface Booking {
	id: string;
	customer: string;
	property: string;
	checkIn: string;
	checkOut: string;
	amount: string;
	status: 'pending' | 'confirmed' | 'cancelled';
}

export function RecentBookings({ bookings }: { bookings: Booking[] }) {
	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'confirmed':
				return <CheckCircle className="w-4 h-4 text-green-500" />;
			case 'pending':
				return <Clock className="w-4 h-4 text-amber-500" />;
			case 'cancelled':
				return <XCircle className="w-4 h-4 text-red-500" />;
			default:
				return <Clock className="w-4 h-4 text-gray-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'confirmed':
				return 'bg-green-100 text-green-800';
			case 'pending':
				return 'bg-amber-100 text-amber-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
				<Link
					href={configurations.urls.Admin.bookings.booking}
					className="text-sm text-amber-600 hover:text-amber-700 font-medium">
					View all →
				</Link>
			</div>

			<div className="space-y-4">
				{bookings.map((booking) => (
					<div
						key={booking.id}
						className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
						<div className="flex items-center space-x-4">
							<div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>{getStatusIcon(booking.status)}</div>
							<div>
								<p className="font-medium text-gray-900">{booking.customer}</p>
								<p className="text-sm text-gray-500">{booking.property}</p>
								<p className="text-xs text-gray-400">
									{booking.checkIn} → {booking.checkOut}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="font-semibold text-gray-900">{booking.amount}</p>
							<span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
								{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
