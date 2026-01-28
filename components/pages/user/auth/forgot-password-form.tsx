'use client';

import { AlertCircle, CheckCircle, Loader2, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { configurations } from '@/config';

import { OtpVerificationModal } from './otp-verification-modal';

interface ForgotPasswordFormProps {
	isAdmin?: true;
}

export function ForgotPasswordForm({ isAdmin }: ForgotPasswordFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [errors, setErrors] = useState<string[]>([]);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState('');
	const [showOtpModal, setShowOtpModal] = useState(false);

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email) return 'Email is required';
		if (!emailRegex.test(email)) return 'Please enter a valid email address';
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors([]);

		const validationError = validateEmail(email);
		if (validationError) {
			setErrors([validationError]);
			return;
		}

		setIsLoading(true);

		try {
			const { backEndUrl } = configurations.envs;

			// Call your backend forgot password endpoint
			const response = await fetch(`${backEndUrl}/auth/forgot-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to send reset code');
			}

			// Success
			setSubmittedEmail(email);
			setIsSubmitted(true);
			setShowOtpModal(true);
			toast.success(data.message || 'Reset code sent! Check your email.');
		} catch (error: any) {
			void error;
			// Handle different error cases
			let errorMessage = error.message || 'Something went wrong. Please try again.';

			if (errorMessage.toLowerCase().includes('user not found')) {
				errorMessage = 'No account found with this email address.';
			} else if (errorMessage.toLowerCase().includes('email')) {
				errorMessage = 'Please check the email address and try again.';
			}

			setErrors([errorMessage]);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendCode = async () => {
		setIsLoading(true);
		setErrors([]);

		try {
			const { backEndUrl } = configurations.envs;

			// const response = await fetch(`${backEndUrl}/auth/forgot-password`, {
			// 	method: 'POST',
			// 	headers: { 'Content-Type': 'application/json' },
			// 	body: JSON.stringify({ email: submittedEmail }),
			// });

			// const data = await response.json();

			// if (!response.ok) {
			// 	throw new Error(data.message || 'Failed to resend code');
			// }

			toast.success('New code sent! Check your email again.');
		} catch (error: any) {
			setErrors([error.message || 'Failed to resend code']);
			toast.error(error.message || 'Failed to resend code');
		} finally {
			setIsLoading(false);
		}
	};

	async function handleVerifyOtp(otp: string) {
		try {
			const request = await fetch(`${configurations.envs.backEndUrl}/otp/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, code: otp }),
			});
			if (!request.ok) {
				throw new Error('OTP verification failed');
			}
			const data = await request.json();

			if (isAdmin) {
				router.push(`${configurations.urls.Public.AdminResetPassword}?token=${data.reset_token}`);
			} else {
				router.push(`${configurations.urls.Public.UserResetPassword}?token=${data.reset_token}`);
			}
			toast.success(data.message);
			setShowOtpModal(false);
		} catch (error: any) {
			toast.error(error.message);
		}
	}

	const handleResendOtp = async () => {
		setErrors([]);

		const validationError = validateEmail(email);
		if (validationError) {
			setErrors([validationError]);
			return;
		}

		setIsLoading(true);

		try {
			const { backEndUrl } = configurations.envs;

			// Call your backend forgot password endpoint
			const response = await fetch(`${backEndUrl}/auth/forgot-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to send reset code');
			}

			// Success
			setSubmittedEmail(email);
			setIsSubmitted(true);
			setShowOtpModal(true);
			toast.success(data.message || 'Reset code sent! Check your email.');

			// Reset form
			setEmail('');
		} catch (error: any) {
			// Handle different error cases
			let errorMessage = error.message || 'Something went wrong. Please try again.';

			if (errorMessage.toLowerCase().includes('user not found')) {
				errorMessage = 'No account found with this email address.';
			} else if (errorMessage.toLowerCase().includes('email')) {
				errorMessage = 'Please check the email address and try again.';
			}

			setErrors([errorMessage]);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	// Success State
	if (isSubmitted) {
		return (
			<div className="text-center">
				<div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
					<CheckCircle className="w-8 h-8" />
				</div>

				<h3 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h3>

				<p className="text-gray-600 mb-6">
					We've sent a 6-digit verification code to <strong className="text-amber-700">{submittedEmail}</strong>.
				</p>

				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
					<div className="flex items-start">
						<AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
						<div className="text-left">
							<p className="text-sm text-blue-800 font-medium mb-1">Code Expires in 10 Minutes</p>
							<p className="text-xs text-blue-700">For security reasons, the verification code will expire in 10 minutes.</p>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<button
						onClick={() => setShowOtpModal(true)}
						className="w-full bg-gradient-to-r from-gray-900 to-amber-700 hover:from-gray-800 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center">
						Enter Verification Code
					</button>

					<button
						onClick={handleResendCode}
						disabled={isLoading}
						className="w-full border-2 border-amber-200 text-amber-600 hover:bg-amber-50 font-medium py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:opacity-50">
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Resending...
							</>
						) : (
							'Resend Code'
						)}
					</button>
				</div>

				<p className="text-sm text-gray-500 mt-6">Didn't receive the email? Check your spam folder or try resending.</p>

				<OtpVerificationModal
					open={showOtpModal}
					onOpenChange={setShowOtpModal}
					onVerify={handleVerifyOtp}
					onResend={handleResendOtp}
					email={submittedEmail}
				/>
			</div>
		);
	}

	// Form State
	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6">
			<div>
				<label
					htmlFor="email"
					className="block text-sm font-medium text-gray-700 mb-2">
					Email Address
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Mail className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="email"
						name="email"
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email address"
						className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-amber-500 placeholder-gray-400"
						disabled={isLoading}
					/>
				</div>
				<p className="mt-2 text-sm text-gray-500">Enter the email address associated with your EdgeHomes account.</p>
			</div>

			{errors.length > 0 && (
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
					<ul className="space-y-2">
						{errors.map((error, index) => (
							<li
								key={index}
								className="text-red-600 text-sm flex items-start">
								<AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
								{error}
							</li>
						))}
					</ul>
				</div>
			)}

			<button
				type="submit"
				disabled={isLoading}
				className="w-full bg-gradient-to-r from-gray-900 to-amber-700 hover:from-gray-800 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
				{isLoading ? (
					<>
						<Loader2 className="w-5 h-5 mr-2 animate-spin" />
						Sending Code...
					</>
				) : (
					<>
						<Mail className="w-5 h-5 mr-2" />
						Send Reset Code
					</>
				)}
			</button>

			<div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
				<div className="flex items-start">
					<div className="flex-shrink-0">
						<AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
					</div>
					<div className="ml-3">
						<h4 className="text-sm font-medium text-amber-800">What happens next?</h4>
						<p className="text-xs text-amber-700 mt-1">
							You'll receive a 6-digit verification code via email. Use it to reset your password. The code expires in 10 minutes.
						</p>
					</div>
				</div>
			</div>
		</form>
	);
}
