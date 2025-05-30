import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { enUS, fr, type Locale } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
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
	dateFormat = "yyyy-MM-dd",
}: DateRangePickerProps) {
	const [fromDate, setFromDate] = React.useState<Date | undefined>(defaultFromDate)
	const [toDate, setToDate] = React.useState<Date | undefined>(defaultToDate)
	const [fromInputValue, setFromInputValue] = React.useState<string>(
		defaultFromDate ? format(defaultFromDate, dateFormat) : ""
	)
	const [toInputValue, setToInputValue] = React.useState<string>(
		defaultToDate ? format(defaultToDate, dateFormat) : ""
	)

	// Get the locale object from the map, fallback to enUS if not found
	const selectedLocale = localeMap[locale] || enUS

	const handleFromDateChange = (date: Date | undefined) => {
		setFromDate(date)
		setFromInputValue(date ? format(date, dateFormat) : "")
		if (onFromChange) {
			onFromChange(date)
		}

		// If to date is before from date, reset to date
		if (date && toDate && toDate < date) {
			setToDate(undefined)
			setToInputValue("")
			if (onToChange) {
				onToChange(undefined)
			}
		}
	}

	const handleToDateChange = (date: Date | undefined) => {
		// Validate that to date is not before from date
		if (date && fromDate && date < fromDate) {
			return // Don't update if invalid
		}
		
		setToDate(date)
		setToInputValue(date ? format(date, dateFormat) : "")
		if (onToChange) {
			onToChange(date)
		}
	}

	const handleFromInputChange = (value: string) => {
		setFromInputValue(value)
		
		const parsedDate = parse(value, dateFormat, new Date())
		
		if (isValid(parsedDate) && (!minDate || parsedDate >= minDate) && (!maxDate || parsedDate <= maxDate)) {
			setFromDate(parsedDate)
			if (onFromChange) {
				onFromChange(parsedDate)
			}

			if (toDate && toDate < parsedDate) {
				setToDate(undefined)
				setToInputValue("")
				if (onToChange) {
					onToChange(undefined)
				}
			}
		} else if (value === "") {
			setFromDate(undefined)
			if (onFromChange) {
				onFromChange(undefined)
			}
		}
	}

	const handleToInputChange = (value: string) => {
		setToInputValue(value)
		
		const parsedDate = parse(value, dateFormat, new Date())
		
		if (isValid(parsedDate) && 
			(!minDate || parsedDate >= minDate) && 
			(!maxDate || parsedDate <= maxDate) &&
			(!fromDate || parsedDate >= fromDate)) {
			setToDate(parsedDate)
			if (onToChange) {
				onToChange(parsedDate)
			}
		} else if (value === "") {
			setToDate(undefined)
			if (onToChange) {
				onToChange(undefined)
			}
		}
	}

	// Format date with the selected locale for display
	const formatDate = (date: Date) => {
		return format(date, "PPP", { locale: selectedLocale })
	}

	const generateYearOptions = () => {
		const currentYear = new Date().getFullYear()
		const startYear = minDate ? minDate.getFullYear() : 1840
		const endYear = maxDate ? maxDate.getFullYear() : currentYear
		
		const years = []
		for (let year = endYear; year >= startYear; year--) {
			years.push(year)
		}
		return years
	}

	const CalendarWithDropdowns = ({ selected, onSelect, defaultMonth, isToDate = false }: any) => {
		const [currentMonth, setCurrentMonth] = React.useState(defaultMonth || new Date())
		const years = generateYearOptions()
		const months = Array.from({ length: 12 }, (_, i) => i)

		const handleYearChange = (year: number) => {
			const newDate = new Date(currentMonth)
			newDate.setFullYear(year)
			setCurrentMonth(newDate)
			
			// If there's a selected date, update it to the new year while keeping day/month
			if (selected) {
				const updatedDate = new Date(selected)
				updatedDate.setFullYear(year)
				// Check if the updated date is valid and within bounds
				if ((!minDate || updatedDate >= minDate) && (!maxDate || updatedDate <= maxDate)) {
					onSelect(updatedDate)
				}
			}
		}

		const handleMonthChange = (month: number) => {
			const newDate = new Date(currentMonth)
			newDate.setMonth(month)
			setCurrentMonth(newDate)
			
			// If there's a selected date, update it to the new month while keeping day/year
			if (selected) {
				const updatedDate = new Date(selected)
				updatedDate.setMonth(month)
				// Check if the updated date is valid and within bounds
				if ((!minDate || updatedDate >= minDate) && (!maxDate || updatedDate <= maxDate)) {
					onSelect(updatedDate)
				}
			}
		}

		return (
			<div className="space-y-4">
				<div className="flex space-x-2 px-3">
					<select 
						className="flex-1 px-2 py-1 border rounded text-sm bg-white text-black"
						value={currentMonth.getMonth()}
						onChange={(e) => handleMonthChange(parseInt(e.target.value))}
					>
						{months.map(month => (
							<option key={month} value={month}>
								{format(new Date(2024, month, 1), "MMMM", { locale: selectedLocale })}
							</option>
						))}
					</select>
					<select 
						className="flex-1 px-2 py-1 border rounded text-sm bg-white text-black"
						value={currentMonth.getFullYear()}
						onChange={(e) => handleYearChange(parseInt(e.target.value))}
					>
						{years.map(year => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
				</div>
				<Calendar
					key={`${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
					mode="single"
					selected={selected}
					onSelect={onSelect}
					month={currentMonth}
					onMonthChange={setCurrentMonth}
					locale={selectedLocale}
					disabled={(date) => {
						if (minDate && date < minDate) return true
						if (maxDate && date > maxDate) return true
						// For "to" date calendar, disable dates before "from" date
						if (isToDate && fromDate && date < fromDate) return true
						return false
					}}
				/>
			</div>
		)
	}

	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
				<div className="flex flex-col space-y-2 w-full sm:w-1/2">
					<label htmlFor="from-date-input" className="text-sm font-medium">
						{__('From Date')}
					</label>
					<div className="flex space-x-2">
						<Input
							id="from-date-input"
							type="text"
							placeholder={dateFormat.toLowerCase()}
							value={fromInputValue}
							onChange={(e) => handleFromInputChange(e.target.value)}
							className="flex-1"
						/>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="shrink-0"
								>
									<CalendarIcon className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<CalendarWithDropdowns
									selected={fromDate}
									onSelect={handleFromDateChange}
									defaultMonth={fromDate || minDate || new Date()}
								/>
							</PopoverContent>
						</Popover>
					</div>
					{fromDate && (
						<p className="text-xs text-muted-foreground">
							{formatDate(fromDate)}
						</p>
					)}
				</div>

				<div className="flex flex-col space-y-2 w-full sm:w-1/2">
					<label htmlFor="to-date-input" className="text-sm font-medium">
						{__('To Date')}
					</label>
					<div className="flex space-x-2">
						<Input
							id="to-date-input"
							type="text"
							placeholder={dateFormat.toLowerCase()}
							value={toInputValue}
							onChange={(e) => handleToInputChange(e.target.value)}
							className="flex-1"
						/>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="shrink-0"
								>
									<CalendarIcon className="h-4 w-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<CalendarWithDropdowns
								selected={toDate}
								onSelect={handleToDateChange}
								defaultMonth={toDate || fromDate || minDate || new Date()}
								 isToDate={true}
							/>
							</PopoverContent>
						</Popover>
					</div>
					{toDate && (
						<p className="text-xs text-muted-foreground">
							{formatDate(toDate)}
						</p>
					)}
				</div>
			</div>
		</div>
	)
}
