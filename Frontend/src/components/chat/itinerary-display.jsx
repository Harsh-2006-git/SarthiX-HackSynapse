import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, Landmark, Wallet, MapPin, Calendar, Clock, Star, Car, Home as HomeIcon, Sparkles } from "lucide-react";
import ItinerarySkeleton from "./itinerary-skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ItineraryDisplay({
  itinerary,
  isLoading,
  error
}) {
  if (isLoading) {
    return /*#__PURE__*/_jsx(ItinerarySkeleton, {});
  }
  if (error) {
    return /*#__PURE__*/_jsx("div", {
      className: "h-full flex items-center justify-center p-8 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-red-100",
      children: /*#__PURE__*/_jsxs(Alert, {
        variant: "destructive",
        className: "border-none bg-transparent",
        children: [/*#__PURE__*/_jsx(AlertCircle, {
          className: "h-6 w-6"
        }), /*#__PURE__*/_jsx(AlertTitle, {
          className: "text-xl font-bold",
          children: "Divine Interruption"
        }), /*#__PURE__*/_jsx(AlertDescription, {
          className: "text-base font-medium opacity-80",
          children: error
        })]
      })
    });
  }
  if (itinerary) {
    const departureDate = new Date(itinerary.departureDate.replace(/-/g, '/'));
    const arrivalDate = new Date(itinerary.arrivalDate.replace(/-/g, '/'));
    return /*#__PURE__*/_jsxs("div", {
      className: "space-y-8 pb-8 animate-fade-in-up",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "relative overflow-hidden rounded-3xl md:rounded-[2rem] bg-slate-900 p-5 md:p-8 text-white shadow-2xl",
        children: [/*#__PURE__*/_jsx("div", {
          className: "absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"
        }), /*#__PURE__*/_jsx("div", {
          className: "absolute bottom-0 left-0 w-64 h-64 bg-red-600/20 rounded-full blur-[80px]"
        }), /*#__PURE__*/_jsxs("div", {
          className: "relative z-10",
          children: [/*#__PURE__*/_jsxs("div", {
            className: "flex items-center gap-3 mb-4",
            children: [/*#__PURE__*/_jsx("div", {
              className: "bg-orange-500/20 p-2 rounded-lg backdrop-blur-md",
              children: /*#__PURE__*/_jsx(Star, {
                className: "h-5 w-5 text-orange-400 fill-orange-400"
              })
            }), /*#__PURE__*/_jsx("span", {
              className: "text-xs font-black uppercase tracking-[0.2em] text-orange-200",
              children: "Personalized Journey"
            })]
          }), /*#__PURE__*/_jsx("h1", {
            className: "text-2xl md:text-5xl font-black mb-6 leading-tight tracking-tight",
            children: itinerary.title
          }), /*#__PURE__*/_jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 border-t border-white/10",
            children: [/*#__PURE__*/_jsxs("div", {
              className: "space-y-1",
              children: [/*#__PURE__*/_jsx("p", {
                className: "text-[10px] font-black uppercase text-slate-400 tracking-wider",
                children: "Destination"
              }), /*#__PURE__*/_jsxs("p", {
                className: "font-bold text-sm md:text-base flex items-center gap-2",
                children: [/*#__PURE__*/_jsx(MapPin, {
                  className: "h-4 w-4 text-orange-500"
                }), " ", itinerary.destination]
              })]
            }), /*#__PURE__*/_jsxs("div", {
              className: "space-y-1",
              children: [/*#__PURE__*/_jsx("p", {
                className: "text-[10px] font-black uppercase text-slate-400 tracking-wider",
                children: "Dates"
              }), /*#__PURE__*/_jsxs("p", {
                className: "font-bold text-sm md:text-base flex items-center gap-2",
                children: [/*#__PURE__*/_jsx(Calendar, {
                  className: "h-4 w-4 text-orange-500"
                }), " ", format(departureDate, "MMM d"), " - ", format(arrivalDate, "MMM d")]
              })]
            }), /*#__PURE__*/_jsxs("div", {
              className: "space-y-1",
              children: [/*#__PURE__*/_jsx("p", {
                className: "text-[10px] font-black uppercase text-slate-400 tracking-wider",
                children: "Group Size"
              }), /*#__PURE__*/_jsxs("p", {
                className: "font-bold text-sm md:text-base",
                children: [itinerary.numberOfPeople, " Traveler(s)"]
              })]
            }), /*#__PURE__*/_jsxs("div", {
              className: "space-y-1",
              children: [/*#__PURE__*/_jsx("p", {
                className: "text-[10px] font-black uppercase text-slate-400 tracking-wider",
                children: "Budget Style"
              }), /*#__PURE__*/_jsxs("p", {
                className: "font-bold text-sm md:text-base",
                children: [itinerary.budget, " \u2022 ", itinerary.style]
              })]
            })]
          })]
        })]
      }),
      /* Detailed Schedule Section */
      /*#__PURE__*/_jsxs("div", {
        className: "bg-white rounded-3xl md:rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between",
          children: [/*#__PURE__*/_jsx("h3", {
            className: "font-bold text-slate-800 text-lg",
            children: "Detailed Schedule"
          }), /*#__PURE__*/_jsxs("div", {
            className: "flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest",
            children: [/*#__PURE__*/_jsx(Clock, {
              className: "h-3 w-3"
            }), " Hourly Breakdown"]
          })]
        }), /*#__PURE__*/_jsx(Accordion, {
          type: "single",
          collapsible: true,
          className: "w-full",
          defaultValue: "day-1",
          children: itinerary.daily_plan.sort((a, b) => a.day - b.day).map(day => /*#__PURE__*/_jsxs(AccordionItem, {
            value: `day-${day.day}`,
            className: "border-none px-4 md:px-6",
            children: [/*#__PURE__*/_jsx(AccordionTrigger, {
              className: "py-6 hover:no-underline group",
              children: /*#__PURE__*/_jsxs("div", {
                className: "flex items-center gap-4 w-full text-left",
                children: [/*#__PURE__*/_jsxs("div", {
                  className: "h-12 w-12 rounded-2xl bg-orange-100 flex flex-col items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all",
                  children: [/*#__PURE__*/_jsx("span", {
                    className: "text-[10px] font-black leading-none uppercase",
                    children: "Day"
                  }), /*#__PURE__*/_jsx("span", {
                    className: "text-xl font-black leading-none",
                    children: day.day
                  })]
                }), /*#__PURE__*/_jsxs("div", {
                  className: "flex-1",
                  children: [/*#__PURE__*/_jsx("h4", {
                    className: "font-bold text-lg text-slate-800 group-hover:text-orange-600 transition-colors",
                    children: "Daily Immersion"
                  }), /*#__PURE__*/_jsxs("p", {
                    className: "text-sm font-medium text-slate-400",
                    children: [day.activities.length, " Sacred Activities Planned"]
                  })]
                }), /*#__PURE__*/_jsx("div", {
                  className: "pr-4 block",
                  children: /*#__PURE__*/_jsxs("div", {
                    className: "text-right",
                    children: [/*#__PURE__*/_jsx("p", {
                      className: "text-[8px] md:text-[10px] font-black text-slate-300 uppercase",
                      children: "Est. Cost"
                    }), /*#__PURE__*/_jsx("p", {
                      className: "text-xs md:text-base font-bold text-slate-700",
                      children: day.estimated_cost
                    })]
                  })
                })]
              })
            }), /*#__PURE__*/_jsx(AccordionContent, {
              className: "pb-8 pt-2",
              children: /*#__PURE__*/_jsxs("div", {
                className: "grid gap-8 lg:grid-cols-3",
                children: [/*#__PURE__*/_jsxs("div", {
                  className: "lg:col-span-2 space-y-4",
                  children: [/*#__PURE__*/_jsxs("h5", {
                    className: "flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400",
                    children: [/*#__PURE__*/_jsx(Sparkles, {
                      className: "h-3 w-3 text-orange-500"
                    }), " Activities & Rituals"]
                  }), /*#__PURE__*/_jsx("div", {
                    className: "grid gap-3",
                    children: day.activities.map((activity, i) => /*#__PURE__*/_jsxs("div", {
                      className: "flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group/item",
                      children: [/*#__PURE__*/_jsx("div", {
                        className: "h-2 w-2 rounded-full bg-orange-500 mt-2 shrink-0 group-hover/item:scale-150 transition-all"
                      }), /*#__PURE__*/_jsx("p", {
                        className: "text-sm font-medium text-slate-700",
                        children: activity
                      })]
                    }, i))
                  })]
                }), /*#__PURE__*/_jsxs("div", {
                  className: "space-y-6",
                  children: [day.accommodation && /*#__PURE__*/_jsxs("div", {
                    className: "bg-orange-50/50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-orange-100",
                    children: [/*#__PURE__*/_jsxs("h5", {
                      className: "flex items-center gap-2 font-black text-xs uppercase tracking-widest text-orange-600 mb-4",
                      children: [/*#__PURE__*/_jsx(HomeIcon, {
                        className: "h-3 w-3"
                      }), " Stay"]
                    }), /*#__PURE__*/_jsxs("div", {
                      className: "space-y-1",
                      children: [/*#__PURE__*/_jsx("p", {
                        className: "font-bold text-slate-800 text-base",
                        children: day.accommodation.name
                      }), /*#__PURE__*/_jsxs("div", {
                        className: "flex items-center gap-3 text-sm font-medium text-slate-500",
                        children: [day.accommodation.rating && /*#__PURE__*/_jsxs("span", {
                          className: "flex items-center gap-1",
                          children: [/*#__PURE__*/_jsx(Star, {
                            className: "h-3 w-3 text-yellow-500 fill-yellow-500"
                          }), " ", day.accommodation.rating]
                        }), day.accommodation.price && /*#__PURE__*/_jsx("span", {
                          children: day.accommodation.price
                        })]
                      })]
                    })]
                  }), /*#__PURE__*/_jsxs("div", {
                    className: "bg-slate-50 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100",
                    children: [/*#__PURE__*/_jsxs("h5", {
                      className: "flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400 mb-4",
                      children: [/*#__PURE__*/_jsx(Car, {
                        className: "h-3 w-3"
                      }), " Transit"]
                    }), /*#__PURE__*/_jsx("div", {
                      className: "space-y-4",
                      children: day.transportation_options.map((t, i) => /*#__PURE__*/_jsxs("div", {
                        className: "space-y-1",
                        children: [/*#__PURE__*/_jsx("p", {
                          className: "text-sm font-bold text-slate-800",
                          children: t.mode
                        }), /*#__PURE__*/_jsx("p", {
                          className: "text-xs font-medium text-slate-500",
                          children: t.details
                        }), /*#__PURE__*/_jsx("p", {
                          className: "text-[10px] font-black text-orange-600 uppercase",
                          children: t.price
                        })]
                      }, i))
                    })]
                  })]
                })]
              })
            })]
          }, day.day))
        })]
      }),
      /* Total Investment Banner - MOVED TO BOTTOM PER USER REQUEST */
      /*#__PURE__*/_jsxs("div", {
        className: "glass p-5 md:p-8 rounded-3xl md:rounded-[2rem] border-orange-200/50 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl mt-8",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "flex items-center gap-4 w-full",
          children: [/*#__PURE__*/_jsx("div", {
            className: "h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg shrink-0",
            children: /*#__PURE__*/_jsx(Wallet, {
              className: "h-7 w-7 text-orange-500"
            })
          }), /*#__PURE__*/_jsxs("div", {
            children: [/*#__PURE__*/_jsx("p", {
              className: "text-[10px] font-black uppercase tracking-widest text-slate-400",
              children: "Total Investment"
            }), /*#__PURE__*/_jsx("h3", {
              className: "text-xl md:text-3xl font-black text-slate-800 leading-tight",
              children: itinerary.total_estimated_cost
            })]
          })]
        }), /*#__PURE__*/_jsx("div", {
          className: "w-full md:max-w-md",
          children: /*#__PURE__*/_jsxs("p", {
            className: "text-sm font-medium text-slate-500 italic leading-relaxed text-left md:text-right italic",
            children: ["\"", itinerary.notes || 'May your journey be filled with divine light and infinite peace.', "\""]
          })
        })]
      }),
]
    });
  }
  return /*#__PURE__*/_jsxs("div", {
    className: "h-full flex flex-col items-center justify-center p-12 text-center animate-pulse",
    children: [/*#__PURE__*/_jsxs("div", {
      className: "relative w-32 h-32 mb-8",
      children: [/*#__PURE__*/_jsx("div", {
        className: "absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-pulse"
      }), /*#__PURE__*/_jsx("div", {
        className: "relative h-full w-full rounded-full border-2 border-orange-100 flex items-center justify-center",
        children: /*#__PURE__*/_jsx(Landmark, {
          className: "h-12 w-12 text-orange-500"
        })
      }), /*#__PURE__*/_jsx("div", {
        className: "absolute top-0 right-0 h-4 w-4 bg-orange-600 rounded-full animate-orbit"
      })]
    }), /*#__PURE__*/_jsx("h2", {
      className: "text-3xl font-black text-slate-800 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent",
      children: "Awaiting Your Command"
    }), /*#__PURE__*/_jsx("p", {
      className: "text-slate-400 font-medium max-w-sm mx-auto leading-relaxed",
      children: "The stars are aligning for your sacred journey. Start a conversation or use the form to manifest your itinerary."
    })]
  });
}