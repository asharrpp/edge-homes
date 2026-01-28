import { Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatsProps {
	stats: {
		total: number;
		pending: number;
		confirmed: number;
		cancelled: number;
	} | null;
}

export function BookingsStats({ stats }: StatsProps) {
	const statsData = stats || {
		total: 0,
		pending: 0,
		confirmed: 0,
		cancelled: 0,
	};

	const statCards = [
		{
			title: 'Total Bookings',
			value: statsData.total,
			icon: Calendar,
			color: 'bg-blue-500',
		},
		{
			title: 'Pending',
			value: statsData.pending,
			icon: Clock,
			color: 'bg-amber-500',
		},
		{
			title: 'Confirmed',
			value: statsData.confirmed,
			icon: CheckCircle,
			color: 'bg-green-500',
		},
		{
			title: 'Cancelled',
			value: statsData.cancelled,
			icon: XCircle,
			color: 'bg-red-500',
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{statCards.map((stat, index) => (
				<div
					key={index}
					className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">{stat.title}</p>
							<p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
						</div>
						<div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center`}>
							<stat.icon className="w-7 h-7 text-white" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
