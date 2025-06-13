import React, { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"

interface TimeSlot {
  time: string
  formatted?: string
}

interface SchedulingButtonsProps {
  availableSlots: TimeSlot[]
  onTimeSelect: (time: string) => void
  onBookingSubmit: (bookingData: any) => void
  selectedTime?: string
  isLoading?: boolean
}

export default function SchedulingButtons({
  availableSlots,
  onTimeSelect,
  onBookingSubmit,
  selectedTime,
  isLoading = false,
}: SchedulingButtonsProps) {
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  })

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: { [key: string]: TimeSlot[] } = {}
    availableSlots.forEach(slot => {
      const date = new Date(slot.time)
      const dateKey = date.toISOString().split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(slot)
    })
    return grouped
  }, [availableSlots])

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days: (number | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    
    return days
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateKey = date.toISOString().split('T')[0]
    setSelectedDate(dateKey)
  }

  const handleTimeSelect = (time: string) => {
    onTimeSelect(time)
    setShowBookingForm(true)
  }

  const handleFormSubmit = () => {
    if (!selectedTime || !formData.name || !formData.email) return

    onBookingSubmit({
      ...formData,
      startTime: selectedTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
  }

  const formatTimeOnly = (timeString: string): string => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return "Invalid Time"
    }
  }

  const monthYearString = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + direction)
    setCurrentMonth(newMonth)
  }

  // Booking form view
  if (showBookingForm && selectedTime) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Book Your Consultation</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            <span>{new Date(selectedTime).toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Business"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tell us about your funding needs
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="What type of financing are you looking for?"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowBookingForm(false)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleFormSubmit}
              disabled={isLoading || !formData.name || !formData.email}
              className="flex-1 px-3 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-300"
            >
              {isLoading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Time selection view
  if (selectedDate && slotsByDate[selectedDate]) {
    const daySlots = slotsByDate[selectedDate]
    const selectedDateObj = new Date(selectedDate)
    const dateString = selectedDateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })

    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-lg p-4">
        <button
          onClick={() => setSelectedDate(null)}
          className="mb-3 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to calendar
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-1">{dateString}</h3>
        <p className="text-sm text-gray-600 mb-4">Select an available time</p>

        <div className="grid grid-cols-3 gap-2">
          {daySlots.map((slot, index) => {
            const timeString = formatTimeOnly(slot.time)
            
            return (
              <button
                key={index}
                onClick={() => handleTimeSelect(slot.time)}
                className="p-3 bg-white border border-gray-200 rounded-md hover:border-gray-400 transition-colors text-center"
                disabled={timeString === "Invalid Time"}
              >
                <span className="text-sm text-gray-900 font-medium">{timeString}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Calendar view
  const calendarDays = getCalendarDays()
  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Select a Date</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
            {monthYearString}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="aspect-square" />
          }

          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          const dateKey = date.toISOString().split('T')[0]
          const hasSlots = slotsByDate[dateKey] && slotsByDate[dateKey].length > 0
          const isToday = dateKey === todayKey
          const isPast = date < today && !isToday

          return (
            <button
              key={index}
              onClick={() => hasSlots ? handleDateSelect(day) : null}
              disabled={!hasSlots || isPast}
              className={`
                aspect-square flex items-center justify-center rounded-md text-sm
                transition-all relative
                ${hasSlots && !isPast
                  ? "bg-gray-50 hover:bg-gray-100 text-gray-900 cursor-pointer"
                  : "text-gray-300 cursor-not-allowed"
                }
                ${isToday ? "ring-2 ring-gray-900" : ""}
              `}
            >
              {day}
              {hasSlots && !isPast && (
                <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-gray-900 rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {availableSlots.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          <p className="text-sm">No available times found.</p>
          <p className="text-xs mt-1">Please try again later or contact us directly.</p>
        </div>
      )}
    </div>
  )
}