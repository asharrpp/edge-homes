'use client';

import { Loader2, Plus, Trash2, Upload, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/constants';
import { PropertyCurrency, PropertyDuration, PropertyTypeValue } from '@/lib/enums';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

import type { EditableImage, EditableVideo, PropertyType } from '@/lib/types';
interface EditPropertyModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	property: PropertyType | null;
	isAdmin?: true;
}

interface FormData {
	title: string;
	location: string;
	type: PropertyTypeValue;
	price: {
		amount: string;
		currency: PropertyCurrency;
		duration: PropertyDuration;
	};
	beds: string;
	baths: string;
	available: string;
	features: string[];
}

export function EditPropertyModal({ isOpen, isAdmin, onClose, onSuccess, property }: EditPropertyModalProps) {
	const { push } = useRouter();
	const pathname = usePathname();

	const [formData, setFormData] = useState<FormData>({
		title: '',
		location: '',
		type: PropertyTypeValue.SHORT_LET,
		price: {
			amount: '',
			currency: PropertyCurrency.NGN,
			duration: PropertyDuration.NIGHT,
		},
		beds: '',
		baths: '',
		available: 'true',
		features: [''],
	});

	const [images, setImages] = useState<EditableImage[]>([]);
	const [video, setVideo] = useState<EditableVideo | null>(null);
	const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Initialize form with property data
	useEffect(() => {
		if (!property) return;

		setFormData({
			title: property.title || '',
			location: property.location || '',
			type: property.type || PropertyTypeValue.SHORT_LET,
			price: {
				amount: property.price?.amount.toString() || '',
				currency: property.price?.currency || PropertyCurrency.NGN,
				duration: property.price?.duration || PropertyDuration.NIGHT,
			},
			beds: property.beds.toString() || '',
			baths: property.baths.toString() || '',
			available: String(property.available) ?? 'true',
			features: property.features?.length ? property.features : [''],
		});

		// Initialize images - show existing ones and mark them as not deleted
		const existingImages = [...property.images]
			.sort((a, b) => a.order - b.order)
			.map((img) => ({
				publicId: img.publicId,
				url: img.url,
				placeholderUrl: img.placeholderUrl,
				order: img.order,
				isDeleted: false, // Explicitly mark as not deleted
			}));
		setImages(existingImages);

		existingImages.forEach((img) => {
			const imgElement = new Image();
			imgElement.src = img.url;
			imgElement.onload = () => {
				setLoadedImages((prev) => new Set(prev).add(img.publicId || img.url));
			};
		});

		if (property.video) {
			setVideo({
				publicId: property.video.publicId,
				url: property.video.url,
				placeholderUrl: property.video.placeholderUrl,
			});
		}

		setLoadedImages(new Set());
	}, [property]);

	const handleImageLoad = (imageId: string) => {
		setLoadedImages((prev) => new Set(prev).add(imageId));
	};

	const getImageSrc = (img: EditableImage) => {
		// For newly uploaded files, just use the object URL
		if (img.file) {
			return img.url;
		}

		// For existing images, use placeholder until loaded
		const imageId = img.publicId || img.url;
		if (loadedImages.has(imageId)) {
			return img.url;
		}

		// Use placeholder (blur/low-res version)
		return img.placeholderUrl || img.url;
	};

	// Add lazy loading class to images
	const getImageClasses = (img: EditableImage) => {
		const imageId = img.publicId || img.url;
		const baseClasses = 'h-full w-full object-cover transition-all duration-300';

		if (img.file) {
			// Newly uploaded images don't need lazy loading
			return baseClasses;
		}

		if (loadedImages.has(imageId)) {
			return `${baseClasses} opacity-100`;
		}

		return `${baseClasses} opacity-50 blur-sm`;
	};

	// Drag-and-drop for images
	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const reordered = Array.from(images);
		const [moved] = reordered.splice(result.source.index, 1);
		reordered.splice(result.destination.index, 0, moved);

		setImages(reordered.map((img, index) => ({ ...img, order: index })));
	};

	// Form changes
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
		} else if (name === 'available') {
			// Handle available as string for boolean
			setFormData((prev) => ({
				...prev,
				[name]: (e.target as HTMLInputElement).checked ? 'true' : 'false',
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleFeatureChange = (index: number, value: string) => {
		const newFeatures = [...formData.features];
		newFeatures[index] = value;
		setFormData((prev) => ({ ...prev, features: newFeatures }));
	};

	const addFeatureField = () => setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
	const removeFeatureField = (index: number) => {
		if (formData.features.length <= 1) return;
		const newFeatures = formData.features.filter((_, i) => i !== index);
		setFormData((prev) => ({ ...prev, features: newFeatures }));
	};

	const normalizeProperty = (source: any) => ({
		title: source.title?.trim() ?? '',
		location: source.location?.trim() ?? '',
		type: source.type ?? '',
		beds: Number(source.beds),
		baths: Number(source.baths),
		available: Boolean(source.available),
		price: {
			amount: Number(source.price?.amount),
			currency: source.price?.currency,
			duration: source.price?.duration,
		},
		features: (source.features ?? []).filter(Boolean),
	});

	const hasPropertyChanged = (formData: any, property: any) => {
		const normalizedForm = normalizeProperty(formData);
		const normalizedProperty = normalizeProperty(property);

		// Check if form fields differ OR images/video have been modified
		const imagesChanged = images.some((img) => img.file || img.isDeleted);
		const videoChanged = video?.file || (video === null && property.video);

		return (
			imagesChanged ||
			videoChanged ||
			normalizedForm.title !== normalizedProperty.title ||
			normalizedForm.location !== normalizedProperty.location ||
			normalizedForm.type !== normalizedProperty.type ||
			normalizedForm.beds !== normalizedProperty.beds ||
			normalizedForm.baths !== normalizedProperty.baths ||
			normalizedForm.available !== normalizedProperty.available ||
			normalizedForm.price.amount !== normalizedProperty.price.amount ||
			normalizedForm.price.currency !== normalizedProperty.price.currency ||
			normalizedForm.price.duration !== normalizedProperty.price.duration ||
			normalizedForm.features.length !== normalizedProperty.features.length ||
			normalizedForm.features.some((f: string, i: number) => f !== normalizedProperty.features[i])
		);
	};

	const deleteImage = (index: number) => {
		const imageToDelete = images[index];

		if (imageToDelete.publicId) {
			// Mark existing image as deleted
			setImages((prev) => prev.map((img, i) => (i === index ? { ...img, isDeleted: true } : img)));
		} else {
			// Remove new image that hasn't been uploaded yet
			setImages((prev) => prev.filter((_, i) => i !== index));
		}
	};

	const deleteVideo = () => {
		if (video?.publicId) {
			// Keep the video object but mark it for deletion
			setVideo((prev) => (prev ? { ...prev, isDeleted: true } : null));
		} else {
			// Remove new video that hasn't been uploaded yet
			setVideo(null);
		}
	};

	const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const imageFiles: File[] = [];
		let videoFile: File | null = null;

		// Separate images and video
		Array.from(files).forEach((file) => {
			if (file.type.startsWith('video/')) {
				if (videoFile) {
					setError('Only one video can be uploaded');
					return;
				}
				videoFile = file;
			} else if (file.type.startsWith('image/')) {
				imageFiles.push(file);
			}
		});

		// Add new images
		if (imageFiles.length > 0) {
			const newImages: EditableImage[] = imageFiles.map((file, index) => ({
				file,
				url: URL.createObjectURL(file),
				order: images.length + index,
			}));

			setImages((prev) => [...prev.filter((img) => !img.isDeleted), ...newImages]);
		}

		// Set new video (replaces existing one)
		if (videoFile) {
			setVideo({
				file: videoFile,
				url: URL.createObjectURL(videoFile),
			});
		}

		e.target.value = '';
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			if (!property?._id) throw new Error('Property ID is required');

			if (!hasPropertyChanged(formData, property)) {
				onClose();
				return;
			}

			const { backEndUrl } = configurations.envs;
			const accessToken = await getCookie(ADMIN_COOKIE_NAME);
			if (!accessToken) {
				push(configurations.urls.Admin.SignIn + '?redirect=' + encodeURIComponent(pathname));
				return;
			}

			const formDataToSend = new FormData();

			// Append updated fields
			if (formData.title !== property.title) formDataToSend.append('title', formData.title);
			if (formData.location !== property.location) formDataToSend.append('location', formData.location);
			if (formData.type !== property.type) formDataToSend.append('type', formData.type);
			if (Number(formData.beds) !== property.beds) formDataToSend.append('beds', formData.beds);
			if (Number(formData.baths) !== property.baths) formDataToSend.append('baths', formData.baths);
			if (formData.available.toString() !== property.available.toString()) {
				formDataToSend.append('available', `${formData.available}`);
			}

			formDataToSend.append('price[amount]', formData.price.amount);
			formDataToSend.append('price[currency]', formData.price.currency);
			formDataToSend.append('price[duration]', formData.price.duration);
			formDataToSend.append('features', JSON.stringify(formData.features.filter((f) => f.trim() !== '')));

			// Handle images
			const imagesWithFiles = images.filter((img) => img.file && !img.isDeleted); // Only images that have actual files
			const imagesToReplace = imagesWithFiles
				.filter((img) => img.publicId) // These are existing images being replaced
				.map((img) => img.publicId!);

			// Validate max 3 images after changes
			const nonDeletedImages = images.filter((img) => !img.isDeleted);
			if (nonDeletedImages.length > 3) {
				throw new Error('Maximum of 3 images allowed');
			}

			// Check if we'll have at least one image after all changes
			const existingNonDeletedImages = images.filter((img) => img.publicId && !img.isDeleted && !img.file);
			const totalImagesAfterUpdate = existingNonDeletedImages.length + imagesWithFiles.length;

			if (totalImagesAfterUpdate === 0) {
				throw new Error('Property must have at least one image');
			}

			// Add images (in order) - ONLY if we have files to upload
			if (imagesWithFiles.length > 0) {
				imagesWithFiles
					.sort((a, b) => a.order - b.order)
					.forEach((img) => {
						formDataToSend.append('images', img.file!);
					});

				// Add replaceImages if replacing specific images
				if (imagesToReplace.length > 0) {
					formDataToSend.append('replaceImages', JSON.stringify(imagesToReplace));
				}
			}

			// Handle video - ONLY if there's a file to upload
			if (video?.file) {
				formDataToSend.append('video', video.file);
			}

			const url = isAdmin ? `${backEndUrl}/property/${property._id}` : `${backEndUrl}/property/${property._id}/user`;

			const response = await fetch(url, {
				method: 'PATCH',
				headers: { Authorization: `Bearer ${accessToken.value}` },
				body: formDataToSend,
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to update property');
			}

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
			type: PropertyTypeValue.SHORT_LET,
			price: { amount: '', currency: PropertyCurrency.NGN, duration: PropertyDuration.NIGHT },
			beds: '',
			baths: '',
			available: 'true',
			features: [''],
		});
		setImages([]);
		setVideo(null);
		setError(null);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	// Filter out deleted images for display
	const displayImages = images.filter((img) => !img.isDeleted);

	if (!isOpen || !property) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold text-gray-900">Edit Property</h2>
							<p className="text-sm text-gray-500 mt-1">Update the details of your property</p>
						</div>
						<button
							onClick={handleClose}
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
								<option value="Short-let">Short-let</option>
								<option value="Long-stay">Long-stay</option>
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
										checked={formData.available === 'true'}
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
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Currency *</label>
							<select
								name="price.currency"
								value={formData.price.currency}
								onChange={handleInputChange}
								disabled={isSubmitting}
								className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50">
								<option value={PropertyCurrency.NGN}>Naira (₦)</option>
								<option value={PropertyCurrency.USD}>Dollar ($)</option>
							</select>
						</div>

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
					{/* Media Upload */}
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<label className="block text-sm font-medium text-gray-700">Property Media</label>
							<button
								type="button"
								onClick={triggerFileInput}
								disabled={isSubmitting}
								className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50">
								<Plus className="w-4 h-4" />
								Add Media
							</button>
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

						{/* Video Section */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-gray-700">Video</h3>
								{video && !video.isDeleted && (
									<button
										type="button"
										onClick={deleteVideo}
										disabled={isSubmitting}
										className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50">
										Remove Video
									</button>
								)}
							</div>

							{video && !video.isDeleted ? (
								<div className="relative">
									{video.placeholderUrl && !loadedImages.has(video.publicId || video.url) ? (
										// Show placeholder with loading indicator
										<div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
											<img
												src={video.placeholderUrl}
												alt="Video placeholder"
												className="w-full h-full object-cover opacity-50"
											/>
											<div className="absolute inset-0 flex items-center justify-center">
												<Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
											</div>
										</div>
									) : (
										// Show actual video
										<video
											src={video.url}
											controls
											className="w-full h-48 object-cover rounded-lg"
											onLoadedData={() => handleImageLoad(video.publicId || video.url)}
											preload="metadata"
										/>
									)}
								</div>
							) : (
								<div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg">
									<p className="text-gray-500">No video uploaded</p>
								</div>
							)}
						</div>

						{/* Images Section */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium text-gray-700">Images ({displayImages.length} of 3 max)</h3>
								{displayImages.length > 0 && <p className="text-xs text-gray-500">Drag to reorder</p>}
							</div>

							{displayImages.length === 0 ? (
								<div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
									<p className="text-gray-500">No images uploaded</p>
								</div>
							) : (
								<DragDropContext onDragEnd={handleDragEnd}>
									<Droppable
										droppableId="images"
										direction="horizontal">
										{(provided) => (
											<div
												className="flex flex-wrap gap-3"
												ref={provided.innerRef}
												{...provided.droppableProps}>
												{displayImages.map((img, index) => (
													<Draggable
														key={img.publicId || `new-${index}`}
														draggableId={img.publicId || `new-${index}`}
														index={index}>
														{(provided, snapshot) => {
															const imageId = img.publicId || img.url;
															const isLoaded = loadedImages.has(imageId);

															return (
																<div
																	ref={provided.innerRef}
																	{...provided.draggableProps}
																	{...provided.dragHandleProps}
																	className={`relative h-32 w-32 rounded-lg overflow-hidden cursor-move border ${
																		snapshot.isDragging ? 'border-amber-500' : 'border-gray-300'
																	}`}>
																	{/* Loading indicator for existing images */}
																	{!isLoaded && !img.file && (
																		<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
																			<Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
																		</div>
																	)}

																	<img
																		src={getImageSrc(img)}
																		alt={`Property image ${index + 1}`}
																		className={getImageClasses(img)}
																		onLoad={() => handleImageLoad(imageId)}
																		loading="lazy"
																	/>
																	<button
																		type="button"
																		onClick={() => deleteImage(index)}
																		className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 shadow hover:bg-red-50 transition z-10">
																		<Trash2 className="w-4 h-4" />
																	</button>
																</div>
															);
														}}
													</Draggable>
												))}
												{provided.placeholder}
											</div>
										)}
									</Droppable>
								</DragDropContext>
							)}
						</div>
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={handleClose}
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
									<Loader2 className="w-4 h-4 animate-spin" /> Updating...
								</>
							) : (
								<>Update Property</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

// <div className="space-y-6">
// 	<div className="flex items-center justify-between">
// 		<label className="block text-sm font-medium text-gray-700">Property Media</label>
// 		<button
// 			type="button"
// 			onClick={triggerFileInput}
// 			disabled={isSubmitting}
// 			className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition disabled:opacity-50">
// 			<Plus className="w-4 h-4" />
// 			Add Media
// 		</button>
// 	</div>

// 	<input
// 		ref={fileInputRef}
// 		type="file"
// 		accept="image/*,video/*"
// 		multiple
// 		onChange={handleMediaChange}
// 		className="hidden"
// 		disabled={isSubmitting}
// 	/>

// 	{/* Video Section */}
// 	<div className="space-y-3">
// 		<div className="flex items-center justify-between">
// 			<h3 className="text-sm font-medium text-gray-700">Video</h3>
// 			{video && !video.isDeleted && (
// 				<button
// 					type="button"
// 					onClick={deleteVideo}
// 					disabled={isSubmitting}
// 					className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50">
// 					Remove Video
// 				</button>
// 			)}
// 		</div>

// 		{video && !video.isDeleted ? (
// 			<div className="relative">
// 				<video
// 					src={video.url}
// 					controls
// 					className="w-full h-48 object-cover rounded-lg"
// 				/>
// 			</div>
// 		) : (
// 			<div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg">
// 				<p className="text-gray-500">No video uploaded</p>
// 			</div>
// 		)}
// 	</div>

// 	{/* Images Section */}
// 	<div className="space-y-3">
// 		<div className="flex items-center justify-between">
// 			<h3 className="text-sm font-medium text-gray-700">Images ({displayImages.length} of 3 max)</h3>
// 			{displayImages.length > 0 && <p className="text-xs text-gray-500">Drag to reorder</p>}
// 		</div>

// 		{displayImages.length === 0 ? (
// 			<div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
// 				<p className="text-gray-500">No images uploaded</p>
// 			</div>
// 		) : (
// 			<DragDropContext onDragEnd={handleDragEnd}>
// 				<Droppable
// 					droppableId="images"
// 					direction="horizontal">
// 					{(provided) => (
// 						<div
// 							className="flex flex-wrap gap-3"
// 							ref={provided.innerRef}
// 							{...provided.droppableProps}>
// 							{displayImages.map((img, index) => (
// 								<Draggable
// 									key={img.publicId || `new-${index}`}
// 									draggableId={img.publicId || `new-${index}`}
// 									index={index}>
// 									{(provided, snapshot) => (
// 										<div
// 											ref={provided.innerRef}
// 											{...provided.draggableProps}
// 											{...provided.dragHandleProps}
// 											className={`relative h-32 w-32 rounded-lg overflow-hidden cursor-move border ${
// 												snapshot.isDragging ? 'border-amber-500' : 'border-gray-300'
// 											}`}>
// 											<img
// 												src={img.url}
// 												alt={`Property image ${index + 1}`}
// 												className="h-full w-full object-cover"
// 											/>
// 											<button
// 												type="button"
// 												onClick={() => deleteImage(index)}
// 												className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-600 shadow hover:bg-red-50 transition">
// 												<Trash2 className="w-4 h-4" />
// 											</button>
// 										</div>
// 									)}
// 								</Draggable>
// 							))}
// 							{provided.placeholder}
// 						</div>
// 					)}
// 				</Droppable>
// 			</DragDropContext>
// 		)}
// 	</div>
// </div>
