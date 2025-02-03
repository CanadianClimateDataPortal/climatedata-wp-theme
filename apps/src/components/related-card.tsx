import { useI18n } from '@wordpress/react-i18n';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { RelatedCardProps } from '@/types/types';

export function RelatedCard({ data }: RelatedCardProps): JSX.Element {
	const { __ } = useI18n();

	return (
		<div className="flex flex-col space-y-4 w-full max-w-md mx-auto">
			<Card key={data.id} className="w-full">
				<CardHeader>
					<CardTitle>{data.title}</CardTitle>
				</CardHeader>
				<CardContent>
					<Button asChild className="w-full">
						<a href={data.url}>
							{__('Climate Data')}
							<span className="sr-only">{data.title}</span>
						</a>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
