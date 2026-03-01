"use client";

import * as React from "react";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  value: string; // ISO string format: yyyy-MM-dd'T'HH:mm
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Chọn ngày giờ",
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse the value to get date and time parts
  const dateValue = value ? new Date(value) : undefined;
  const timeValue = dateValue ? format(dateValue, "HH:mm") : "00:00";

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      date.setHours(hours, minutes, 0, 0);
      onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (dateValue) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(dateValue);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"));
    } else {
      // If no date selected, use today
      const today = new Date();
      const [hours, minutes] = newTime.split(":").map(Number);
      today.setHours(hours, minutes, 0, 0);
      onChange(format(today, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  // Quick date buttons
  const setToday = () => {
    const now = new Date();
    const [hours, minutes] = timeValue.split(":").map(Number);
    now.setHours(hours, minutes, 0, 0);
    onChange(format(now, "yyyy-MM-dd'T'HH:mm"));
  };

  const setYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const [hours, minutes] = timeValue.split(":").map(Number);
    yesterday.setHours(hours, minutes, 0, 0);
    onChange(format(yesterday, "yyyy-MM-dd'T'HH:mm"));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? (
            format(dateValue, "HH:mm dd/MM/yyyy", { locale: vi })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={setYesterday}
              className="flex-1"
            >
              Hôm qua
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setToday}
              className="flex-1"
            >
              Hôm nay
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm text-muted-foreground">Giờ:</Label>
            <Input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="w-[120px]"
            />
          </div>
        </div>
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleDateSelect}
          locale={vi}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
