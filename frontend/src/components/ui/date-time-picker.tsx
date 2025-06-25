import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateTimePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function DateTimePicker({
  date,
  onDateChange,
  disabled = false,
  placeholder = "Pick a date and time",
  className
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState(
    date ? format(date, "HH:mm") : "09:00"
  )

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Parse the time and combine with the selected date
      const [hours, minutes] = timeValue.split(':').map(Number)
      const newDate = new Date(selectedDate)
      newDate.setHours(hours, minutes, 0, 0)
      onDateChange?.(newDate)
    } else {
      onDateChange?.(undefined)
    }
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    if (date) {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      onDateChange?.(newDate)
    }
  }

  // Update time value when date prop changes
  React.useEffect(() => {
    if (date) {
      setTimeValue(format(date, "HH:mm"))
    }
  }, [date])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            <span>{format(date, "PPP 'at' HH:mm")}</span>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="border-b border-border p-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <Label htmlFor="time" className="text-sm font-medium">
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
} 