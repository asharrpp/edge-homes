import { Building, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { RecentBookings } from '@/components/pages/admin/recent-bookings';
import { AdminStats } from '@/components/pages/admin/stats';
import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/constants';
import { BookingStatus, PropertyCurrency } from '@/lib/enums';
import { AdminDashboardData } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default async function AdminDashboard() {
	const session = await getSession(ADMIN_COOKIE_NAME);

	if (!session) {
		redirect(configurations.urls.Admin.SignIn);
	}

	const accessToken = await getCookie(ADMIN_COOKIE_NAME);
	const { backEndUrl } = configurations.envs;

	const headers = {
		'Authorization': `Bearer ${accessToken?.value}`,
		'Content-Type': 'application/json',
	};

	let dashboardData: AdminDashboardData | null = null;
	let error = false;

	try {
		const request = await fetch(`${backEndUrl}/user/admin-dashboard-overview`, {
			headers,
			next: { revalidate: 60 }, // Revalidate every minute
		});

		if (!request.ok) {
			throw new Error(`Failed to fetch dashboard data: ${request.status}`);
		}

		dashboardData = await request.json();
	} catch (error) {
		error = true;
	}

	// Format stats for AdminStats component
	const formatStatsForDisplay = (): {
		title: string;
		value: string;
		// change: string;
		// trending: 'up' | 'down';
		icon: React.ElementType;
		color: string;
	}[] => {
		if (!dashboardData?.stats) return [];

		const { stats } = dashboardData;

		return [
			{
				title: 'Total Properties',
				value: stats.totalProperties.toString(),
				// change: '+0%', // You can calculate real change if you have historical data
				// trending: 'up' as const,
				icon: Building,
				color: 'bg-blue-500',
			},
			{
				title: 'Active Bookings',
				value: stats.activeBookings.toString(),
				// change: '+0%',
				// trending: stats.activeBookings > 0 ? 'up' : 'down',
				icon: Calendar,
				color: 'bg-green-500',
			},
			{
				title: 'Credits Revenue',
				value: formatCurrency(stats.creditsRevenue, stats.revenueCurrency),
				// change: '+0%',
				// trending: 'up' as const,
				icon: Users,
				color: 'bg-purple-500',
			},
			{
				title: 'Booking Revenue',
				value: formatCurrency(stats.totalRevenue, stats.revenueCurrency),
				// change: `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}%`,
				// trending: stats.revenueChange >= 0 ? 'up' : 'down',
				icon: DollarSign,
				color: 'bg-amber-500',
			},
		];
	};

	// Format recent bookings for display
	const formatRecentBookings = () => {
		if (!dashboardData?.recentBookings) return [];

		return dashboardData.recentBookings.map((booking) => ({
			id: booking._id,
			customer: booking.customerName,
			property: booking.propertyTitle || booking.property?.title || 'Unknown Property',
			checkIn: new Date(booking.checkInDate).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			}),
			checkOut: booking.checkOutDate
				? new Date(booking.checkOutDate).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
					})
				: 'N/A',
			amount: formatCurrency(booking.totalAmount, booking.property.price.currency),
			status:
				booking.status === BookingStatus.CONFIRMED ? BookingStatus.CONFIRMED : booking.status === BookingStatus.PENDING ? BookingStatus.PENDING : BookingStatus.CANCELLED,
		}));
	};

	// Render loading/error state
	if (error) {
		return (
			<section className="space-y-6">
				<div className="bg-gradient-to-r from-red-900 to-red-700 rounded-2xl p-8 text-white">
					<div className="max-w-2xl">
						<h2 className="text-3xl font-bold mb-2">Oops! Something went wrong 😔</h2>
						<p className="text-red-100">We couldn't load your dashboard data. Please try again later.</p>
						<button
							onClick={() => window.location.reload()}
							className="mt-6 bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
							Retry
						</button>
					</div>
				</div>
			</section>
		);
	}

	if (!dashboardData) {
		return (
			<section className="space-y-6">
				<div className="bg-gradient-to-r from-gray-900 to-amber-700 rounded-2xl p-8 text-white">
					<div className="max-w-2xl">
						<h2 className="text-3xl font-bold mb-2">Loading Dashboard...</h2>
						<p className="text-amber-100">Fetching the latest data...</p>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
							<div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
							<div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
							<div className="h-3 bg-gray-200 rounded w-1/3"></div>
						</div>
					))}
				</div>
			</section>
		);
	}

	const maxRevenue = Math.max(...dashboardData.revenueTrend.map((d) => d.revenue), 1);

	return (
		<section className="space-y-6">
			{/* Welcome Banner */}
			<div className="bg-gradient-to-r from-gray-900 to-amber-700 rounded-2xl p-8 text-white">
				<div className="max-w-2xl">
					<h2 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h2>
					<p className="text-amber-100">
						{dashboardData.stats.pendingBookings > 0
							? `Here's what's happening with your properties today. You have ${dashboardData.stats.pendingBookings} pending booking${dashboardData.stats.pendingBookings > 1 ? 's' : ''} that need attention.`
							: 'Everything is looking great! No pending bookings.'}
					</p>
					{dashboardData.stats.pendingBookings > 0 && (
						<Link
							href={configurations.urls.Admin.bookings.booking}
							className="mt-6 inline-block bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition">
							View Pending Bookings
						</Link>
					)}
				</div>
			</div>

			{/* Stats Grid */}
			<AdminStats stats={formatStatsForDisplay()} />

			{/* Charts & Recent Activity */}
			<div className="grid md:grid-cols-2 gap-6">
				{/* Revenue Chart */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
						<select
							defaultValue="month"
							className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-black"
							// You could make this interactive with client-side filtering
						>
							<option value="week">Last 7 days</option>
							<option value="month">Last 30 days</option>
							<option value="year">Last 12 months</option>
						</select>
					</div>

					{dashboardData.revenueTrend && dashboardData.revenueTrend.length > 0 ? (
						<div className="h-64">
							<div className="flex items-end h-48 space-x-1 pt-4">
								{dashboardData.revenueTrend.map((point, index) => {
									const heightPercentage = (point.revenue / maxRevenue) * 100;

									return (
										<div
											key={index}
											className="flex-1 flex flex-col items-center">
											<div
												className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-lg transition-all hover:opacity-80"
												style={{
													height: `${heightPercentage}%`,
													minHeight: '4px',
												}}
												title={`₦${point.revenue.toLocaleString()} - ${point.bookings} booking${point.bookings !== 1 ? 's' : ''}`}></div>
											<span className="text-xs text-gray-500 mt-2 truncate w-full text-center">
												{new Date(point.date).toLocaleDateString('en-US', {
													month: 'short',
													day: 'numeric',
												})}
											</span>
										</div>
									);
								})}
							</div>
							<div className="mt-4 text-center">
								<p className="text-gray-700 font-medium">Total: {formatCurrency(dashboardData.stats.totalRevenue, dashboardData.stats.revenueCurrency)}</p>
								<p className="text-sm text-gray-500">
									{dashboardData.revenueTrend.length} day{dashboardData.revenueTrend.length > 1 ? 's' : ''} •{' '}
									{dashboardData.revenueTrend.reduce((sum, p) => sum + p.bookings, 0)} bookings
								</p>
							</div>
						</div>
					) : (
						<div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
							<div className="text-center">
								<div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
									<TrendingUp className="w-8 h-8" />
								</div>
								<p className="text-gray-500">No revenue data available</p>
								<p className="text-sm text-gray-400 mt-1">Revenue will appear here once you have confirmed bookings</p>
							</div>
						</div>
					)}
				</div>

				{/* Recent Bookings */}
				<RecentBookings bookings={formatRecentBookings()} />
			</div>

			{/* Quick Actions */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					<Link
						href={configurations.urls.Admin.properties + '?add-property=true'}
						className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition group relative">
						<div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
							<Building className="w-6 h-6" />
						</div>
						<span className="font-medium text-gray-900">Add Property</span>
						{/* {dashboardData.quickStats.properties > 0 && (
							<span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
								{dashboardData.quickStats.properties > 99 ? '99+' : dashboardData.quickStats.properties}
							</span>
						)} */}
					</Link>

					<Link
						href={configurations.urls.Admin.bookings.booking + '?add-booking=true'}
						className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition group relative">
						<div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
							<Calendar className="w-6 h-6" />
						</div>
						<span className="font-medium text-gray-900">New Booking</span>
						{/* {dashboardData.quickStats.pendingBookings > 0 && (
							<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
								{dashboardData.quickStats.pendingBookings > 99 ? '99+' : dashboardData.quickStats.pendingBookings}
							</span>
						)} */}
					</Link>

					<Link
						href={configurations.urls.Admin.customers.customer}
						className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition group relative">
						<div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
							<Users className="w-6 h-6" />
						</div>
						<span className="font-medium text-gray-900">Add Customer</span>
						{/* {dashboardData.quickStats.customers > 0 && (
							<span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
								{dashboardData.quickStats.customers > 99 ? '99+' : dashboardData.quickStats.customers}
							</span>
						)} */}
					</Link>

					{/* <a
						href={`${configurations.urls.Admin.bookings.booking}?generate-report=true`}
						className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
						<div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
							<DollarSign className="w-6 h-6" />
						</div>
						<span className="font-medium text-gray-900">Generate Report</span>
					</a> */}
				</div>
			</div>

			{/* Additional Stats (Optional) */}
			<div className="grid md:grid-cols-3 gap-6">
				<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Available Properties</span>
							<span className="font-semibold text-green-600">
								{dashboardData.stats.availableProperties} / {dashboardData.stats.totalProperties}
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="bg-green-500 h-2 rounded-full"
								style={{
									width: `${(dashboardData.stats.availableProperties / dashboardData.stats.totalProperties) * 100}%`,
								}}></div>
						</div>
						<p className="text-sm text-gray-500">Occupancy Rate: {dashboardData.stats.occupancyRate}%</p>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 bg-green-500 rounded-full"></div>
								<span className="text-gray-600">Confirmed</span>
							</div>
							<span className="font-semibold text-black">{dashboardData.stats.activeBookings - dashboardData.stats.pendingBookings}</span>
						</div>
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 bg-amber-500 rounded-full"></div>
								<span className="text-gray-600">Pending</span>
							</div>
							<span className="font-semibold text-black">{dashboardData.stats.pendingBookings}</span>
						</div>
						<div className="flex justify-between items-center">
							<div className="flex items-center gap-2">
								<div className="w-3 h-3 bg-red-500 rounded-full"></div>
								<span className="text-gray-600">Cancelled</span>
							</div>
							<span className="font-semibold text-black">{dashboardData.stats.totalBookings - dashboardData.stats.activeBookings}</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Revenue Change</span>
							<span className={`font-semibold ${dashboardData.stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
								{dashboardData.stats.revenueChange >= 0 ? '+' : ''}
								{dashboardData.stats.revenueChange}%
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Avg. Booking Value</span>
							<span className="font-semibold text-black">
								{dashboardData.stats.activeBookings > 0
									? formatCurrency(Math.round(dashboardData.stats.totalRevenue / dashboardData.stats.activeBookings), dashboardData.stats.revenueCurrency)
									: formatCurrency(0, dashboardData.stats.revenueCurrency)}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Conversion Rate</span>
							<span className="font-semibold text-black">
								{dashboardData.stats.totalCustomers > 0 ? `${Math.round((dashboardData.stats.activeBookings / dashboardData.stats.totalCustomers) * 100)}%` : '0%'}
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
