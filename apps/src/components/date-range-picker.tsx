import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { enUS, fr, type Locale } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { __ } from '@/context/locale-provider';

// Map of supported locales
const localeMap: { [key: string]: Locale } = {
	"en-US": enUS,
	fr: fr,
}

interface DateRangePickerProps {
	className?: string
	onFromChange?: (date: Date | undefined) => void
	onToChange?: (date: Date | undefined) => void
	defaultFromDate?: Date
	defaultToDate?: Date
	minDate?: Date
	maxDate?: Date
	locale?: string
	dateFormat?: string
}

export function DateRangePicker({
	className,
	onFromChange,
	onToChange,
	defaultFromDate,
	defaultToDate,
	minDate,
	maxDate,
	locale = "en",
	dateFormat = "PPP",
}: DateRangePickerProps) {
	const [fromDate, setFromDate] = React.useState<Date | undefined>(defaultFromDate)
	const [toDate, setToDate] = React.useState<Date | undefined>(defaultToDate)

	// Get the locale object from the map, fallback to enUS if not found
	const selectedLocale = localeMap[locale] || enUS

	const handleFromDateChange = (date: Date | undefined) => {
		setFromDate(date)
		if (onFromChange) {
			onFromChange(date)
		}

		// If to date is before from date, reset to date
		if (date && toDate && toDate < date) {
			setToDate(undefined)
			if (onToChange) {
				onToChange(undefined)
			}
		}
	}

	const handleToDateChange = (date: Date | undefined) => {
		setToDate(date)
		if (onToChange) {
			onToChange(date)
		}
	}

	// Format date with the selected locale
	const formatDate = (date: Date) => {
		return format(date, dateFormat, { locale: selectedLocale })
	}

	return (
		<div className={cn("flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0", className)}>
			<div className="flex flex-col space-y-2 w-full sm:w-1/2">
				<label htmlFor="from-date" className="sr-only">From</label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							id="from-date"
							variant={"outline"}
							className={cn("w-full justify-start text-left font-normal", !fromDate && "text-muted-foreground")}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{fromDate ? formatDate(fromDate) : <span>{__('Select date')}</span>}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={fromDate}
							onSelect={handleFromDateChange}
							initialFocus
							defaultMonth={fromDate}
							locale={selectedLocale}
							disabled={(date) => {
								// Disable dates outside min/max range
								if (minDate && date < minDate) return true
								if (maxDate && date > maxDate) return true
								return false
							}}
						/>
					</PopoverContent>
				</Popover>
			</div>

			<div className="flex flex-col space-y-2 w-full sm:w-1/2">
				<label htmlFor="to-date" className="sr-only">To</label>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							id="to-date"
							variant={"outline"}
							className={cn("w-full justify-start text-left font-normal", !toDate && "text-muted-foreground")}
							disabled={!fromDate}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{toDate ? formatDate(toDate) : <span>{__('Select date')}</span>}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							mode="single"
							selected={toDate}
							onSelect={handleToDateChange}
							defaultMonth={toDate || fromDate}
							locale={selectedLocale}
							disabled={(date) => {
								// Disable dates before the from date
								if (fromDate && date < fromDate) return true
								// Disable dates outside min/max range
								if (minDate && date < minDate) return true
								if (maxDate && date > maxDate) return true
								return false
							}}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	)
}
