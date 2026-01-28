import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Loading() {
	return (
		<main className="w-full min-h-screen flex flex-col items-center justify-center">
			<LoadingSpinner />
		</main>
	);
}
