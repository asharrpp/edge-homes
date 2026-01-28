'use client';

import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { configurations } from '@/config';
import { createCookie, deleteCookie } from '@/lib/auth';
import { USER_COOKIE_NAME } from '@/lib/constants';
import { ErrorResponse, isErrorResponse, SignInResponse } from '@/lib/types';

export function UserLoginForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string[]>([]);
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage([]);

		try {
			const { backEndUrl } = configurations.envs;

			// Call your backend login endpoint
			const response = await fetch(`${backEndUrl}/auth/sign-in`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			const data = (await response.json()) as SignInResponse | ErrorResponse;

			if (isErrorResponse(data)) {
				throw new Error(data.message || 'Login failed');
			}

			await deleteCookie(USER_COOKIE_NAME);
			await createCookie({ name: USER_COOKIE_NAME, value: data.accessToken });
			const searchParams = new URLSearchParams(window.location.search);
			const redirectPath = searchParams.get('redirect');

			toast.success(`Welcome back ${data.user.name}`);
			if (redirectPath) {
				router.push(redirectPath);
			} else {
				router.push(configurations.urls.User.Dashboard);
			}
		} catch (error: any) {
			setErrorMessage((prev) => [...prev, error.message]);
			toast.error(error.message || 'Invalid email or password');
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-gray-900 to-amber-700 p-8 text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
						<LogIn className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
					<p className="text-amber-100 text-sm">Sign in to your EdgeHomes account</p>
				</div>

				{/* Form */}
				<form
					onSubmit={handleSubmit}
					className="p-8">
					<div className="space-y-6">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-2">
								Email Address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={formData.email}
								onChange={handleInputChange}
								placeholder="guest@example.com"
								className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									required
									value={formData.password}
									onChange={handleInputChange}
									placeholder="••••••••"
									className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition pr-12"
									disabled={isLoading}
								/>
								<button
									type="button"
									onClick={togglePasswordVisibility}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition"
									disabled={isLoading}
									aria-label={showPassword ? 'Hide password' : 'Show password'}>
									{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between">
							{/* <div className="flex items-center">
								<input
									id="remember"
									name="remember"
									type="checkbox"
									className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
								/>
								<label
									htmlFor="remember"
									className="ml-2 block text-sm text-gray-700">
									Remember me
								</label>
							</div> */}

							<Link
								href={configurations.urls.Public.UserForgetPassword}
								type="button"
								className="text-sm text-amber-600 hover:text-amber-700 font-medium">
								Forgot password?
							</Link>
						</div>

						{errorMessage.length > 0 && (
							<ul className="text-center">
								{errorMessage.map((message) => (
									<li
										key={message}
										className="text-red-500">
										{message}
									</li>
								))}
							</ul>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-gray-900 to-amber-700 hover:from-gray-800 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
							{isLoading ? (
								<>
									<Loader2 className="w-5 h-5 mr-2 animate-spin" />
									Signing in...
								</>
							) : (
								<>
									<LogIn className="w-5 h-5 mr-2" />
									Sign In
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
