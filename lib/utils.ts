import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { PropertyCurrency } from '@/lib/enums';
import { PropertyPriceType } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatPhone = (phone: string) => {
	const cleaned = phone.replace(/\D/g, '');
	if (cleaned.startsWith('234') || cleaned.startsWith('233')) {
		const digits = cleaned.substring(3);
		return `${cleaned.startsWith('234') ? '+234' : cleaned.startsWith('233') ? '+233' : ''} ${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
	}
	return phone;
};

export function formatPrice(price: PropertyPriceType): string {
	const formattedAmount = price.amount.toLocaleString();
	return `${price.currency}${formattedAmount}/${price.duration}`;
}

export function formatCurrency(amount: number, currency: PropertyCurrency, locale: string = 'en-US'): string {
	return `${currency}${amount.toLocaleString(locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	})}`;
}
