'use client';

import { Eye, EyeOff, Loader2, LogIn, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { configurations } from '@/config';
import { ErrorResponse, isErrorResponse, UserType } from '@/lib/types';

export function UserSignUpForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string[]>([]);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		ConfirmPassword: '',
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage([]);

		const errors: string[] = [];

		if (formData.name.length < 6) {
			errors.push('Name must not be less than 6 characters');
		}

		if (!/\S+@\S+\.\S+/.test(formData.email)) {
			errors.push('Email must be a valid email address');
		}

		if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
			errors.push('Phone number must be valid');
		}

		if (formData.password.length <= 6) {
			errors.push('Password must not be less than 6 characters');
		}

		if (formData.password !== formData.ConfirmPassword) {
			errors.push("Password doesn't match");
		}

		if (errors.length > 0) {
			setErrorMessage(errors);
			return;
		}

		try {
			setIsLoading(true);
			const { backEndUrl } = configurations.envs;

			// Call your backend login endpoint
			const response = await fetch(`${backEndUrl}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					phone: formData.phone,
					password: formData.password,
				}),
			});

			const data = (await response.json()) as UserType | ErrorResponse;

			if (isErrorResponse(data)) {
				throw new Error(data.message || 'Sign Up failed');
			}

			toast.success(`Welcome onboard ${data.name}`);
			router.push(configurations.urls.User.SignIn);
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

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword(!showConfirmPassword);
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
								htmlFor="fullname"
								className="block text-sm font-medium text-gray-700 mb-2">
								Fullname
							</label>
							<input
								id="fullname"
								name="name"
								type="text"
								required
								value={formData.name}
								onChange={handleInputChange}
								placeholder="John Doe"
								className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-gray-700 mb-2">
								Phone Number
							</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								required
								value={formData.phone}
								onChange={handleInputChange}
								placeholder="e.g. 08012345678"
								className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
								disabled={isLoading}
							/>
						</div>

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

						<div className="grid grid-cols-2 gap-2">
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

							<div>
								<label
									htmlFor="ConfirmPassword"
									className="block text-sm font-medium text-gray-700 mb-2">
									Confirm Password
								</label>
								<div className="relative">
									<input
										id="ConfirmPassword"
										name="ConfirmPassword"
										type={showConfirmPassword ? 'text' : 'password'}
										required
										value={formData.ConfirmPassword}
										onChange={handleInputChange}
										placeholder="••••••••"
										className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition pr-12"
										disabled={isLoading}
									/>
									<button
										type="button"
										onClick={toggleConfirmPasswordVisibility}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition"
										disabled={isLoading}
										aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
										{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
									</button>
								</div>
							</div>
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
									Signing Up...
								</>
							) : (
								<>
									<LogOut className="w-5 h-5 mr-2" />
									Sign Up
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
