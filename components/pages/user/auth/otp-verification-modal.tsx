'use client';

import { Loader2, Shield, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface OtpVerificationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onVerify: (otp: string) => Promise<void>;
	onResend: () => Promise<void>;
	email?: string;
}

export function OtpVerificationModal({ open, onOpenChange, onVerify, onResend, email }: OtpVerificationModalProps) {
	const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
	const [loading, setLoading] = useState(false);
	const [resendTimer, setResendTimer] = useState(0);
	const [resending, setResending] = useState(false);
	const inputsRef = useRef<HTMLInputElement[]>([]);

	async function handleChange(index: number, value: string) {
		if (!/^\d?$/.test(value)) return; // allow only digits
		const newOtp = [...otpValues];
		newOtp[index] = value;
		setOtpValues(newOtp);

		// move forward only if valid digit
		if (/^\d$/.test(value) && index < 5) {
			inputsRef.current[index + 1]?.focus();
		}

		if (value && index === 5 && newOtp.every((v) => v !== '') && !loading) {
			await handleSubmit(newOtp.join(''));
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
		if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
			inputsRef.current[index - 1]?.focus();
		}
	}

	async function handleSubmit(forcedOtp?: string) {
		const otp = forcedOtp ?? otpValues.join('');
		if (otp.length < 6) {
			toast.error('Please enter the full 6-digit code');
			return;
		}
		try {
			setLoading(true);
			await onVerify(otp);
			toast.success('Code verified successfully');
			onOpenChange(false);
		} catch (err: any) {
			toast.error(err.message || 'Invalid or expired code');
		} finally {
			setLoading(false);
		}
	}

	async function handleResend() {
		try {
			setResending(true);
			setResendTimer(30);
			await onResend();
			toast.success('A new code has been sent to your email');
		} catch (err: any) {
			toast.error(err.message || 'Failed to resend code');
			setResendTimer(0);
		} finally {
			setResending(false);
		}
	}

	// Countdown timer for resend
	useEffect(() => {
		if (resendTimer <= 0) return;
		const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
		return () => clearInterval(interval);
	}, [resendTimer]);

	// Reset modal inputs each time it opens
	useEffect(() => {
		if (open) {
			setOtpValues(Array(6).fill(''));
			setTimeout(() => inputsRef.current[0]?.focus(), 100);
			setResendTimer(0);
		}
	}, [open]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
				onClick={() => onOpenChange(false)}
			/>

			{/* Modal */}
			<div className="flex min-h-full items-center justify-center p-4">
				<div className="relative w-full max-w-md">
					{/* Modal Content */}
					<div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
						{/* Header */}
						<div className="bg-gradient-to-r from-gray-900 to-amber-700 p-6 text-white">
							<div className="flex items-center justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
										<Shield className="w-5 h-5" />
									</div>
									<div>
										<h2 className="text-xl font-bold">Verify Your Email</h2>
										<p className="text-amber-100 text-sm">
											{email ? (
												<>
													Code sent to <strong>{email}</strong>
												</>
											) : (
												'Enter the 6-digit code sent to your email'
											)}
										</p>
									</div>
								</div>
								<button
									onClick={() => onOpenChange(false)}
									className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
									<X className="w-5 h-5" />
								</button>
							</div>

							{/* Timer Indicator */}
							<div className="mt-4">
								<div className="flex justify-between text-sm text-amber-100 mb-1">
									<span>Code expires in:</span>
									<span className="font-medium">10:00</span>
								</div>
								<div className="w-full bg-white/20 rounded-full h-1">
									<div
										className="bg-white h-1 rounded-full transition-all duration-1000"
										style={{ width: '100%' }}
									/>
								</div>
							</div>
						</div>

						{/* Content */}
						<div className="p-8">
							<div className="text-center mb-6">
								<p className="text-gray-600 mb-6">Enter the 6-digit verification code we sent to your email address.</p>

								{/* OTP Input Fields */}
								<div className="flex justify-center gap-3 mb-8">
									{otpValues.map((value, index) => (
										<input
											key={index}
											ref={(el) => {
												if (el) inputsRef.current[index] = el;
											}}
											type="text"
											inputMode="numeric"
											maxLength={1}
											value={value}
											onChange={(e) => handleChange(index, e.target.value)}
											onKeyDown={(e) => handleKeyDown(e, index)}
											className="w-14 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-amber-500 focus:outline-none transition"
											disabled={loading}
										/>
									))}
								</div>

								{/* Verify Button */}
								<button
									onClick={() => handleSubmit()}
									disabled={loading || otpValues.some((v) => !v)}
									className="w-full bg-gradient-to-r from-gray-900 to-amber-700 hover:from-gray-800 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mb-6">
									{loading ? (
										<>
											<Loader2 className="w-5 h-5 mr-2 animate-spin" />
											Verifying...
										</>
									) : (
										'Verify Code'
									)}
								</button>

								{/* Resend Code */}
								<div className="text-center">
									<p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
									<button
										onClick={handleResend}
										disabled={resendTimer > 0 || resending}
										className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed">
										{resending ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin" />
												Sending...
											</>
										) : resendTimer > 0 ? (
											`Resend in ${resendTimer}s`
										) : (
											'Send new code'
										)}
									</button>
								</div>
							</div>

							{/* Help Text */}
							<div className="mt-8 pt-6 border-t border-gray-200">
								<div className="flex items-start gap-3">
									<div className="flex-shrink-0">
										<div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
											<Shield className="w-4 h-4" />
										</div>
									</div>
									<div className="text-left">
										<p className="text-sm font-medium text-gray-900">Keep this window open</p>
										<p className="text-xs text-gray-600 mt-1">Stay on this page while checking your email. The code will expire in 10 minutes for security.</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
