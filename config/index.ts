export const configurations = {
	urls: {
		Home: '/',
		Public: {
			Property: '/property/[propertyId]',
			UserForgetPassword: '/auth/dashboard/forget-password',
			UserResetPassword: '/auth/dashboard/forget-password/reset-password',
			AdminForgetPassword: '/auth/admin/forget-password',
			AdminResetPassword: '/auth/admin/forget-password/reset-password',
			VerifyBookingPayment: '/verify-payment',
		},
		Admin: {
			Dashboard: '/admin',
			SignIn: '/auth/admin/sign-in',
			properties: '/admin/properties',
			property: '/admin/properties/[propertyId]',
			bookings: {
				booking: '/admin/bookings',
			},
			customers: {
				customer: '/admin/customers',
			},
			notifications: '/admin/notifications',
		},
		User: {
			Dashboard: '/dashboard',
			Properties: '/dashboard/properties',
			MyProperties: '/dashboard/my-properties',
			Support: '/dashboard/my-properties',
			Help: '/dashboard/my-properties',
			Property: '/dashboard/properties/[propertyId]',
			Bookings: '/dashboard/bookings',
			VerifyBookingPayment: '/dashboard/bookings/payment/verify',
			Booking: '/dashboard/bookings/[bookingId]',
			Payment: '/dashboard/payment',
			Subscription: '/dashboard/subscription',
			VerifyPayment: '/dashboard/subscription/verify-payment',
			Settings: '/dashboard/settings',
			SignIn: '/auth/dashboard/sign-in',
			SignUp: '/auth/dashboard/sign-up',
		},
	},
	envs: {
		backEndUrl: process.env.NEXT_PUBLIC_BACK_END_URL as string,
		baseUrl: process.env.BASE_URL as string,
	},
} as const;
