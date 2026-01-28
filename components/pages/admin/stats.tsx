interface StatCardProps {
	title: string;
	value: string;
	// change: string;
	// trending: 'up' | 'down';
	icon: React.ElementType;
	color: string;
}

export function AdminStats({ stats }: { stats: StatCardProps[] }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{stats.map((stat, index) => (
				<div
					key={index}
					className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">{stat.title}</p>
							<p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
							<div className="flex items-center mt-2">
								{/* <span className={`flex items-center text-sm ${stat.trending === 'up' ? 'text-green-600' : 'text-red-600'}`}>
									{stat.trending === 'up' ? '↗' : '↘'}
									{stat.change} from last month
								</span> */}
							</div>
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
