"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CreatableComboboxProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function CreatableCombobox({
  options,
  value,
  onChange,
  placeholder = "Select or create...",
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const handleSelect = (currentValue: string) => {
    onChange(currentValue)
    setOpen(false)
  }

  const showCreateOption =
    search.trim() !== "" &&
    !options.some(
      (option) => option.label.toLowerCase() === search.trim().toLowerCase()
    )

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setSearch("");
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or create a category..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {/* This message shows only when there are no items AND we are not about to create a new one */}
              {!showCreateOption && "No category found."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreateOption && (
                <CommandGroup>
                    <CommandItem
                        value={search}
                        onSelect={handleSelect}
                        className="text-muted-foreground cursor-pointer"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create "{search.trim()}"
                    </CommandItem>
                </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
