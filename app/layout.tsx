import type { Metadata } from 'next';
import './globals.css';

import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

import { Footer } from '@/components/global/footer';
import { Header } from '@/components/global/header';
import { ContextProvider } from '@/context';
import { MetaData } from '@/lib/constants';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: MetaData.title,
	description: MetaData.description,
	robots: {
		follow: true,
		index: true,
		nocache: false,
	},
	alternates: {
		canonical: MetaData.url,
	},
	applicationName: MetaData.appName,
	keywords: [MetaData.appName],
	authors: [{ name: MetaData.appName }],
	creator: 'Isurf Globals',
	publisher: 'Isurf Globals',
	openGraph: {
		type: 'website',
		url: MetaData.url,
		title: MetaData.title,
		description: MetaData.description,
		locale: 'en_US',
		siteName: MetaData.appName,
		images: [
			{
				url: MetaData.openGraphImage,
				width: 1200,
				height: 630,
				alt: 'Edge Homes Preview',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: MetaData.title,
		description: MetaData.description,
		creator: '@isurfglobals',
		images: ['/og-image.png'],
	},
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon.ico',
		apple: '/apple-icon.png',
	},
	category: 'Real Estate Tech',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ContextProvider>{children}</ContextProvider>
				<Toaster
					richColors
					position="top-left"
					toastOptions={{
						duration: 15000,
						closeButton: true,
					}}
				/>
			</body>
		</html>
	);
}
