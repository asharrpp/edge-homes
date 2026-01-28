import Link from 'next/link';

import { AdminLoginForm } from '@/components/pages/admin/auth/login-form/index.';
import { configurations } from '@/config';

export default async function AdminSignInPage() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center p-4">
			<div className="w-full max-w-6xl mx-auto">
				{/* Back to Home Link */}
				<div className="mb-8 text-center">
					<Link
						href={configurations.urls.Home}
						className="inline-flex items-center text-gray-600 hover:text-gray-900 transition">
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						Back to Edge Homes
					</Link>
				</div>

				<div className="grid md:grid-cols-2 gap-12 items-center">
					{/* Left Column - Branding & Info */}
					<div className="text-center md:text-left">
						<div className="mb-6">
							<div className="text-4xl font-bold tracking-tighter text-gray-900 inline-flex items-center">
								EDGE<span className="text-amber-600">HOMES</span>
								<span className="ml-2 text-sm tracking-tight font-normal bg-amber-100 text-amber-800 px-3 py-1 rounded-full">ADMIN</span>
							</div>
						</div>

						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Manage Your Properties
							<span className="block text-amber-600">From One Dashboard</span>
						</h1>

						<p className="text-gray-600 text-lg mb-8">
							Access the complete management system for Edge Homes properties. Handle bookings, manage listings, and oversee operations.
						</p>

						{/* Features List */}
						<div className="space-y-4">
							<div className="flex items-start">
								<div className="flex-shrink-0 mt-1">
									<div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
										<svg
											className="w-4 h-4"
											fill="currentColor"
											viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								</div>
								<div className="ml-3">
									<p className="text-gray-800 font-medium">Property Management</p>
									<p className="text-gray-600 text-sm">Add, edit, and remove listings</p>
								</div>
							</div>

							<div className="flex items-start">
								<div className="flex-shrink-0 mt-1">
									<div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
										<svg
											className="w-4 h-4"
											fill="currentColor"
											viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								</div>
								<div className="ml-3">
									<p className="text-gray-800 font-medium">Booking Management</p>
									<p className="text-gray-600 text-sm">Approve, cancel, and track bookings</p>
								</div>
							</div>

							<div className="flex items-start">
								<div className="flex-shrink-0 mt-1">
									<div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
										<svg
											className="w-4 h-4"
											fill="currentColor"
											viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								</div>
								<div className="ml-3">
									<p className="text-gray-800 font-medium">Analytics & Reports</p>
									<p className="text-gray-600 text-sm">View performance metrics and insights</p>
								</div>
							</div>
						</div>

						{/* Security Note */}
						<div className="mt-12 p-4 bg-gray-50 rounded-lg border border-gray-200">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg
										className="w-5 h-5 text-gray-400"
										fill="currentColor"
										viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm text-gray-600">
										<strong className="font-medium">Secure Access:</strong> All activities are logged and monitored.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Login Form */}
					<div>
						<AdminLoginForm />
					</div>
				</div>
			</div>
		</main>
	);
}
