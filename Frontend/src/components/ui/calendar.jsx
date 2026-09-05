"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2 bg-white", className)}
      classNames={{
        months: "text-slate-800",
        caption_label: "text-sm font-bold text-slate-900",
        button_previous: "hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-md transition-colors",
        button_next: "hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-md transition-colors",
        weekday: "text-slate-500 font-medium text-[0.8rem] pb-2",
        day_button: "hover:bg-slate-100 hover:text-slate-900 text-slate-800 rounded-md transition-colors w-9 h-9 flex items-center justify-center font-medium",
        selected: "bg-orange-600 text-white hover:bg-orange-700 hover:text-white focus:bg-orange-600 focus:text-white font-bold rounded-md",
        today: "bg-orange-50 text-orange-900 font-bold outline-1 outline-orange-200 rounded-md",
        outside: "text-slate-400 opacity-50",
        disabled: "text-slate-300 opacity-50 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };