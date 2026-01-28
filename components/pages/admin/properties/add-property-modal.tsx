'use client';

import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { ADMIN_COOKIE_NAME, USER_COOKIE_NAME } from '@/lib/constants';
import { PropertyTypeValue } from '@/lib/enums';

interface AddPropertyModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

interface FormData {
	title: string;
	location: string;
	type: 'Short-let' | 'Long-stay';
	price: {
		amount: string;
		currency: 'NGN' | 'USD';
		duration: 'night' | 'month' | 'year';
	};
	beds: string;
	baths: string;
	available: boolean;
	features: string[];
}

export function AddPropertyModal({ isOpen, onClose, onSuccess }: AddPropertyModalProps) {
	const { push } = useRouter();
	const pathname = usePathname();

	const [formData, setFormData] = useState<FormData>({
		title: '',
		location: '',
		type: 'Short-let',
		price: {
			amount: '',
			currency: 'NGN',
			duration: 'night',
		},
		beds: '',
		baths: '',
		available: true,
		features: [''],
	});

	const [images, setImages] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [video, setVideo] = useState<File | null>(null);
	const [videoPreview, setVideoPreview] = useState<string | null>(null);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Handle form field changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;

		if (name.startsWith('price.')) {
			const priceField = name.split('.')[1];
			setFormData((prev) => ({
				...prev,
				price: {
					...prev.price,
					[priceField]: type === 'number' ? Number(value) : value,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
			}));
		}
	};

	const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		let newImages = [...images];
		let newImagePreviews = [...imagePreviews];
		let newVideo = video;
		let newVideoPreview = videoPreview;

		for (const file of Array.from(files)) {
			if (file.type.startsWith('image/')) {
				if (newImages.length >= 3) {
					setError('Maximum of 3 images allowed.');
					continue;
				}
				newImages.push(file);

				const reader = new FileReader();
				reader.onloadend = () => {
					setImagePreviews((prev) => [...prev, reader.result as string]);
				};
				reader.readAsDataURL(file);
			}

			if (file.type.startsWith('video/')) {
				if (newVideo) {
					setError('Only one video is allowed.');
					continue;
				}
				newVideo = file;
				newVideoPreview = URL.createObjectURL(file);
			}
		}

		setImages(newImages);
		setVideo(newVideo);
		setVideoPreview(newVideoPreview);
		setError(null);
	};

	// Handle features array
	const handleFeatureChange = (index: number, value: string) => {
		const newFeatures = [...formData.features];
		newFeatures[index] = value;
		setFormData((prev) => ({ ...prev, features: newFeatures }));
	};

	const addFeatureField = () => {
		setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
	};

	const removeFeatureField = (index: number) => {
		if (formData.features.length > 1) {
			const newFeatures = formData.features.filter((_, i) => i !== index);
			setFormData((prev) => ({ ...prev, features: newFeatures }));
		}
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		if (!video || images.length < 1) {
			setIsSubmitting(false);
			setError('At least 1 image and 1 video are required.');
			return;
		}

		try {
			const { backEndUrl } = configurations.envs;
			const accessToken = await getCookie(USER_COOKIE_NAME);
			if (!accessToken) {
				push(configurations.urls.User.SignIn + '?redirect=' + encodeURIComponent(pathname));
				return;
			}

			// Create FormData
			const formDataToSend = new FormData();
			// Append each field individually
			formDataToSend.append('title', formData.title);
			formDataToSend.append('location', formData.location);
			formDataToSend.append('type', formData.type);
			formDataToSend.append('beds', formData.beds);
			formDataToSend.append('baths', formData.baths);
			formDataToSend.append('available', `${formData.available}`);

			// Append price fields with dot notation
			formDataToSend.append('price[amount]', formData.price.amount);

			const currencyMap: Record<'NGN' | 'USD' | 'GBP' | 'EUR', string> = {
				NGN: '₦',
				USD: '$',
				GBP: '£',
				EUR: '€',
			};
			if (formData.price.currency) {
				formDataToSend.append('price[currency]', currencyMap[formData.price.currency]);
			}
			formDataToSend.append('price[duration]', formData.price.duration);

			// Append features array as JSON
			formDataToSend.append('features', JSON.stringify(formData.features.filter((feature) => feature.trim() !== '')));

			images.forEach((img) => {
				formDataToSend.append('images', img);
			});

			if (video) {
				formDataToSend.append('video', video);
			}

			const response = await fetch(`${backEndUrl}/property`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken.value}`,
				},
				body: formDataToSend,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to create property');
			}

			// Success - close modal and refresh
			resetForm();
			onSuccess();
			onClose();
		} catch (err: any) {
			setError(err.message || 'Something went wrong. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const resetForm = () => {
		setFormData({
			title: '',
			location: '',
			type: 'Short-let',
			price: {
				amount: '',
				currency: 'NGN',
				duration: 'night',
			},
			beds: '',
			baths: '',
			available: true,
			features: [''],
		});
		// setImageFile(null);
		// setImagePreview(null);
		setImages([]);
		setImagePreviews([]);
		setVideo(null);
		setVideoPreview(null);

		setError(null);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold text-gray-900">Add New Property</h2>
							<p className="text-sm text-gray-500 mt-1">Fill in the details of your new property</p>
						</div>
						<button
							onClick={onClose}
							className="p-2 hover:bg-gray-100 rounded-lg transition"
							disabled={isSubmitting}>
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
				</div>

				{/* Form */}
				<form
					onSubmit={handleSubmit}
					className="p-6 space-y-6">
					{error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>}

					{/* Basic Details */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Title */}
						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 mb-2">Property Title *</label>
							<input
								type="text"
								name="title"
								value={formData.title}
								onChange={handleInputChange}
								required
								disabled={isSubmitting}
								className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
								placeholder="e.g., Modern Apartment in Lekki"
							/>
						</div>

						{/* Location */}
						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
							<input
								type="text"
								name="location"
								value={formData.location}
								onChange={handleInputChange}
								required
								disabled={isSubmitting}
								className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
								placeholder="e.g., Lekki Phase 1, Lagos"
							/>
						</div>

						{/* Type */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
							<select
								name="type"
								value={formData.type}
								onChange={handleInputChange}
								disabled={isSubmitting}
								className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50">
								<option value={PropertyTypeValue.SHORT_LET}>Short-let</option>
								<option value={PropertyTypeValue.LONG_STAY}>Long-stay</option>
							</select>
						</div>

						{/* Availability */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
							<div className="flex items-center gap-3">
								<label className="inline-flex items-center">
									<input
										type="checkbox"
										name="available"
										checked={formData.available}
										onChange={handleInputChange}
										disabled={isSubmitting}
										className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500 disabled:opacity-50"
									/>
									<span className="ml-2 text-sm text-gray-700">Available for booking</span>
								</label>
							</div>
						</div>

						{/* Price Amount */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Price Amount *</label>
							<input
								type="number"
								name="price.amount"
								value={formData.price.amount}
								onChange={handleInputChange}
								required
								disabled={isSubmitting}
								min="0"
								step="0.01"
								className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
								placeholder="0.00"
							/>
						</div>

						{/* Currency */}
						{/* <div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
							<select
								name="price.currency"
								value={formData.price.currency}
								onChange={handleInputChange}
								disabled={isSubmitting}
								className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50">
								<option value="NGN">Naira (₦)</option>
								<option value="USD">Dollar ($)</option>
							</select>
						</div> */}

						{/* Duration */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
							<select
								name="price.duration"
								value={formData.price.duration}
								onChange={handleInputChange}
								disabled={isSubmitting}
								className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50">
								<option value="night">Per Night</option>
								<option value="month">Per Month</option>
								<option value="year">Per Year</option>
							</select>
						</div>

						{/* Beds */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Number of Beds *</label>
							<input
								type="number"
								name="beds"
								value={formData.beds}
								onChange={handleInputChange}
								required
								disabled={isSubmitting}
								min="0"
								className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
								placeholder="0"
							/>
						</div>

						{/* Baths */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Number of Baths *</label>
							<input
								type="number"
								name="baths"
								value={formData.baths}
								onChange={handleInputChange}
								required
								disabled={isSubmitting}
								min="0"
								className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
								placeholder="0"
							/>
						</div>
					</div>

					{/* Features */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
						<div className="space-y-3">
							{formData.features.map((feature, index) => (
								<div
									key={index}
									className="flex items-center gap-3">
									<input
										type="text"
										value={feature}
										onChange={(e) => handleFeatureChange(index, e.target.value)}
										disabled={isSubmitting}
										className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
										placeholder="e.g., Swimming Pool, WiFi, Parking"
									/>
									{formData.features.length > 1 && (
										<button
											type="button"
											onClick={() => removeFeatureField(index)}
											disabled={isSubmitting}
											className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
											<Trash2 className="w-4 h-4" />
										</button>
									)}
								</div>
							))}
						</div>
						<button
							type="button"
							onClick={addFeatureField}
							disabled={isSubmitting}
							className="mt-3 inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50">
							<Plus className="w-4 h-4" />
							Add Another Feature
						</button>
					</div>

					{/* Image Upload (Optional - backend uses hardcoded image) */}
					{/* <div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Property Image (Optional - currently uses default)</label>
						<div
							onClick={() => !isSubmitting && fileInputRef.current?.click()}
							className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition ${
								!isSubmitting ? 'hover:border-amber-500' : 'opacity-50 cursor-not-allowed'
							}`}>
							{imagePreview ? (
								<div className="relative">
									<img
										src={imagePreview}
										alt="Preview"
										className="w-full h-48 object-cover rounded-lg mx-auto"
									/>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setImageFile(null);
											setImagePreview(null);
											if (fileInputRef.current) {
												fileInputRef.current.value = '';
											}
										}}
										disabled={isSubmitting}
										className="absolute top-3 right-3 p-2 bg-red-600 text-amber-500 rounded-full hover:bg-red-700 transition disabled:opacity-50">
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							) : (
								<>
									<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<p className="text-sm text-gray-600">Click to upload property image (optional)</p>
									<p className="text-xs text-gray-500 mt-1">Note: Currently uses default image</p>
								</>
							)}
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								className="hidden"
								disabled={isSubmitting}
							/>
						</div>
					</div> */}
					{/* Media Upload */}
					<div className="space-y-4">
						<label className="block text-sm font-medium text-gray-700">Property Media (1 video + up to 3 images) *</label>

						{/* Video Row */}
						<div
							onClick={() => !isSubmitting && fileInputRef.current?.click()}
							className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-amber-500 transition">
							{videoPreview ? (
								<video
									src={videoPreview}
									controls
									className="w-full h-48 object-cover rounded-lg"
								/>
							) : (
								<p className="text-sm text-gray-600">Click to upload property video (required)</p>
							)}
						</div>

						{/* Images Grid */}
						<div className="grid grid-cols-3 gap-3">
							{imagePreviews.map((src, idx) => (
								<img
									key={idx}
									src={src}
									className="h-32 w-full object-cover rounded-lg"
								/>
							))}

							{imagePreviews.length < 3 && (
								<div
									onClick={() => !isSubmitting && fileInputRef.current?.click()}
									className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-500 cursor-pointer hover:border-amber-500">
									Add Image
								</div>
							)}
						</div>

						<input
							ref={fileInputRef}
							type="file"
							accept="image/*,video/*"
							multiple
							onChange={handleMediaChange}
							className="hidden"
							disabled={isSubmitting}
						/>
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
							{isSubmitting ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									Adding...
								</>
							) : (
								<>
									<Plus className="w-4 h-4" />
									Add Property
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
