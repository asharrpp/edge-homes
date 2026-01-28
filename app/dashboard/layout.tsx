import { redirect } from 'next/navigation';

import { UserRootLayout } from '@/components/global/user-layout';
import { configurations } from '@/config';
import { getCookie, getSession } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { UserType } from '@/lib/types';

const getProfile = async (headers: any) => {
	try {
		const request = await fetch(`${configurations.envs.backEndUrl}/user/profile`, {
			headers,
			signal: AbortSignal.timeout(5000),
		});

		if (!request.ok) {
			throw new Error(`HTTP error! status: ${request.status}`);
		}

		return (await request.json()) as Omit<UserType, 'password'>;
	} catch (error) {
		redirect(configurations.urls.Admin.SignIn);
	}
};

export default async function UserLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getSession(USER_COOKIE_NAME);

	if (!session) {
		redirect(configurations.urls.User.SignIn);
	}

	const accessToken = await getCookie(USER_COOKIE_NAME);

	const headers = {
		'Authorization': `Bearer ${accessToken?.value}`,
		'Content-Type': 'application/json',
	};

	const profile = await getProfile(headers);
	return <UserRootLayout profile={profile}>{children}</UserRootLayout>;
}
