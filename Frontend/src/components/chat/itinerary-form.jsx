"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "../../lib/utils";
import { Bot, Calendar as CalendarIcon, Loader2, MapPin, Users, Wallet, Sparkles, Languages } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const formSchema = z.object({
  origin: z.string().min(2, "Please enter a valid starting location"),
  destination: z.string().min(2, "Please enter a valid destination"),
  departureDate: z.date({
    required_error: "Departure date is required"
  }),
  arrivalDate: z.date({
    required_error: "Arrival date is required"
  }),
  numberOfPeople: z.string().min(1, "At least 1 person"),
  budget: z.string().min(2, "Please specify a budget style"),
  style: z.string().min(2, "Please specify a travel style"),
  language: z.enum(["Hindi", "English"])
}).refine(data => data.arrivalDate >= data.departureDate, {
  message: "Arrival date must be after departure date",
  path: ["arrivalDate"]
});
export default function ItineraryForm({
  onSubmit,
  isLoading
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: "",
      destination: "",
      numberOfPeople: "1",
      budget: "Modest",
      style: "Peaceful",
      language: "Hindi"
    }
  });
  const onFormSubmit = values => {
    const formattedValues = {
      ...values,
      numberOfPeople: parseInt(values.numberOfPeople, 10)
    };
    onSubmit(formattedValues);
  };
  const departureDate = form.watch("departureDate");
  return /*#__PURE__*/_jsxs("div", {
    className: "bg-white p-6 sm:p-8",
    children: [/*#__PURE__*/_jsxs("div", {
      className: "mb-8",
      children: [/*#__PURE__*/_jsx("h3", {
        className: "text-2xl font-black text-slate-800 mb-2",
        children: "Sacred Intentions"
      }), /*#__PURE__*/_jsx("p", {
        className: "text-sm font-medium text-slate-400",
        children: "Define your pilgrimage parameters"
      })]
    }), /*#__PURE__*/_jsx(Form, {
      ...form,
      children: /*#__PURE__*/_jsxs("form", {
        onSubmit: form.handleSubmit(onFormSubmit),
        className: "space-y-6",
        children: [/*#__PURE__*/_jsx(FormField, {
          control: form.control,
          name: "language",
          render: ({
            field
          }) => /*#__PURE__*/_jsxs(FormItem, {
            className: "space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100",
            children: [/*#__PURE__*/_jsxs("div", {
              className: "flex items-center gap-2 mb-2",
              children: [/*#__PURE__*/_jsx(Languages, {
                className: "h-4 w-4 text-orange-500"
              }), /*#__PURE__*/_jsx(FormLabel, {
                className: "text-xs font-black uppercase tracking-widest text-slate-400",
                children: "Response Language"
              })]
            }), /*#__PURE__*/_jsx(FormControl, {
              children: /*#__PURE__*/_jsxs(RadioGroup, {
                onValueChange: field.onChange,
                defaultValue: field.value,
                className: "flex items-center space-x-6",
                disabled: isLoading,
                children: [/*#__PURE__*/_jsxs(FormItem, {
                  className: "flex items-center space-x-2 space-y-0",
                  children: [/*#__PURE__*/_jsx(FormControl, {
                    children: /*#__PURE__*/_jsx(RadioGroupItem, {
                      value: "Hindi",
                      className: "border-orange-200 text-orange-600 focus:ring-orange-500"
                    })
                  }), /*#__PURE__*/_jsx(FormLabel, {
                    className: "font-bold text-sm text-slate-700",
                    children: "\u0939\u093F\u0902\u0926\u0940 (Hindi)"
                  })]
                }), /*#__PURE__*/_jsxs(FormItem, {
                  className: "flex items-center space-x-2 space-y-0",
                  children: [/*#__PURE__*/_jsx(FormControl, {
                    children: /*#__PURE__*/_jsx(RadioGroupItem, {
                      value: "English",
                      className: "border-orange-200 text-orange-600 focus:ring-orange-500"
                    })
                  }), /*#__PURE__*/_jsx(FormLabel, {
                    className: "font-bold text-sm text-slate-700",
                    children: "English"
                  })]
                })]
              })
            }), /*#__PURE__*/_jsx(FormMessage, {})]
          })
        }), /*#__PURE__*/_jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4",
          children: [/*#__PURE__*/_jsx(FormField, {
            control: form.control,
            name: "origin",
            render: ({
              field
            }) => /*#__PURE__*/_jsxs(FormItem, {
              children: [/*#__PURE__*/_jsx(FormLabel, {
                className: "text-[10px] font-black uppercase text-slate-400 tracking-widest",
                children: "Starting Point"
              }), /*#__PURE__*/_jsx(FormControl, {
                children: /*#__PURE__*/_jsxs("div", {
                  className: "relative",
                  children: [/*#__PURE__*/_jsx(MapPin, {
                    className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300"
                  }), /*#__PURE__*/_jsx(Input, {
                    placeholder: "e.g., Mumbai",
                    className: "pl-10 h-12 rounded-xl border-slate-100 focus:border-orange-500/50 bg-slate-50/50 font-medium",
                    ...field
                  })]
                })
              }), /*#__PURE__*/_jsx(FormMessage, {})]
            })
          }), /*#__PURE__*/_jsx(FormField, {
            control: form.control,
            name: "destination",
            render: ({
              field
            }) => /*#__PURE__*/_jsxs(FormItem, {
              children: [/*#__PURE__*/_jsx(FormLabel, {
                className: "text-[10px] font-black uppercase text-slate-400 tracking-widest",
                children: "Holy Destination"
              }), /*#__PURE__*/_jsx(FormControl, {
                children: /*#__PURE__*/_jsxs("div", {
                  className: "relative",
                  children: [/*#__PURE__*/_jsx(MapPin, {
                    className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400"
                  }), /*#__PURE__*/_jsx(Input, {
                    placeholder: "e.g., Ujjain",
                    className: "pl-10 h-12 rounded-xl border-slate-100 focus:border-orange-500/50 bg-slate-50/50 font-medium",
                    ...field
                  })]
                })
              }), /*#__PURE__*/_jsx(FormMessage, {})]
            })
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4",
          children: [/*#__PURE__*/_jsx(FormField, {
            control: form.control,
            name: "departureDate",
            render: ({
              field
            }) => /*#__PURE__*/_jsxs(FormItem, {
              className: "flex flex-col",
              children: [/*#__PURE__*/_jsx(FormLabel, {
                className: "text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5",
                children: "Arrival (Start)"
              }), /*#__PURE__*/_jsxs(Popover, {
                modal: true,
                children: [/*#__PURE__*/_jsx(PopoverTrigger, {
                  asChild: true,
                  children: /*#__PURE__*/_jsx(FormControl, {
                    children: /*#__PURE__*/_jsxs(Button, {
                      variant: "outline",
                      className: cn("w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 pl-3 text-left font-medium", !field.value && "text-slate-400"),
                      children: [/*#__PURE__*/_jsx(CalendarIcon, {
                        className: "mr-2 h-4 w-4 text-slate-300"
                      }), field.value ? format(field.value, "PPP") : "Select date"]
                    })
                  })
                }), /*#__PURE__*/_jsx(PopoverContent, {
                  className: "w-auto p-0",
                  align: "start",
                  children: /*#__PURE__*/_jsx(Calendar, {
                    mode: "single",
                    selected: field.value,
                    onSelect: field.onChange,
                    disabled: date => date < new Date(new Date().setHours(0, 0, 0, 0))
                  })
                })]
              }), /*#__PURE__*/_jsx(FormMessage, {})]
            })
          }), /*#__PURE__*/_jsx(FormField, {
            control: form.control,
            name: "arrivalDate",
            render: ({
              field
            }) => /*#__PURE__*/_jsxs(FormItem, {
              className: "flex flex-col",
              children: [/*#__PURE__*/_jsx(FormLabel, {
                className: "text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5",
                children: "Departure (End)"
              }), /*#__PURE__*/_jsxs(Popover, {
                modal: true,
                children: [/*#__PURE__*/_jsx(PopoverTrigger, {
                  asChild: true,
                  children: /*#__PURE__*/_jsx(FormControl, {
                    children: /*#__PURE__*/_jsxs(Button, {
                      variant: "outline",
                      className: cn("w-full h-12 rounded-xl border-slate-100 bg-slate-50/50 pl-3 text-left font-medium", !field.value && "text-slate-400"),
                      children: [/*#__PURE__*/_jsx(CalendarIcon, {
                        className: "mr-2 h-4 w-4 text-slate-300"
                      }), field.value ? format(field.value, "PPP") : "Select date"]
                    })
                  })
                }), /*#__PURE__*/_jsx(PopoverContent, {
                  className: "w-auto p-0",
                  align: "start",
                  children: /*#__PURE__*/_jsx(Calendar, {
                    mode: "single",
                    selected: field.value,
                    onSelect: field.onChange,
                    disabled: date => departureDate ? date <= departureDate : date < new Date(new Date().setHours(0, 0, 0, 0))
                  })
                })]
              }), /*#__PURE__*/_jsx(FormMessage, {})]
            })
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "grid grid-cols-1 md:grid-cols-2 gap-4",
          children: [/*#__PURE__*/_jsx(FormField, {
            control: form.control,
            name: "numberOfPeople",
            render: ({
              field
            }) => /*#__PURE__*/_jsxs(FormItem, {
              children: [/*#__PURE__*/_jsx(FormLabel, {
                className: "text-[10px] font-black uppercase text-slate-400 tracking-widest",
                children: "Travelers"
              }), /*#__PURE__*/_jsx(FormControl, {
                children: /*#__PURE__*/_jsxs("div", {
                  className: "relative",
                  children: [/*#__PURE__*/_jsx(Users, {
                    className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300"
                  }), /*#__PURE__*/_jsx(Input, {
                    type: "number",
                    min: "1",
                    className: "pl-10 h-12 rounded-xl border-slate-100 bg-slate-50/50 font-medium",
                    ...field
                  })]
                })
              }), /*#__PURE__*/_jsx(FormMessage, {})]
            })
          }), /*#__PURE__*/_jsx(FormField, {
            control: form.control,
            name: "budget",
            render: ({
              field
            }) => /*#__PURE__*/_jsxs(FormItem, {
              children: [/*#__PURE__*/_jsx(FormLabel, {
                className: "text-[10px] font-black uppercase text-slate-400 tracking-widest",
                children: "Financial Style"
              }), /*#__PURE__*/_jsx(FormControl, {
                children: /*#__PURE__*/_jsxs("div", {
                  className: "relative",
                  children: [/*#__PURE__*/_jsx(Wallet, {
                    className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300"
                  }), /*#__PURE__*/_jsx(Input, {
                    placeholder: "e.g., Luxury, Modest",
                    className: "pl-10 h-12 rounded-xl border-slate-100 bg-slate-50/50 font-medium",
                    ...field
                  })]
                })
              }), /*#__PURE__*/_jsx(FormMessage, {})]
            })
          })]
        }), /*#__PURE__*/_jsx(FormField, {
          control: form.control,
          name: "style",
          render: ({
            field
          }) => /*#__PURE__*/_jsxs(FormItem, {
            children: [/*#__PURE__*/_jsx(FormLabel, {
              className: "text-[10px] font-black uppercase text-slate-400 tracking-widest",
              children: "Journey Intent (Style)"
            }), /*#__PURE__*/_jsx(FormControl, {
              children: /*#__PURE__*/_jsxs("div", {
                className: "relative",
                children: [/*#__PURE__*/_jsx(Sparkles, {
                  className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400"
                }), /*#__PURE__*/_jsx(Input, {
                  placeholder: "e.g., Peaceful, Historical, Devotional",
                  className: "pl-10 h-12 rounded-xl border-slate-100 bg-slate-50/50 font-medium",
                  ...field
                })]
              })
            }), /*#__PURE__*/_jsx(FormMessage, {})]
          })
        }), /*#__PURE__*/_jsxs(Button, {
          type: "submit",
          className: "w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg hover:shadow-orange-500/20 text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95",
          disabled: isLoading,
          children: [isLoading ? /*#__PURE__*/_jsx(Loader2, {
            className: "mr-3 h-5 w-5 animate-spin"
          }) : /*#__PURE__*/_jsx(Bot, {
            className: "mr-3 h-5 w-5"
          }), isLoading ? "Consulting AI..." : "Manifest Itinerary"]
        })]
      })
    })]
  });
}