// eslint-disable-next-line @typescript-eslint/no-unused-vars
export enum StateContextActionTypes {
	ON_TOGGLE_SIDEBAR = 'ON_TOGGLE_SIDEBAR',
	ON_UPDATE_HOME_SEARCH_BAR_VALUE = 'ON_UPDATE_HOME_SEARCH_BAR_VALUE',
}

export enum PropertyTypeValue {
	SHORT_LET = 'Short-let',
	LONG_STAY = 'Long-stay',
}

export enum PropertyCurrency {
	NGN = '₦',
	USD = '$',
	GBP = '£',
	EUR = '€',
}

export enum PropertyDuration {
	NIGHT = 'night',
	WEEK = 'week',
	MONTH = 'month',
	YEAR = 'year',
	DAY = 'day',
}

export enum RevalidateTags {
	HEADER_DETAILS = 'HEADER_DETAILS',
	PROPERTIES = 'PROPERTIES',
	PROPERTY = 'PROPERTY',
	BOOKINGS = 'BOOKINGS',
}

export enum BookingStatus {
	PENDING = 'pending',
	CONFIRMED = 'confirmed',
	CANCELLED = 'cancelled',
}

export enum SubscriptionStatus {
	ACTIVE = 'ACTIVE',
	EXPIRED = 'EXPIRED',
	PENDING_PAYMENT = 'PENDING_PAYMENT',
}

export enum TransactionStatus {
	PENDING = 'PENDING',
	SUCCESS = 'SUCCESS',
	FAILED = 'FAILED',
}

export enum TransactionType {
	CREDIT_PURCHASE = 'CREDIT_PURCHASE',
	UNLIMITED_YEARLY = 'UNLIMITED_YEARLY',
	BOOKING_PAYMENT = 'BOOKING_PAYMENT',
}
