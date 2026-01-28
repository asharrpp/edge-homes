import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

import { configurations } from '@/config';
import { MetaData, OtherDetails, Socials } from '@/lib/constants';
import { formatPhone } from '@/lib/utils';

export function Footer() {
	return (
		<footer
			id="contact"
			className="bg-gray-900 text-white py-12 border-t border-gray-800">
			<div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-10">
				<div>
					<div className="text-2xl font-bold tracking-tighter mb-4">
						EDGE<span className="text-amber-600">HOMES</span>.
					</div>
					<p className="text-gray-400 text-sm leading-relaxed">{MetaData.description}</p>
				</div>
				<div>
					<h4 className="text-lg font-bold mb-4">Contact Us</h4>
					<div className="space-y-3 text-gray-400 text-sm">
						<div className="flex items-center">
							<Phone className="w-4 h-4 mr-2 text-amber-500" /> {formatPhone(OtherDetails.phone)}
						</div>
						<div className="flex items-center">
							<Mail className="w-4 h-4 mr-2 text-amber-500" /> {Socials.Emails.customerSupport}
						</div>
						<div className="flex items-center">
							<MapPin className="w-4 h-4 mr-2 text-amber-500" /> {OtherDetails.address}
						</div>
					</div>
				</div>
				<div>
					<h4 className="text-lg font-bold mb-4">Admin Access</h4>
					<p className="text-gray-500 text-xs mb-3">Staff login portal for property management.</p>
					<Link
						href={configurations.urls.Admin.SignIn}
						className="text-sm border border-gray-700 px-4 py-2 rounded hover:bg-gray-800 transition">
						Login to Dashboard
					</Link>
				</div>
			</div>
			<div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-gray-800 text-center text-gray-500 text-xs">
				© 2023 EDGEHOMES Real Estate. All rights reserved.
			</div>
		</footer>
	);
}
