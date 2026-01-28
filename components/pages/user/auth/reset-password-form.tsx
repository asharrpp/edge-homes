// components/auth/reset-password-form.tsx
'use client';

import { Eye, EyeOff, Loader2, Lock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { configurations } from '@/config';

interface ResetPasswordFormProps {
	token: string;
	isAdmin?: boolean;
}

export function ResetPasswordForm({ token, isAdmin = false }: ResetPasswordFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [formData, setFormData] = useState({
		password: '',
		confirmPassword: '',
	});
	const [errors, setErrors] = useState<string[]>([]);
	const [passwordStrength, setPasswordStrength] = useState(0);

	const validatePassword = (password: string) => {
		const errors: string[] = [];

		if (isAdmin) {
			// Admin password requirements (stricter)
			if (password.length < 12) {
				errors.push('Admin passwords must be at least 12 characters long');
			}
			if (!/(?=.*[a-z])/.test(password)) {
				errors.push('Include at least one lowercase letter');
			}
			if (!/(?=.*[A-Z])/.test(password)) {
				errors.push('Include at least one uppercase letter');
			}
			if (!/(?=.*\d)/.test(password)) {
				errors.push('Include at least one number');
			}
			if (!/(?=.*[!@#$%^&*])/.test(password)) {
				errors.push('Include at least one special character (!@#$%^&*)');
			}
		} else {
			// User password requirements
			if (password.length < 8) {
				errors.push('Password must be at least 8 characters long');
			}
			if (!/(?=.*[a-zA-Z])/.test(password)) {
				errors.push('Include at least one letter');
			}
			if (!/(?=.*\d)/.test(password)) {
				errors.push('Include at least one number');
			}
		}

		// Common checks for both
		if (/(password|123456|admin|qwerty)/i.test(password)) {
			errors.push('Avoid common or easily guessable passwords');
		}

		return errors;
	};

	const calculatePasswordStrength = (password: string) => {
		let strength = 0;
		if (password.length >= (isAdmin ? 12 : 8)) strength += 25;
		if (/[a-z]/.test(password)) strength += 25;
		if (/[A-Z]/.test(password)) strength += 25;
		if (/[0-9]/.test(password)) strength += 15;
		if (/[!@#$%^&*]/.test(password)) strength += 10;
		return Math.min(strength, 100);
	};

	const handlePasswordChange = (password: string) => {
		setFormData((prev) => ({ ...prev, password }));
		setPasswordStrength(calculatePasswordStrength(password));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors([]);

		// Validate passwords match
		if (formData.password !== formData.confirmPassword) {
			setErrors(['Passwords do not match']);
			return;
		}

		// Validate password strength
		const passwordErrors = validatePassword(formData.password);
		if (passwordErrors.length > 0) {
			setErrors(passwordErrors);
			return;
		}

		setIsLoading(true);

		try {
			const { backEndUrl } = configurations.envs;

			const response = await fetch(`${backEndUrl}/auth/reset-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token,
					password: formData.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Failed to reset password');
			}

			// Success
			toast.success(isAdmin ? 'Admin password reset successful!' : 'Password reset successful!');

			// Redirect based on user type
			if (isAdmin) {
				router.push(configurations.urls.Admin.SignIn);
			} else {
				router.push(configurations.urls.User.SignIn);
			}
		} catch (error: any) {
			void error;
			let errorMessage = error.message || 'Failed to reset password';

			if (errorMessage.toLowerCase().includes('expired')) {
				errorMessage = 'Reset link has expired. Please request a new one.';
			} else if (errorMessage.toLowerCase().includes('invalid')) {
				errorMessage = 'Invalid reset token. Please request a new reset link.';
			} else if (errorMessage.toLowerCase().includes('rate limit')) {
				errorMessage = 'Too many attempts. Please try again later.';
			}

			setErrors([errorMessage]);
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const getStrengthColor = (strength: number) => {
		if (strength < 40) return 'bg-red-500';
		if (strength < 70) return 'bg-yellow-500';
		if (strength < 85) return 'bg-amber-500';
		return 'bg-green-500';
	};

	const getStrengthText = (strength: number) => {
		if (strength < 40) return 'Weak';
		if (strength < 70) return 'Fair';
		if (strength < 85) return 'Good';
		return 'Strong';
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6">
			<div>
				<label
					htmlFor="password"
					className="block text-sm font-medium text-gray-700 mb-2">
					{isAdmin ? 'New Admin Password' : 'New Password'}
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Lock className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						required
						value={formData.password}
						onChange={(e) => handlePasswordChange(e.target.value)}
						placeholder={isAdmin ? 'Enter secure admin password' : 'Enter new password'}
						className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-black placeholder-gray-400"
						disabled={isLoading}
						autoComplete="new-password"
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition"
						disabled={isLoading}
						aria-label={showPassword ? 'Hide password' : 'Show password'}>
						{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
					</button>
				</div>

				{/* Password Strength Indicator */}
				{formData.password && (
					<div className="mt-3">
						<div className="flex justify-between text-xs mb-1">
							<span className="text-gray-600">Password strength:</span>
							<span
								className={`font-medium ${
									passwordStrength < 40 ? 'text-red-600' : passwordStrength < 70 ? 'text-yellow-600' : passwordStrength < 85 ? 'text-amber-600' : 'text-green-600'
								}`}>
								{getStrengthText(passwordStrength)}
							</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
								style={{ width: `${passwordStrength}%` }}
							/>
						</div>
					</div>
				)}
			</div>

			<div>
				<label
					htmlFor="confirmPassword"
					className="block text-sm font-medium text-gray-700 mb-2">
					Confirm Password
				</label>
				<div className="relative">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Lock className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="confirmPassword"
						name="confirmPassword"
						type={showConfirmPassword ? 'text' : 'password'}
						required
						value={formData.confirmPassword}
						onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
						placeholder="Confirm your password"
						className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-black placeholder-gray-400"
						disabled={isLoading}
						autoComplete="new-password"
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition"
						disabled={isLoading}
						aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
						{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
					</button>
				</div>
			</div>

			{errors.length > 0 && (
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
					<ul className="space-y-2">
						{errors.map((error, index) => (
							<li
								key={index}
								className="text-red-600 text-sm flex items-start">
								<div className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0">!</div>
								{error}
							</li>
						))}
					</ul>
				</div>
			)}

			<button
				type="submit"
				disabled={isLoading}
				className="w-full bg-gradient-to-r from-gray-900 to-amber-700 hover:from-gray-800 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
				{isLoading ? (
					<>
						<Loader2 className="w-5 h-5 mr-2 animate-spin" />
						{isAdmin ? 'Resetting Admin Password...' : 'Resetting Password...'}
					</>
				) : (
					<>
						{isAdmin ? <Shield className="w-5 h-5 mr-2" /> : <Lock className="w-5 h-5 mr-2" />}
						{isAdmin ? 'Reset Admin Password' : 'Reset Password'}
					</>
				)}
			</button>

			{/* Password Requirements Reminder */}
			<div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
				<div className="flex items-start">
					<div className="flex-shrink-0">
						<Shield className="w-5 h-5 text-amber-600 mt-0.5" />
					</div>
					<div className="ml-3">
						<h4 className="text-sm font-medium text-gray-900">{isAdmin ? 'Admin Password Requirements' : 'Password Requirements'}</h4>
						<ul className="mt-2 space-y-1">
							{isAdmin ? (
								<>
									<li className="text-xs text-gray-600">• Minimum 12 characters</li>
									<li className="text-xs text-gray-600">• Uppercase & lowercase letters</li>
									<li className="text-xs text-gray-600">• Numbers and special characters</li>
									<li className="text-xs text-gray-600">• Unique from other passwords</li>
								</>
							) : (
								<>
									<li className="text-xs text-gray-600">• Minimum 8 characters</li>
									<li className="text-xs text-gray-600">• Letters and numbers</li>
									<li className="text-xs text-gray-600">• Avoid common passwords</li>
								</>
							)}
						</ul>
					</div>
				</div>
			</div>
		</form>
	);
}
