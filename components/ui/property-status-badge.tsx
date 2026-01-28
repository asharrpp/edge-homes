import { CheckCircle, XCircle } from 'lucide-react';

interface PropertyStatusBadgeProps {
	available: boolean;
}

export function PropertyStatusBadge({ available }: PropertyStatusBadgeProps) {
	return (
		<span
			className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
			{available ? (
				<>
					<CheckCircle className="w-3 h-3" />
					Available
				</>
			) : (
				<>
					<XCircle className="w-3 h-3" />
					Booked
				</>
			)}
		</span>
	);
}
