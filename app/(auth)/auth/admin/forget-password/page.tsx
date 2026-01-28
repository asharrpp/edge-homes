import { ArrowLeft, Key, Lock, Shield } from 'lucide-react';
import Link from 'next/link';

import { ForgotPasswordForm } from '@/components/pages/user/auth/forgot-password-form';
import { configurations } from '@/config';

export default async function AdminForgetPasswordPage() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center p-4">
			<div className="w-full max-w-5xl mx-auto">
				{/* Back to Login Link */}
				<div className="mb-8">
					<Link
						href={configurations.urls.Admin.SignIn}
						className="inline-flex items-center text-amber-700 hover:text-amber-900 transition group">
						<ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
						Back to Admin Portal
					</Link>
				</div>

				<div className="grid md:grid-cols-2 gap-12 items-center">
					{/* Left Column - Branding & Security Info */}
					<div className="text-center md:text-left">
						<div className="mb-8">
							<div className="text-4xl font-bold tracking-tighter text-gray-900 inline-flex items-center">
								EDGE<span className="text-amber-600">HOMES</span>
								<span className="ml-2 text-sm tracking-tight font-normal bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">ADMIN PORTAL</span>
							</div>
						</div>

						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Admin Password Recovery
							<span className="block text-amber-600">Secure Access Restoration</span>
						</h1>

						<p className="text-gray-600 text-lg mb-8">Restore access to your EdgeHomes admin dashboard. Enter your admin email to receive a secure verification code.</p>

						{/* Recovery Process */}
						<div className="p-6 bg-amber-50 rounded-xl border border-amber-100 mb-8">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<Key className="w-5 h-5 mr-2 text-amber-600" />
								Recovery Process
							</h3>
							<ol className="space-y-4">
								<li className="flex items-start">
									<span className="flex-shrink-0 w-6 h-6 bg-white text-amber-600 border border-amber-200 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
										1
									</span>
									<div>
										<p className="font-medium text-gray-900">Enter Admin Email</p>
										<p className="text-sm text-gray-600">Use your registered admin email address</p>
									</div>
								</li>
								<li className="flex items-start">
									<span className="flex-shrink-0 w-6 h-6 bg-white text-amber-600 border border-amber-200 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
										2
									</span>
									<div>
										<p className="font-medium text-gray-900">Verify Identity</p>
										<p className="text-sm text-gray-600">Enter the 6-digit code sent to your email</p>
									</div>
								</li>
								<li className="flex items-start">
									<span className="flex-shrink-0 w-6 h-6 bg-white text-amber-600 border border-amber-200 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
										3
									</span>
									<div>
										<p className="font-medium text-gray-900">Set New Password</p>
										<p className="text-sm text-gray-600">Create a strong, new admin password</p>
									</div>
								</li>
							</ol>
						</div>

						{/* Security Note */}
						<div className="p-4 bg-amber-100 border border-amber-200 rounded-lg">
							<div className="flex items-start">
								<Lock className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
								<div>
									<p className="text-sm text-amber-800 font-medium">Security Notice</p>
									<p className="text-xs text-amber-700 mt-1">For security reasons, verification codes expire in 10 minutes and all activities are monitored.</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Admin Forgot Password Form */}
					<div className="w-full max-w-md mx-auto">
						<div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
							{/* Header */}
							<div className="bg-gradient-to-r from-gray-900 to-amber-700 p-8 text-center">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 border border-white/30">
									<Shield className="w-8 h-8 text-white" />
								</div>
								<h1 className="text-2xl font-bold text-white mb-2">Admin Password Reset</h1>
								<p className="text-amber-100 text-sm">Restore access to admin dashboard</p>
							</div>

							{/* Form */}
							<div className="p-8">
								<ForgotPasswordForm isAdmin />

								<div className="mt-8 pt-8 border-t border-gray-200">
									<div className="text-center">
										<p className="text-sm text-gray-600 mb-4">Remember your password?</p>
										<Link
											href={configurations.urls.Admin.SignIn}
											className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group transition">
											<ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
											Return to Admin Login
										</Link>
									</div>
								</div>
							</div>
						</div>

						{/* Security Logging Notice */}
						<div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
							<p className="text-xs text-gray-500">
								<Shield className="inline-block w-3 h-3 mr-1 text-amber-500" />
								This action is logged in the admin security audit trail.
							</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
