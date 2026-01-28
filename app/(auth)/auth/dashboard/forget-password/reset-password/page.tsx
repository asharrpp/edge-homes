import { ArrowLeft, Lock, Shield } from 'lucide-react';
import Link from 'next/link';

import { ResetPasswordForm } from '@/components/pages/user/auth/reset-password-form';
import { configurations } from '@/config';

export const metadata = {
	title: 'Reset Password — EdgeHomes',
	description: 'Reset your password and regain access to Edge-Homes',
};

export default async function UserResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
	const { token } = await searchParams;

	if (!token) {
		return <InvalidResetToken />;
	}

	try {
		await fetch(`${configurations.envs.backEndUrl}/otp/validate-reset-token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token }),
		});
	} catch (error) {
		void error;
		return <InvalidResetToken />;
	}

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
								<span className="ml-2 text-sm tracking-tight font-normal bg-amber-100 text-amber-800 px-3 py-1 rounded-full">Password Reset</span>
							</div>
						</div>

						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Set New Password
							<span className="block text-amber-600">Secure Your Account</span>
						</h1>

						<p className="text-gray-600 text-lg mb-8">Create a strong new password to secure your EdgeHomes account. Make sure it's unique and memorable.</p>

						{/* Security Guidelines */}
						<div className="mb-10 p-6 bg-white rounded-2xl border border-amber-100 shadow-sm">
							<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<Shield className="w-5 h-5 mr-2 text-amber-600" />
								Password Requirements
							</h3>
							<ul className="space-y-3">
								<li className="flex items-start">
									<div className="flex-shrink-0 mt-0.5">
										<div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</div>
									</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-gray-900">At least 8 characters</p>
									</div>
								</li>
								<li className="flex items-start">
									<div className="flex-shrink-0 mt-0.5">
										<div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</div>
									</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-gray-900">Mix of letters and numbers</p>
									</div>
								</li>
								<li className="flex items-start">
									<div className="flex-shrink-0 mt-0.5">
										<div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</div>
									</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-gray-900">Include special characters</p>
									</div>
								</li>
								<li className="flex items-start">
									<div className="flex-shrink-0 mt-0.5">
										<div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</div>
									</div>
									<div className="ml-3">
										<p className="text-sm font-medium text-gray-900">Avoid common passwords</p>
									</div>
								</li>
							</ul>
						</div>

						{/* Account Info */}
						<div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-8">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
										<Lock className="w-5 h-5" />
									</div>
								</div>
								<div className="ml-4">
									<p className="text-sm text-gray-900 font-medium">Account Secured</p>
									{/* <p className="text-xs text-gray-600 mt-1">
										Password reset for: <span className="font-medium text-amber-700">{email}</span>
									</p> */}
								</div>
							</div>
						</div>

						{/* Next Steps */}
						<div className="mt-8">
							<p className="text-gray-600 mb-4">After resetting your password:</p>
							<Link
								href={configurations.urls.User.Dashboard}
								className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group">
								Go to your dashboard
								<span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
							</Link>
						</div>
					</div>

					{/* Right Column - Reset Password Form */}
					<div className="w-full max-w-md mx-auto">
						<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
							{/* Header */}
							<div className="bg-gradient-to-r from-gray-900 to-amber-700 p-8 text-center">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
									<Lock className="w-8 h-8 text-white" />
								</div>
								<h1 className="text-2xl font-bold text-white mb-2">Create New Password</h1>
								<p className="text-amber-100 text-sm">Secure your account with a strong password</p>
							</div>

							{/* Form */}
							<div className="p-8">
								<ResetPasswordForm token={token} />

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

						{/* Security Notice */}
						<div className="mt-6 p-6 bg-amber-50 rounded-xl border border-amber-100 text-center">
							<p className="text-sm text-gray-700">
								<Lock className="inline-block w-4 h-4 mr-1 text-amber-600" />
								Your new password will be encrypted and securely stored.
							</p>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}

function InvalidResetToken() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-50/50 flex items-center justify-center p-4">
			<div className="w-full max-w-md mx-auto">
				<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center p-8">
					<div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
						<Lock className="w-8 h-8" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
					<p className="text-gray-600 mb-6">This password reset link is invalid or has expired. Please request a new reset link.</p>
					<Link
						href={configurations.urls.User.SignIn}
						className="inline-flex items-center justify-center bg-gradient-to-r from-gray-900 to-amber-700 hover:from-gray-800 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
						<ArrowLeft className="w-5 h-5 mr-2" />
						Return to Sign In
					</Link>
				</div>
			</div>
		</main>
	);
}
