import { redirect } from 'next/navigation';

import TransactionsClient from '@/components/pages/user/payment/TransactionsClient';
import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { Transaction, TransactionsPageData, TransactionStats } from '@/lib/types';

async function fetchTransactions(accessToken: string): Promise<{ transactions: Transaction[]; pagination: any; credit: number } | null> {
	const { backEndUrl } = configurations.envs;

	try {
		const url = `${backEndUrl}/transaction`;

		const response = await fetch(url, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			cache: 'no-store',
		});

		if (!response.ok) {
			throw new Error('Failed to fetch data');
		}

		return await response.json();
	} catch (error) {
		void error;
		return null;
	}
}

export default async function TransactionsPage() {
	const session = await getSession(USER_COOKIE_NAME);

	if (!session) {
		redirect(configurations.urls.User.SignIn);
	}

	const accessToken = await getCookie(USER_COOKIE_NAME);

	if (!accessToken?.value) {
		redirect(configurations.urls.User.SignIn);
	}

	// Pass search params to fetchTransactions
	const apiResponse = await fetchTransactions(accessToken.value);

	if (!apiResponse) {
		return <section className="">Issues</section>;
	}

	// Transform the API response to match your existing data structure
	const { transactions, pagination, credit } = apiResponse;

	// Calculate stats
	const stats: TransactionStats = {
		totalTransactions: pagination?.itemCount || transactions.length,
		successfulTransactions: transactions.filter((t) => t.status === 'SUCCESS').length,
		totalAmount: transactions.filter((t) => t.status === 'SUCCESS').reduce((sum, t) => sum + t.amount, 0),
		pendingTransactions: transactions.filter((t) => t.status === 'PENDING').length,
		creditsPurchased: transactions.filter((t) => t.status === 'SUCCESS').reduce((sum, t) => sum + t.creditsPurchased, 0),
	};

	const data: TransactionsPageData = {
		transactions,
		stats,
		userProfile: {
			name: session.name,
			email: session.email,
			credits: credit || 0,
		},
		filters: {
			status: ['SUCCESS', 'PENDING', 'FAILED'],
			type: ['CREDIT_PURCHASE', 'SUBSCRIPTION_RENEWAL', 'UNLIMITED_PLAN'],
			dateRange: null,
		},
		pagination,
	};

	return <TransactionsClient data={data} />;
}
