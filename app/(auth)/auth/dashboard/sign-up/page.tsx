import { Award, Building, CheckCircle, Shield, Star } from 'lucide-react';
import Link from 'next/link';

import { UserSignUpForm } from '@/components/pages/user/auth/sign-up-form';
import { configurations } from '@/config';

export default async function UserSignUpPage() {
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
								<span className="ml-2 text-sm tracking-tight font-normal bg-amber-100 text-amber-800 px-3 py-1 rounded-full">User</span>
							</div>
						</div>

						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Join the Luxury
							<span className="block text-amber-600">Living Experience</span>
						</h1>

						<p className="text-gray-600 text-lg mb-8">Create your account to access premium properties, exclusive deals, and personalized booking management</p>

						{/* Features List */}
						<div className="space-y-6 mb-8">
							<div className="space-y-4">
								<div className="flex items-start">
									<div className="flex-shrink-0 mt-1">
										<div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
											<Building className="w-4 h-4" />
										</div>
									</div>
									<div className="ml-3">
										<p className="text-gray-800 font-medium">Exclusive Property Access</p>
										<p className="text-gray-600 text-sm">Browse and book premium properties not available elsewhere</p>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex-shrink-0 mt-1">
										<div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
											<Shield className="w-4 h-4" />
										</div>
									</div>
									<div className="ml-3">
										<p className="text-gray-800 font-medium">Secure Account</p>
										<p className="text-gray-600 text-sm">Bank-level security for your personal and payment information</p>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex-shrink-0 mt-1">
										<div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
											<Award className="w-4 h-4" />
										</div>
									</div>
									<div className="ml-3">
										<p className="text-gray-800 font-medium">Member Benefits</p>
										<p className="text-gray-600 text-sm">Early access to deals and personalized recommendations</p>
									</div>
								</div>

								<div className="flex items-start">
									<div className="flex-shrink-0 mt-1">
										<div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
											<CheckCircle className="w-4 h-4" />
										</div>
									</div>
									<div className="ml-3">
										<p className="text-gray-800 font-medium">Easy Booking Management</p>
										<p className="text-gray-600 text-sm">Track and manage all your bookings in one place</p>
									</div>
								</div>
							</div>
						</div>

						{/* Security Note */}
						<div className="mt-8 p-6 bg-white rounded-xl border border-amber-100 shadow-sm">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
										<Star
											className="w-6 h-6 text-white"
											fill="white"
										/>
									</div>
								</div>
								<div className="ml-4">
									<p className="text-sm text-gray-600">
										<strong className="font-medium text-gray-900">Join 10,000+ Members</strong> who trust EdgeHomes for luxury stays
									</p>
									<div className="flex items-center mt-1">
										{[1, 2, 3, 4, 5].map((star) => (
											<Star
												key={star}
												className="w-4 h-4 text-amber-400"
												fill="currentColor"
											/>
										))}
										<span className="ml-2 text-xs text-gray-500">4.8/5 average rating</span>
									</div>
								</div>
							</div>
						</div>

						{/* Existing User CTA */}
						<div className="mt-8">
							<p className="text-gray-600 mb-4">Already have an account? Welcome back!</p>
							<Link
								href={configurations.urls.User.SignIn}
								className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group">
								Sign in to your account
								<span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
							</Link>
						</div>
					</div>

					{/* Right Column - Sign Up Form */}
					<div>
						<UserSignUpForm />
					</div>
				</div>
			</div>
		</main>
	);
}
