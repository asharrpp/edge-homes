'use client';
import 'react-datepicker/dist/react-datepicker.css';

import { Calendar, CheckCircle, Filter, Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { toast } from 'sonner';

import { revalidateTagAction } from '@/actions/revalidate-action';
import { configurations } from '@/config';
import { getCookie } from '@/lib/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/constants';
import { RevalidateTags } from '@/lib/enums';
import { FormStatus } from '@/lib/types';

interface BookingsHeaderProps {}

export function BookingsHeader({}: BookingsHeaderProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const [formStatus, setFormStatus] = useState<FormStatus>('idle');
	const [errorMessage, setErrorMessage] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
	const [formData, setFormData] = useState({ name: '', email: '', CheckInDate: '', CheckOutDate: '', phone: '' });
	const [propertySearch, setPropertySearch] = useState(searchParams.get('search') || '');
	const [propertyNameSearch, setPropertyNameSearch] = useState(searchParams.get('search') || '');
	const [propertyResults, setPropertyResults] = useState<any[]>([]);
	const [isSearchingProperties, setIsSearchingProperties] = useState(false);

	useEffect(() => {
		const shouldOpenModal = searchParams.get('add-booking');

		if (shouldOpenModal === 'true') {
			setIsModalOpen(true);

			// remove the query param so refreshes don’t re-open the modal
			const params = new URLSearchParams(searchParams.toString());
			params.delete('add-booking');

			const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

			router.push(newUrl);
		}
	}, [searchParams, pathname, router]);

	useEffect(() => {
		if (!propertyNameSearch || propertyNameSearch.trim().length < 2) {
			setPropertyResults([]);
			return;
		}

		const controller = new AbortController();
		const timeout = setTimeout(async () => {
			try {
				setIsSearchingProperties(true);

				const { backEndUrl } = configurations.envs;
				const res = await fetch(`${backEndUrl}/property?location=${encodeURIComponent(propertyNameSearch)}`, { signal: controller.signal });

				if (!res.ok) throw new Error('Failed to search properties');

				const data = await res.json();
				setPropertyResults(data.properties);
			} catch (err) {
				if ((err as any).name !== 'AbortError') {
					console.error(err);
					setPropertyResults([]);
				}
			} finally {
				setIsSearchingProperties(false);
			}
		}, 1000); // debounce

		return () => {
			controller.abort();
			clearTimeout(timeout);
		};
	}, [propertyNameSearch]);

	const openBooking = () => {
		setFormStatus('idle');
		setErrorMessage([]);
		setSelectedPropertyId('');
		setPropertySearch('');
		setIsModalOpen(true);
	};

	const handleSubmitBooking = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage([]);

		if (!selectedPropertyId) {
			toast.error('Please select a property');
			return;
		}

		try {
			setFormStatus('submitting');
			const { backEndUrl } = configurations.envs;
			const accessToken = await getCookie(ADMIN_COOKIE_NAME);

			if (!accessToken) {
				router.push(configurations.urls.Admin.SignIn + '?redirect=' + encodeURIComponent(pathname));
				return;
			}

			const bookingData = {
				propertyId: selectedPropertyId,
				customerName: formData.name,
				customerEmail: formData.email,
				customerPhone: formData.phone,
				checkInDate: formData.CheckInDate,
				checkOutDate: formData.CheckOutDate,
			};

			const response = await fetch(`${backEndUrl}/bookings`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken.value}` },
				body: JSON.stringify(bookingData),
			});

			const result = await response.json();

			if ('error' in result) {
				const errorMessage = Array.isArray(result.message) ? result.message : [result.message];
				setErrorMessage(errorMessage);
				setFormStatus('error');
				return;
			}

			await revalidateTagAction(RevalidateTags.BOOKINGS);
			setFormData({ name: '', email: '', CheckInDate: '', CheckOutDate: '', phone: '' });
			setIsModalOpen(false);
			setFormStatus('success');
		} catch (error) {
			toast.error('Failed to submit booking');
			setFormStatus('error');
		}
	};

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		const params = new URLSearchParams(searchParams.toString());

		if (propertySearch.trim()) {
			params.set('search', propertySearch.trim());
		} else {
			params.delete('search');
		}

		router.push(`${pathname}?${params.toString()}`);
	};

	const handleStatusFilter = (status: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (status === 'all') {
			params.delete('status');
		} else {
			params.set('status', status);
		}
		router.push(`/admin/bookings?${params.toString()}`);
	};

	const activeFilter = searchParams.get('status') || 'all';

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
					<p className="text-gray-500 mt-2">View and manage all property bookings</p>
				</div>

				<div className="flex items-center space-x-4">
					{/* <button
						onClick={openBooking}
						className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition">
						<Plus className="w-5 h-5" />
						<span>New Booking</span>
					</button> */}
				</div>
			</div>

			{/* Search and Filters */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					{/* Search Form */}
					<form
						onSubmit={handleSearch}
						className="flex-1">
						<div className="relative max-w-md">
							<Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
							<input
								value={propertySearch}
								onChange={(e) => setPropertySearch(e.target.value)}
								placeholder="Search bookings..."
								className="w-full pl-12 pr-28 py-3 border border-amber-600 outline-amber-600 rounded-lg text-black"
							/>
							<button className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-600 text-white px-4 py-1.5 rounded-md cursor-pointer">Search</button>
						</div>
					</form>

					{/* Filter Buttons */}
					<div className="flex items-center space-x-2">
						<Filter className="w-5 h-5 text-gray-400" />
						<div className="flex bg-gray-100 p-1 rounded-lg">
							{[
								{ value: 'all', label: 'All' },
								{ value: 'pending', label: 'Pending' },
								{ value: 'confirmed', label: 'Confirmed' },
								{ value: 'cancelled', label: 'Cancelled' },
							].map((filter) => (
								<button
									key={filter.value}
									onClick={() => handleStatusFilter(filter.value)}
									className={`px-4 py-2 text-sm font-medium rounded-md transition ${
										activeFilter === filter.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
									}`}>
									{filter.label}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>

			{isModalOpen && (
				<section className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
					<div className="bg-white rounded-2xl max-w-lg w-full p-8 relative">
						<button
							onClick={() => setIsModalOpen(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
							<X className="w-6 h-6" />
						</button>

						{formStatus === 'success' ? (
							<div className="text-center py-10">
								<div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
									<CheckCircle className="w-8 h-8" />
								</div>
								<h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Received!</h3>
								<p className="text-gray-500">
									Thank you. Our team will contact you shortly to confirm your stay at <span className="font-bold text-gray-900">{/* {selectedProp?.title} */}</span>.
								</p>
								<button
									onClick={() => setIsModalOpen(false)}
									className="mt-6 text-amber-600 font-medium hover:underline">
									Close Window
								</button>
							</div>
						) : (
							<>
								<h3 className="text-2xl font-bold text-center text-gray-900 mb-1">Book Your Stay</h3>
								<form
									onSubmit={handleSubmitBooking}
									className={`space-y-4 ${formStatus === 'submitting' ? 'opacity-60 pointer-events-none' : ''}`}>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
										<input
											required
											type="text"
											placeholder="John Doe"
											className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
										<input
											required
											type="text"
											placeholder="813456789"
											className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
											onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
										<input
											required
											type="email"
											placeholder="johndoe@gmail.com"
											className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Search Property (title or location)</label>

										<input
											type="text"
											value={propertyNameSearch}
											onChange={(e) => setPropertyNameSearch(e.target.value)}
											placeholder="e.g. Lekki, 2-bedroom, Ikoyi"
											className="w-full p-3 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
										/>

										{isSearchingProperties && <p className="text-sm text-gray-400 mt-1">Searching…</p>}

										{propertyNameSearch.length > 1 && propertyResults.length === 0 && <p className="text-sm text-gray-400 mt-1">Search for a building</p>}

										{propertyResults.length > 0 && (
											<ul className="border border-gray-200 rounded-lg mt-2 max-h-48 overflow-y-auto">
												{propertyResults.map((property) => (
													<li
														key={property._id}
														onClick={() => {
															setSelectedPropertyId(property._id);
															setPropertyNameSearch(`${property.title} (${property.location})`);
															setPropertyResults([]);
														}}
														className="p-3 hover:bg-amber-50 cursor-pointer border-b last:border-b-0">
														<p className="font-medium text-gray-900">{property.title}</p>
														<p className="text-sm text-gray-500">{property.location}</p>
													</li>
												))}
											</ul>
										)}
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="">
											<DatePicker
												required
												selectsStart
												minDate={new Date()}
												placeholderText="Check-in"
												className="w-full p-3 border border-gray-300 text-black rounded-lg"
												selected={formData.CheckInDate ? new Date(formData.CheckInDate) : null}
												startDate={formData.CheckInDate ? new Date(formData.CheckInDate) : null}
												endDate={formData.CheckOutDate ? new Date(formData.CheckOutDate) : null}
												onChange={(date: any) => setFormData({ ...formData, CheckInDate: date?.toISOString() || '' })}
											/>
										</div>

										<div className="">
											<DatePicker
												required
												selectsStart
												placeholderText="Check-out"
												className="w-full p-3 border border-gray-300 text-black rounded-lg"
												minDate={formData.CheckInDate ? new Date(formData.CheckInDate) : new Date()}
												selected={formData.CheckOutDate ? new Date(formData.CheckOutDate) : null}
												startDate={formData.CheckOutDate ? new Date(formData.CheckOutDate) : null}
												endDate={formData.CheckOutDate ? new Date(formData.CheckOutDate) : null}
												onChange={(date: any) => setFormData({ ...formData, CheckOutDate: date?.toISOString() || '' })}
											/>
										</div>
									</div>

									<div className="">
										{formStatus === 'error' &&
											errorMessage.length > 0 &&
											errorMessage.map((message) => (
												<p
													key={message}
													className="text-center text-red-500">
													{message}
												</p>
											))}
									</div>

									<button
										type="submit"
										disabled={!selectedPropertyId || formStatus === 'submitting'}
										className={`w-full bg-gray-900 hover:bg-amber-600 text-white font-bold py-4 rounded-lg transition duration-300 mt-4 flex justify-center items-center ${!selectedPropertyId || formStatus === 'submitting' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
										{formStatus === 'submitting' ? 'Processing…' : 'Confirm Booking Request'}
									</button>
								</form>
							</>
						)}
					</div>
				</section>
			)}
		</div>
	);
}
