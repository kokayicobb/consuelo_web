"use client"

import * as React from "react"
import { Check, ChevronDown, Command } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "../ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command"



interface FormDropdownProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  disabled?: boolean
  required?: boolean
}

export function FormDropdown({
  label,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
}: FormDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [isValid, setIsValid] = React.useState(!required)

  React.useEffect(() => {
    setIsValid(required ? value !== "" : true)
  }, [value, required])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !isValid && "border-red-500"
          )}
          disabled={disabled}
        >
          {value || label}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option}
                onSelect={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
      {!isValid && (
        <p className="text-xs text-red-500 mt-1">This field is required</p>
      )}
    </Popover>
  )
}

