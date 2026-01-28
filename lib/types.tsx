import {
	BookingStatus,
	PropertyCurrency,
	PropertyDuration,
	PropertyTypeValue,
	StateContextActionTypes,
	SubscriptionStatus,
	TransactionStatus,
	TransactionType,
} from './enums';

// Context Types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface State {
	isSidebarCollapsed: boolean;
	homeSearchValue: {
		location: string;
		type: PropertyTypeValue;
	};
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type StateAction =
	| { type: StateContextActionTypes.ON_TOGGLE_SIDEBAR; payload: { isSidebarCollapsed: State['isSidebarCollapsed'] } }
	| {
			type: StateContextActionTypes.ON_UPDATE_HOME_SEARCH_BAR_VALUE;
			payload: { location: State['homeSearchValue']['location']; type: State['homeSearchValue']['type'] };
	  };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface StateContext {
	state: State;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ReducerType = (state: State, action: StateAction) => State;

export interface jwtToken {
	sub: string;
	name: string;
	email: string;
	isAdmin: boolean;
	iat: number;
	exp: number;
}

export interface UserType {
	_id: string;
	name: string;
	email: string;
	phone: string;
	password: string;
	isAdmin: boolean;
	avatar: string | null;
	listingCredits: number;
	unlimitedExpiryDate: Date;
	isUnlimited: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface EditableImage {
	publicId?: string; // optional for new uploads
	file?: File; // only local
	url: string; // required for preview
	order: number;
	placeholderUrl?: string;
	isDeleted?: boolean; // mark existing images for deletion
}

export interface EditableVideo {
	publicId?: string; // optional for new uploads
	file?: File; // only local
	url: string;
	placeholderUrl?: string;
	isDeleted?: boolean; // mark existing video for deletion
}

export interface PropertyImage {
	url: string;
	placeholderUrl: string;
	publicId: string;
	order: number; // For ordering images
}

export interface PropertyVideo {
	url: string;
	placeholderUrl: string;
	publicId: string;
}

export interface PropertyType {
	_id: string;
	title: string;
	location: string;
	type: PropertyTypeValue;
	price: PropertyPriceType;
	images: PropertyImage[];
	video: PropertyVideo | null;
	beds: number;
	baths: number;
	available: boolean;
	features: string[];
	createdAt: Date;
	updatedAt: Date;
	isVerified: boolean;
	bookingStats: BookingStats;
	createdBy: Pick<UserType, '_id' | 'avatar' | 'email' | 'isAdmin' | 'name' | 'phone'>;
	blockedDates?: any;
}

export interface BookingStats {
	totalBookings: number;
	confirmedBookings: number;
	pendingBookings: number;
	cancelledBookings: number;
	revenueGenerated: number;
	occupancyRate: number;
	recentBookings: BookingType[]; // Or create a proper BookingType interface
	totalOccupiedDays: number;
	stayBookingCount: number;
	periodDays: number;
	averageStayDuration: number;
}

export interface BookingType {
	_id: string;
	userId: string | null;
	propertyTitle: string;
	propertyId: string;
	property: PropertyType;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	checkInDate: Date;
	checkOutDate: Date;
	totalAmount: number;
	status: BookingStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface BookingTypeWithPrice {
	_id: string;
	userId: string | null;
	propertyTitle: string;
	property: PropertyType;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	checkInDate: Date;
	checkOutDate: Date;
	totalAmount: number;
	status: BookingStatus;
	createdAt: Date;
	updatedAt: Date;
}

export interface PropertyPriceType {
	amount: number;
	currency: PropertyCurrency;
	duration: PropertyDuration;
}

export interface BookingFetchResponseType {
	bookings: BookingTypeWithPrice[];
	pagination: PaginationType;
}

export interface PaginationType {
	page: number;
	limit: number;
	itemCount: number;
	totalPages: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

export interface FetchAllPropertiesResponse {
	properties: (PropertyType & { blockedDates: { from: Date; to: Date }[] })[];
	pagination: PaginationType;
}

export interface FetchAllAdminPropertiesResponse {
	properties: PropertyType[];
	pagination: PaginationType;
	totalProperties: number;
	availableProperties: number;
	bookedProperties: number;
}

export interface SignInResponse {
	user: UserType;
	accessToken: string;
}

export interface ErrorResponse {
	error: string;
	message: string;
}

export interface AdminDashboardData {
	stats: {
		totalProperties: number;
		availableProperties: number;
		bookedProperties: number;
		totalBookings: number;
		activeBookings: number;
		pendingBookings: number;
		totalCustomers: number;
		totalRevenue: number;
		revenueCurrency: PropertyCurrency;
		currencyBreakdown: any;
		revenueChange: number;
		occupancyRate: number;
		creditsRevenue: number;
	};
	recentBookings: BookingType[];
	revenueTrend: {
		date: string;
		revenue: number;
		bookings: number;
	}[];
	quickStats: {
		properties: number;
		pendingBookings: number;
		customers: number;
	};
}

// Type guard for SignInResponse
export function isSignInResponse(data: any): data is SignInResponse {
	return (
		data !== null &&
		typeof data === 'object' &&
		'user' in data &&
		typeof data.user === 'object' &&
		'accessToken' in data &&
		typeof data.accessToken === 'string' &&
		// Optional: Validate specific user fields
		'id' in data.user &&
		'email' in data.user &&
		'name' in data.user
	);
}

// Type guard for ErrorResponse
export function isErrorResponse(data: any): data is ErrorResponse {
	return data !== null && typeof data === 'object' && 'error' in data && typeof data.error === 'string' && 'message' in data && typeof data.message === 'string';
}

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface FetchSubscriptionResponse {
	userProfile: {
		name: string;
		email: string;
		credits: number;
	};
	stats: {
		totalProperties: number;
		activeListings: number;
		expiringSoon: number;
		totalSpent: number;
	};
	properties: {
		id: string;
		title: string;
		status: SubscriptionStatus;
		expiryDate: Date;
		daysRemaining: number;
		image: string;
		location: string;
	}[];
	recentTransactions: {
		userId: string;
		amount: number;
		creditsPurchased: number;
		paymentReference: string;
		type: TransactionType;
		status: TransactionStatus;
		createdAt: Date;
		updatedAt: Date;
	}[];
	creditOptions: (
		| {
				credits: number;
				price: number;
				description: string;
				isRecommended?: undefined;
		  }
		| {
				credits: number;
				price: number;
				isRecommended: boolean;
				description: string;
		  }
	)[];
	unlimitedOption: {
		price: number;
		duration: string;
		description: string;
	};
}

export interface PaymentVerificationResponse {
	_id: string;
	userId: string;
	amount: number;
	creditsPurchased: number;
	paymentReference: string;
	type: TransactionType;
	status: TransactionStatus;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
}

export interface VerificationResult {
	success: boolean;
	message: string;
	data?: PaymentVerificationResponse;
	error?: string;
}

export interface Transaction {
	_id: string;
	userId: string;
	amount: number;
	creditsPurchased: number;
	paymentReference: string;
	type: TransactionType;
	status: TransactionStatus;
	createdAt: string;
	updatedAt: string;
}

export interface TransactionStats {
	totalTransactions: number;
	successfulTransactions: number;
	totalAmount: number;
	pendingTransactions: number;
	creditsPurchased: number;
}

export interface TransactionsPageData {
	transactions: Transaction[];
	stats: TransactionStats;
	userProfile: {
		name: string;
		email: string;
		credits: number;
		planType?: 'UNLIMITED' | 'PAY_AS_YOU_GO';
		planExpiry?: Date;
	};
	filters: {
		status: string[];
		type: string[];
		dateRange: {
			start: string;
			end: string;
		} | null;
	};
	pagination: PaginationType;
}
