import { ArrowLeft, Award, Key, Lock, Mail, Shield, Star } from 'lucide-react';
import Link from 'next/link';

import { ForgotPasswordForm } from '@/components/pages/user/auth/forgot-password-form';
import { configurations } from '@/config';

export default async function UserForgetPasswordPage() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center p-4">
			<div className="w-full max-w-6xl mx-auto">
				{/* Back to Login Link */}
				<div className="mb-8 text-center">
					<Link
						href={configurations.urls.User.SignIn}
						className="inline-flex items-center text-amber-700 hover:text-amber-900 transition group">
						<ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
						Back to Sign In
					</Link>
				</div>

				<div className="grid md:grid-cols-2 gap-12 items-center">
					{/* Left Column - Branding & Info */}
					<div className="text-center md:text-left">
						<div className="mb-6">
							<div className="text-4xl font-bold tracking-tighter text-gray-900 inline-flex items-center">
								EDGE<span className="text-amber-600">HOMES</span>
								<span className="ml-2 text-sm tracking-tight font-normal bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Password Recovery</span>
							</div>
						</div>

						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Reset Your Password
							<span className="block text-amber-600">Regain Access to Your Account</span>
						</h1>

						<p className="text-gray-600 text-lg mb-8">Enter your email address and we'll send you a verification code to reset your password.</p>

						{/* Recovery Steps */}
						<div className="mb-10 p-6 bg-white rounded-2xl border border-amber-100 shadow-sm">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<Key className="w-5 h-5 mr-2 text-amber-600" />
								How it Works
							</h3>
							<ol className="space-y-4">
								<li className="flex items-start">
									<span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
										1
									</span>
									<div>
										<p className="font-medium text-gray-800">Enter your email</p>
										<p className="text-sm text-gray-600">The one associated with your EdgeHomes account</p>
									</div>
								</li>
								<li className="flex items-start">
									<span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
										2
									</span>
									<div>
										<p className="font-medium text-gray-800">Check your inbox</p>
										<p className="text-sm text-gray-600">We'll send a 6-digit verification code</p>
									</div>
								</li>
								<li className="flex items-start">
									<span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
										3
									</span>
									<div>
										<p className="font-medium text-gray-800">Reset password</p>
										<p className="text-sm text-gray-600">Enter the code and create a new password</p>
									</div>
								</li>
							</ol>
						</div>

						{/* Security Assurance */}
						<div className="space-y-4 mb-8">
							<div className="flex items-start">
								<div className="flex-shrink-0 mt-1">
									<div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
										<Shield className="w-4 h-4" />
									</div>
								</div>
								<div className="ml-3">
									<p className="text-gray-800 font-medium">100% Secure Process</p>
									<p className="text-gray-600 text-sm">Your information is encrypted and protected</p>
								</div>
							</div>

							<div className="flex items-start">
								<div className="flex-shrink-0 mt-1">
									<div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
										<Lock className="w-4 h-4" />
									</div>
								</div>
								<div className="ml-3">
									<p className="text-gray-800 font-medium">Instant Delivery</p>
									<p className="text-gray-600 text-sm">Verification codes arrive within seconds</p>
								</div>
							</div>

							<div className="flex items-start">
								<div className="flex-shrink-0 mt-1">
									<div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
										<Award className="w-4 h-4" />
									</div>
								</div>
								<div className="ml-3">
									<p className="text-gray-800 font-medium">24/7 Support</p>
									<p className="text-gray-600 text-sm">Need help? Our team is always available</p>
								</div>
							</div>
						</div>

						{/* Trust Indicator */}
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
										<strong className="font-medium text-gray-900">Trusted by 10,000+ Guests</strong>
									</p>
									<div className="flex items-center mt-1">
										{[1, 2, 3, 4, 5].map((star) => (
											<Star
												key={star}
												className="w-4 h-4 text-amber-400"
												fill="currentColor"
											/>
										))}
										<span className="ml-2 text-xs text-gray-500">Rated 4.8/5 for security</span>
									</div>
								</div>
							</div>
						</div>

						{/* Additional Help */}
						<div className="mt-8">
							<p className="text-gray-600 mb-4">Don't have an account yet?</p>
							<Link
								href={configurations.urls.User.SignUp}
								className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group">
								Create an account
								<span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
							</Link>
						</div>
					</div>

					{/* Right Column - Forgot Password Form */}
					<div className="w-full max-w-md mx-auto">
						<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
							{/* Header */}
							<div className="bg-gradient-to-r from-gray-900 to-amber-700 p-8 text-center">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
									<Mail className="w-8 h-8 text-white" />
								</div>
								<h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
								<p className="text-amber-100 text-sm">Enter your email to get started</p>
							</div>

							{/* Form */}
							<div className="p-8">
								<ForgotPasswordForm />

								<div className="mt-8 pt-8 border-t border-gray-200">
									<div className="text-center">
										<p className="text-sm text-gray-600 mb-4">Remember your password?</p>
										<Link
											href={configurations.urls.User.SignIn}
											className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group">
											<ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
											Back to Sign In
										</Link>
									</div>
								</div>
							</div>
						</div>

						{/* Support Section */}
						{/* <div className="mt-6 p-6 bg-amber-50 rounded-xl border border-amber-100 text-center">
							<p className="text-sm text-gray-700 mb-2">
								<strong className="font-medium text-amber-800">Need immediate assistance?</strong>
							</p>
							<p className="text-sm text-gray-600">
								Call us at{' '}
								<a
									href="tel:+2348001234567"
									className="text-amber-600 hover:text-amber-700 font-medium">
									+234 800 123 4567
								</a>{' '}
								or{' '}
								<Link
									href="/contact"
									className="text-amber-600 hover:text-amber-700 font-medium underline">
									contact support
								</Link>
							</p>
						</div> */}

						{/* Security Notice */}
						<div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
							<p className="text-xs text-gray-500">
								<Lock className="inline-block w-3 h-3 mr-1" />
								All password resets are logged for security purposes.
							</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
