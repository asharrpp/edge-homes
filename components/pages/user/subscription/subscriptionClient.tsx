'use client';

import { AlertCircle, Building, CheckCircle, Clock, CreditCard, Crown, DollarSign, Info, RefreshCw, X, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { TransactionType } from '@/lib/enums';

import type { FetchSubscriptionResponse } from '@/lib/types';
interface SubscriptionClientProps {
	subscriptionData: FetchSubscriptionResponse | null;
	userId: string;
	error: string | null;
}

export default function SubscriptionClient({ subscriptionData, userId, error }: SubscriptionClientProps) {
	const { push, refresh } = useRouter();
	const [selectedCredits, setSelectedCredits] = useState<number | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [showUnlimitedModal, setShowUnlimitedModal] = useState(false);

	if (error) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
					<h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
					<p className="text-gray-600 mb-4">{error}</p>
					<button onClick={() => window.location.reload()}>Try Again</button>
				</div>
			</div>
		);
	}

	if (!subscriptionData) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-gray-200 rounded w-48"></div>
					<div className="h-4 bg-gray-200 rounded w-64"></div>
				</div>
			</div>
		);
	}

	const { userProfile, stats, properties, recentTransactions, creditOptions, unlimitedOption } = subscriptionData;

	// Filter credit options based on user's current credits
	const availableCreditOptions = creditOptions.filter((option) => option.credits > (userProfile.credits || 0));

	const handleCreditPurchase = async (credits: number, price: number) => {
		if (isProcessing) return;

		setIsProcessing(true);
		try {
			const { backEndUrl } = configurations.envs;
			const accessToken = await getCookie(USER_COOKIE_NAME);

			if (!accessToken) {
				push(`${configurations.urls.User.SignIn}?redirect=${encodeURIComponent(configurations.urls.User.Subscription)}`);
				return;
			}

			const headers = {
				'Authorization': `Bearer ${accessToken.value}`,
				'Content-Type': 'application/json',
			};

			// Initialize payment with backend
			const response = await fetch(`${backEndUrl}/payments/credit/initialize`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					type: TransactionType.CREDIT_PURCHASE,
					creditCount: credits,
					amount: price,
				}),
			});

			const data = await response.json();

			if (data.authorization_url) {
				// Redirect to payment gateway
				window.location.href = data.authorization_url;
			} else {
				throw new Error('Payment initialization failed');
			}
		} catch (error) {
			void error;
			toast.error('Failed to initialize payment. Please try again.');
		} finally {
			setIsProcessing(false);
		}
	};

	const handleUnlimitedPurchase = async () => {
		if (isProcessing) return;

		setIsProcessing(true);
		try {
			const accessToken = await getCookie(USER_COOKIE_NAME);

			if (!accessToken) {
				push(`${configurations.urls.User.SignIn}?redirect=${encodeURIComponent(configurations.urls.User.Subscription)}`);
				return;
			}

			const headers = {
				'Authorization': `Bearer ${accessToken.value}`,
				'Content-Type': 'application/json',
			};

			const response = await fetch(`${configurations.envs.backEndUrl}/payments/initialize`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					creditCount: 1,
					type: TransactionType.UNLIMITED_YEARLY,
					amount: unlimitedOption.price,
				}),
			});

			const data = await response.json();

			if (data.authorizationUrl) {
				window.location.href = data.authorizationUrl;
			} else {
				throw new Error('Payment initialization failed');
			}
		} catch (error) {
			void error;
			toast.error('Failed to initialize payment. Please try again.');
		} finally {
			setIsProcessing(false);
		}
	};

	const handlePropertySubscriptionRenewal = async (propertyId: string) => {
		if (isProcessing) return;
		setIsProcessing(true);

		try {
			const accessToken = await getCookie(USER_COOKIE_NAME);
			if (!accessToken) {
				push(`${configurations.urls.User.SignIn}?redirect=${encodeURIComponent(configurations.urls.User.Subscription)}`);
				return;
			}

			const response = await fetch(`${configurations.envs.backEndUrl}/property/${propertyId}/renew`, {
				method: 'POST', // Match the @Post decorator in your backend
				headers: {
					'Authorization': `Bearer ${accessToken.value}`,
					'Content-Type': 'application/json',
				},
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Renewal failed');
			}

			toast.success('Property subscription renewed successfully!');

			// Refresh the page to get updated stats and property list
			refresh();
		} catch (error: any) {
			toast.error(error.message || 'Failed to renew subscription. Ensure you have enough credits.');
		} finally {
			setIsProcessing(false);
		}
	};
	return (
		<main className="space-y-8">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Subscription & Billing</h1>
					<p className="text-gray-600 mt-2">Manage your property listing credits and subscription plans</p>
				</div>
				<div className="mt-4 md:mt-0">
					<div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
						<Zap className="w-5 h-5 text-amber-600" />
						<span className="font-bold text-amber-700">
							{userProfile.credits} Credit{userProfile.credits !== 1 ? 's' : ''} Available
						</span>
					</div>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Total Properties</p>
							<p className="text-2xl font-bold mt-1 text-gray-400">{stats.totalProperties}</p>
						</div>
						<div className="bg-blue-100 p-3 rounded-lg">
							<Building className="w-6 h-6 text-blue-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">All properties listed</p>
				</div>

				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Active Listings</p>
							<p className="text-2xl font-bold mt-1 text-gray-400">{stats.activeListings}</p>
						</div>
						<div className="bg-green-100 p-3 rounded-lg">
							<CheckCircle className="w-6 h-6 text-green-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">Currently active and paid</p>
				</div>

				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Expiring Soon</p>
							<p className="text-2xl font-bold mt-1 text-gray-400">{stats.expiringSoon}</p>
						</div>
						<div className="bg-amber-100 p-3 rounded-lg">
							<Clock className="w-6 h-6 text-amber-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">Within next 14 days</p>
				</div>

				<div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Total Spent</p>
							<p className="text-2xl font-bold mt-1 text-gray-400">₦ {stats.totalSpent?.toLocaleString() || '0'}</p>
						</div>
						<div className="bg-purple-100 p-3 rounded-lg">
							<DollarSign className="w-6 h-6 text-purple-600" />
						</div>
					</div>
					<p className="text-xs text-gray-400 mt-3">Lifetime spending on credits</p>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Purchase Options */}
				<div className="lg:col-span-2 space-y-6">
					{/* Credit Purchase Section */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-xl font-bold text-gray-900">Purchase Credits</h2>
								<p className="text-gray-600 mt-1">Buy credits to list properties (1 credit = 1 property)</p>
							</div>
							<div className="flex items-center gap-2 text-sm text-gray-500">
								<Info className="w-4 h-4" />
								<span>Current credits: {userProfile.credits}</span>
							</div>
						</div>

						{/* Credit Options Grid */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
							{availableCreditOptions.length > 0 ? (
								availableCreditOptions.map((option) => (
									<div
										key={option.credits}
										className={`border rounded-xl p-5 cursor-pointer transition ${
											selectedCredits === option.credits
												? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
												: 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
										}`}
										onClick={() => setSelectedCredits(option.credits)}>
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2">
												<div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
													<span className="font-bold text-amber-700 text-lg">{option.credits}</span>
												</div>
												<div>
													<div className="font-bold text-gray-900">
														{option.credits} Credit{option.credits !== 1 ? 's' : ''}
													</div>
													<div className="text-sm text-gray-500">{option.description}</div>
												</div>
											</div>
											{option.isRecommended && <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">Recommended</span>}
										</div>

										<div className="text-center mt-4">
											<div className="text-2xl font-bold text-gray-900">₦{option.price.toLocaleString()}</div>
											<div className="text-sm text-gray-500 mt-1">₦{(option.price / option.credits).toLocaleString()} per credit</div>
										</div>
									</div>
								))
							) : (
								<div className="col-span-full text-center py-8">
									<CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
									<h3 className="text-lg font-bold text-gray-900 mb-2">Maximum Credits Purchased</h3>
									<p className="text-gray-600">You have already purchased all available credit packages.</p>
								</div>
							)}
						</div>

						{/* Purchase button */}
						{selectedCredits && availableCreditOptions.length > 0 && (
							<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
								<div>
									<p className="font-medium text-gray-900">Selected Package</p>
									<p className="text-sm text-gray-600">
										{selectedCredits} credits • ₦{creditOptions.find((o) => o.credits === selectedCredits)?.price.toLocaleString()}
									</p>
								</div>
								<button
									onClick={() => {
										const option = creditOptions.find((o) => o.credits === selectedCredits);
										if (option) {
											handleCreditPurchase(option.credits, option.price);
										}
									}}
									disabled={isProcessing}
									className="p-3 rounded-lg bg-amber-600 hover:bg-amber-700">
									{isProcessing ? 'Processing...' : 'Proceed to Payment'}
									{/* <ChevronRight className="w-4 h-4 ml-2" /> */}
								</button>
							</div>
						)}

						{/* Credit Information */}
						<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
								<Info className="w-4 h-4" />
								How Credits Work
							</h4>
							<ul className="space-y-2 text-sm text-blue-800">
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
									<span>1 credit allows you to list 1 property for 2 months</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
									<span>Credits are used automatically when you post a property</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
									<span>Unused credits never expire</span>
								</li>
							</ul>
						</div>
					</div>

					{/* Unlimited Yearly Plan */}
					<div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
						<div className="flex flex-col md:flex-row md:items-center justify-between">
							<div className="mb-4 md:mb-0">
								<div className="flex items-center gap-2 mb-3">
									<Crown className="w-6 h-6 text-purple-600" />
									<span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">RECOMMENDED FOR POWER USERS</span>
								</div>
								<h3 className="text-xl font-bold text-gray-900">Unlimited Yearly Plan</h3>
								<p className="text-gray-600 mt-2">Post unlimited properties for 1 full year. Perfect for real estate agencies and property managers.</p>
								<div className="flex items-center gap-4 mt-4">
									<div className="text-3xl font-bold text-gray-900">₦{unlimitedOption.price.toLocaleString()}</div>
									<div className="text-sm text-gray-500">One-time payment • {unlimitedOption.duration}</div>
								</div>
							</div>

							<button
								onClick={() => setShowUnlimitedModal(true)}
								className="flex items-center justify-center rounded-lg p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:scale-105 transition-all duration-500 ease-in">
								Get Unlimited
							</button>
						</div>
					</div>
				</div>

				{/* Right Column - Properties & Transactions */}
				<div className="space-y-6">
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[450px] flex flex-col">
						<div className="flex items-center justify-between mb-6 flex-shrink-0">
							<h2 className="text-xl font-bold text-gray-900">Your Properties</h2>
							<span className="text-sm text-gray-500">{stats.activeListings} active</span>
						</div>

						<div className="flex-1 overflow-hidden">
							{properties.length > 0 ? (
								<div className="h-full overflow-y-auto pr-2 -mr-2">
									<div className="space-y-3">
										{properties.map((property) => (
											<div
												key={property.id}
												className="flex flex-col p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
												<div className="flex items-center gap-3">
													<div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
														<Image
															width={50}
															height={50}
															src={property.image}
															alt={property.title}
															className="w-full h-full object-cover"
														/>
													</div>
													<div className="flex-1 min-w-0">
														<h4 className="font-medium text-gray-900 truncate">{property.title}</h4>
														<div className="flex items-center gap-2 mt-1">
															<span
																className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
																	property.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-600'
																}`}>
																{property.status.replace('_', ' ')}
															</span>
															{property.daysRemaining > 0 && (
																<span className={`text-xs ${property.daysRemaining <= 7 ? 'text-amber-600 font-semibold' : 'text-gray-500'}`}>
																	{property.daysRemaining}d left
																</span>
															)}
														</div>
													</div>

													<div className="flex flex-col gap-2">
														{/* Renewal Button Logic */}
														{(property.daysRemaining <= 7 || property.status !== 'ACTIVE') && (
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handlePropertySubscriptionRenewal(property.id);
																}}
																disabled={isProcessing}
																className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white text-xs font-bold rounded-md transition-all shadow-sm">
																<RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
																Renew
															</button>
														)}

														{property.daysRemaining <= 0 && <span className="text-xs text-red-600 font-bold">Expired</span>}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>
							) : (
								<div className="h-full flex flex-col items-center justify-center">
									<Building className="w-12 h-12 text-gray-300 mb-3" />
									<p className="text-gray-500">No properties listed yet</p>
									<p className="text-sm text-gray-400 mt-1">Start by purchasing credits</p>
								</div>
							)}
						</div>

						{properties.length > 4 && (
							<div className="pt-4 mt-4 border-t border-gray-200 flex-shrink-0 flex items-center justify-center">
								<Link
									href={configurations.urls.User.MyProperties}
									className="text-sm text-amber-600 hover:text-amber-700 font-medium w-full text-center">
									View All Properties ({properties.length})
								</Link>
							</div>
						)}
					</div>

					{/* Recent Transactions */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
							<button className="text-amber-600">View All</button>
						</div>

						<div className="space-y-4">
							{recentTransactions.length > 0 ? (
								recentTransactions.map((transaction) => (
									<div
										key={transaction.userId}
										className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
										<div>
											<div className="flex items-center gap-2">
												<CreditCard className="w-4 h-4 text-gray-400" />
												<span className="font-medium text-gray-900">
													{transaction.creditsPurchased} Credit{transaction.creditsPurchased !== 1 ? 's' : ''}
												</span>
											</div>
											<div className="text-xs text-gray-500 mt-1">{new Date(transaction.createdAt).toLocaleDateString()}</div>
										</div>
										<div className="text-right">
											<div className="font-bold text-gray-900">₦{transaction.amount.toLocaleString()}</div>
											<span
												className={`text-xs font-medium ${
													transaction.status === 'SUCCESS' ? 'text-green-600' : transaction.status === 'PENDING' ? 'text-amber-600' : 'text-red-600'
												}`}>
												{transaction.status}
											</span>
										</div>
									</div>
								))
							) : (
								<div className="text-center py-4">
									<CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
									<p className="text-gray-500">No transactions yet</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Unlimited Plan Modal */}
			{showUnlimitedModal && (
				<div className="fixed inset-0 bg-black/50 text-black backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-2xl max-w-md w-full p-6">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
									<Crown className="w-6 h-6 text-white" />
								</div>
								<div>
									<h3 className="font-bold text-gray-900">Unlimited Yearly Plan</h3>
									<p className="text-sm text-gray-600">Best value for frequent posters</p>
								</div>
							</div>
							<button onClick={() => setShowUnlimitedModal(false)}>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="space-y-4 mb-6">
							<div className="p-4 bg-purple-50 rounded-lg">
								<div className="text-4xl font-bold text-gray-900 mb-2">₦{unlimitedOption.price.toLocaleString()}</div>
								<div className="text-sm text-gray-600">One payment • 1 year unlimited access</div>
							</div>

							<div className="space-y-3">
								<h4 className="font-bold text-gray-900">Plan Includes:</h4>
								<ul className="space-y-2">
									<li className="flex items-start gap-2">
										<CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Unlimited property listings for 1 year</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Priority customer support</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Featured listing placement</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span>No per-property charges</span>
									</li>
								</ul>
							</div>
						</div>

						<div className="flex gap-3">
							<button
								onClick={() => setShowUnlimitedModal(false)}
								className="flex-1 p-2 rounded-lg border border-purple-600 hover:bg-purple-600 hover:text-white transition-colors duration-500 ease-in">
								Cancel
							</button>
							<button
								onClick={handleUnlimitedPurchase}
								disabled={isProcessing}
								className="flex-1 p-2 rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-105 transition-all duration-500 ease-in">
								{isProcessing ? 'Processing...' : 'Purchase Plan'}
							</button>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
