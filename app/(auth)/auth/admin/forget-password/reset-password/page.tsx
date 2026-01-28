import { ArrowLeft, Lock, Shield } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ResetPasswordForm } from '@/components/pages/user/auth/reset-password-form';
import { configurations } from '@/config';

export const metadata = {
	title: 'Reset Password — EdgeHomes',
	description: 'Reset your password and regain access to Edge-Homes',
};

export default async function AdminResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
	const { token } = await searchParams;

	if (!token) {
		return <InvalidAdminResetToken />;
	}

	try {
		await fetch(`${configurations.envs.backEndUrl}/otp/validate-reset-token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token }),
		});
	} catch (error) {
		void error;
		return <InvalidAdminResetToken />;
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center p-4">
			<div className="w-full max-w-6xl mx-auto">
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
							Admin Password Reset
							<span className="block text-amber-600">Enhanced Security Protocol</span>
						</h1>

						<p className="text-gray-600 text-lg mb-8">
							Set a new secure password for your EdgeHomes admin account. Follow enhanced security guidelines for admin access.
						</p>

						{/* Admin Security Guidelines */}
						<div className="mb-10 p-6 bg-white rounded-2xl border border-amber-100 shadow-lg">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<Shield className="w-5 h-5 mr-2 text-amber-600" />
								Admin Password Requirements
							</h3>
							<ul className="space-y-3">
								<li className="flex items-start">
									<div className="flex-shrink-0 mt-0.5">
										<div className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs">✓</div>
									</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-gray-900">Minimum 12 characters</p>
										<p className="text-xs text-gray-500">For enhanced admin security</p>
									</div>
								</li>
								<li className="flex items-start">
									<div className="flex-shrink-0 mt-0.5">
										<div className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs">✓</div>
									</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-gray-900">Mix of uppercase, lowercase, numbers, symbols</p>
									</div>
								</li>
								<li className="flex items-start">
									<div className="flex-shrink-0 mt-0.5">
										<div className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs">✓</div>
									</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-gray-900">No common admin passwords</p>
										<p className="text-xs text-gray-500">Avoid 'admin123', 'password', etc.</p>
									</div>
								</li>
								<li className="flex items-start">
									<div className="flex-shrink-0 mt-0.5">
										<div className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xs">✓</div>
									</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-gray-900">Must be unique</p>
										<p className="text-xs text-gray-500">Not used on any other system</p>
									</div>
								</li>
							</ul>
						</div>

						{/* Admin Account Info */}
						<div className="p-6 bg-amber-50 rounded-xl border border-amber-100 mb-8">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
										<Shield className="w-6 h-6 text-white" />
									</div>
								</div>
								<div className="ml-4">
									<p className="text-sm text-gray-900 font-medium">Admin Account Verification</p>
									{/* <p className="text-xs text-gray-600 mt-1">
										Reset authorized for: <span className="font-medium text-amber-700">{email}</span>
									</p> */}
									<p className="text-xs text-gray-500 mt-1">This action is logged in the admin security audit trail.</p>
								</div>
							</div>
						</div>

						{/* Security Note */}
						<div className="p-4 bg-amber-100 border border-amber-200 rounded-lg">
							<div className="flex items-start">
								<Shield className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
								<div>
									<p className="text-sm text-amber-800 font-medium">Security Protocol</p>
									<p className="text-xs text-amber-700 mt-1">All admin password changes require additional verification and are subject to audit.</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Admin Reset Password Form */}
					<div className="w-full max-w-md mx-auto">
						<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
							{/* Header */}
							<div className="bg-gradient-to-r from-gray-900 to-amber-700 p-8 text-center">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 border border-white/30">
									<Shield className="w-8 h-8 text-white" />
								</div>
								<h1 className="text-2xl font-bold text-white mb-2">Admin Password Reset</h1>
								<p className="text-amber-100 text-sm">Set new secure admin password</p>
							</div>

							{/* Form */}
							<div className="p-8">
								<ResetPasswordForm
									isAdmin
									token={token}
								/>

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
					</div>
				</div>
			</div>
		</main>
	);
}

function InvalidAdminResetToken() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-50/50 flex items-center justify-center p-4">
			<div className="w-full max-w-md mx-auto">
				<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center p-8">
					<div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
						<Shield className="w-8 h-8" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Admin Reset Link</h1>
					<p className="text-gray-600 mb-4">This admin password reset link is invalid or has expired.</p>
					<p className="text-sm text-gray-500 mb-6">For security reasons, admin reset links have stricter expiration policies.</p>
					<Link
						href={configurations.urls.Admin.SignIn}
						className="inline-flex items-center justify-center bg-gradient-to-r from-gray-900 to-amber-700 hover:from-gray-800 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
						<ArrowLeft className="w-5 h-5 mr-2" />
						Return to Admin Portal
					</Link>
				</div>
			</div>
		</main>
	);
}
