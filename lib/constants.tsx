import { configurations } from '@/config';

export const MetaData = {
	appName: 'Edge Homes',
	title: 'Edge Homes',
	description: 'We redefine modern living by connecting you with the finest short-lets and luxury homes. Comfort, security, and class.',
	url: configurations.envs.baseUrl as string,
	openGraphImage: `${configurations.envs.baseUrl as string}/og-image.jpg`,
	twitterImage: `${configurations.envs.baseUrl as string}/twitter-image.png`,
};

export const Socials = {
	X: '',
	Emails: {
		customerSupport: 'bookings@edgehomes.com',
	},
};

export const OtherDetails = {
	address: '17 Petrocam Plaza, Elf-Bus-stop, Lagos',
	phone: '+2348001234567',
};

export const REGEX_PATTERNS = {
	NAME: /^[a-zA-Z\s'-]+$/,
	EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
	PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
} as const;

export const ERROR_MESSAGES = {
	NAME: 'Name should be 2 to 30 characters long and can include letters, spaces, hyphens, or apostrophes.',
	EMAIL: 'Hmm, that doesn’t look like a valid email address. Please double-check it.',
	PASSWORD: 'Your password needs at least 8 characters, with a mix of uppercase, lowercase, numbers, and a special character.',
} as const;

export const USER_COOKIE_NAME = 'user-auth-cookie-name';
export const ADMIN_COOKIE_NAME = 'admin-auth-cookie-name';
export const insuranceFee = 30000;
