// app/user/subscription/verify-payment/page.tsx
import { AlertCircle, ArrowLeft, Building, CheckCircle, Clock, CreditCard, Home, Loader2, Receipt, RefreshCw, Shield, XCircle } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { TransactionStatus, TransactionType } from '@/lib/enums';
import { PaymentVerificationResponse, VerificationResult } from '@/lib/types';

// Helper function to verify payment
async function verifyPayment(reference: string, accessToken: string): Promise<VerificationResult> {
	const { backEndUrl } = configurations.envs;

	try {
		const response = await fetch(`${backEndUrl}/payments/booking/verify/${reference}`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			cache: 'no-store',
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			return {
				success: false,
				message: errorData.message || `Payment verification failed: ${response.status}`,
				error: errorData.error,
			};
		}
		// console.log(response);

		const data: PaymentVerificationResponse = await response.json();

		return {
			success: true,
			message: 'Verification successful',
			data,
		};
	} catch (error) {
		console.log((error as Error).message);

		return {
			success: false,
			message: 'Failed to verify payment. Please try again.',
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
}

export default async function VerifyBookingPaymentPage({ searchParams }: { searchParams: Promise<{ trxref?: string; reference?: string }> }) {
	const params = await searchParams;
	const trxref = params.trxref;
	const reference = params.reference || trxref;

	const session = await getSession(USER_COOKIE_NAME);

	// Redirect if no session
	if (!session) {
		redirect(configurations.urls.User.SignIn);
	}

	const accessToken = await getCookie(USER_COOKIE_NAME);

	if (!accessToken?.value) {
		redirect(configurations.urls.User.SignIn);
	}

	// Redirect if no reference
	if (!reference) {
		redirect(configurations.urls.User.Properties);
	}

	// Verify payment
	const verificationResult = await verifyPayment(reference, accessToken.value);
	// console.log(verificationResult);

	// Determine status for UI
	const payment = verificationResult.data;
	const isSuccess = verificationResult.success && payment?.status === TransactionStatus.SUCCESS;
	const isPending = verificationResult.success && payment?.status === TransactionStatus.PENDING;

	// Get status display text
	const getStatusDisplay = () => {
		if (isSuccess) return { text: TransactionStatus.SUCCESS, color: 'text-green-600', bg: 'bg-green-100' };
		if (isPending) return { text: TransactionStatus.PENDING, color: 'text-amber-600', bg: 'bg-amber-100' };
		return { text: TransactionStatus.FAILED, color: 'text-red-600', bg: 'bg-red-100' };
	};

	const statusDisplay = getStatusDisplay();

	return (
		<main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
			<div className="max-w-md w-full">
				{/* Header */}
				<div className="text-center mb-8">
					<Link
						href={configurations.urls.User.Properties}
						className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Properties
					</Link>

					<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 flex items-center justify-center">
						<CreditCard className="w-8 h-8 text-amber-600" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification</h1>
					<p className="text-gray-600">
						Reference: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{reference}</span>
					</p>
				</div>

				{/* Main Card */}
				<div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
					{/* Status Indicator */}
					<div className="text-center mb-8">
						{isSuccess ? (
							<div className="space-y-4">
								<div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center">
									<CheckCircle className="w-10 h-10 text-green-600" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
									<p className="text-gray-600">Your payment has been verified and processed successfully.</p>
								</div>
							</div>
						) : isPending ? (
							<div className="space-y-4">
								<div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
									<Clock className="w-10 h-10 text-blue-600" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-gray-900 mb-2">Payment Processing</h2>
									<p className="text-gray-600">Your payment is being processed. This may take a few moments.</p>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-red-100 to-rose-100 flex items-center justify-center">
									<XCircle className="w-10 h-10 text-red-600" />
								</div>
								<div>
									<h2 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h2>
									<p className="text-gray-600">{verificationResult.message || 'We were unable to verify your payment.'}</p>
								</div>
							</div>
						)}
					</div>

					{/* Payment Details */}
					{payment && (
						<div className="bg-gray-50 rounded-xl p-5 mb-6">
							<h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
								<Receipt className="w-5 h-5" />
								Transaction Details
							</h3>
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Amount</span>
									<span className="font-bold text-gray-900">₦{payment.amount.toLocaleString()}</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600">Type</span>
									<span className="font-medium text-gray-900">{payment.type === TransactionType.CREDIT_PURCHASE ? 'Credit Purchase' : 'Property Booking'}</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600">Status</span>
									<span className={`font-bold ${statusDisplay.color} ${statusDisplay.bg} px-3 py-1 rounded-full text-sm`}>{statusDisplay.text}</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600">Date</span>
									<span className="font-medium text-gray-900">
										{new Date(payment.createdAt).toLocaleDateString('en-NG', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600">Reference</span>
									<span className="font-mono text-sm text-gray-700 truncate max-w-[180px]">{payment.paymentReference}</span>
								</div>
							</div>
						</div>
					)}

					{/* User Credits Update - Only show on success */}
					{isSuccess && (
						<div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mb-6">
							<h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
								<Shield className="w-5 h-5 text-amber-600" />
								Account Updated
							</h3>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Building className="w-5 h-5 text-gray-600" />
										<span className="text-gray-700">Property Booked</span>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="space-y-3">
						{isSuccess ? (
							<>
								<Link
									href={configurations.urls.User.Bookings}
									className="block w-full bg-amber-600 hover:bg-amber-700 text-white text-center py-3 rounded-lg font-medium transition">
									Browse My Booking
								</Link>
								<Link
									href={configurations.urls.User.Properties}
									className="block w-full border border-amber-200 text-amber-700 hover:bg-amber-50 text-center py-3 rounded-lg font-medium transition">
									Back to Properties
								</Link>
							</>
						) : isPending ? (
							<>
								<div className="text-center py-4">
									<div className="flex items-center justify-center gap-2 text-amber-600 mb-4">
										<Loader2 className="w-5 h-5 animate-spin" />
										<span>Payment is being processed...</span>
									</div>
									<p className="text-sm text-gray-500 mb-4">This page will automatically refresh in 5 seconds</p>
									<Link
										href={`${configurations.urls.User.VerifyBookingPayment}?reference=${reference}`}
										className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium">
										<RefreshCw className="w-4 h-4" />
										Refresh Now
									</Link>
								</div>
							</>
						) : (
							<>
								<Link
									href={`${configurations.urls.User.VerifyBookingPayment}?reference=${reference}`}
									className="block w-full bg-amber-600 hover:bg-amber-700 text-white text-center py-3 rounded-lg font-medium transition">
									Try Again
								</Link>
								<Link
									href={configurations.urls.User.Support}
									className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-center py-3 rounded-lg font-medium transition flex items-center justify-center">
									<AlertCircle className="w-4 h-4 mr-2" />
									Contact Support
								</Link>
							</>
						)}
					</div>
				</div>

				{/* Help Section */}
				<div className="mt-6 text-center">
					<p className="text-sm text-gray-500">
						Need help?{' '}
						<Link
							href={configurations.urls.User.Help}
							className="text-amber-600 hover:text-amber-700 font-medium">
							Visit our help center
						</Link>
					</p>
				</div>
			</div>

			{/* Auto-refresh meta tag for pending payments */}
			{isPending && (
				<>
					<meta
						httpEquiv="refresh"
						content="5"
					/>
					<script
						dangerouslySetInnerHTML={{
							__html: `
                console.log('Payment verification page auto-refreshing in 5 seconds...');
              `,
						}}
					/>
				</>
			)}
		</main>
	);
}
