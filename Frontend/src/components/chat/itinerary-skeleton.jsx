import { Skeleton } from "../ui/skeleton";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ItinerarySkeleton() {
  return /*#__PURE__*/_jsxs("div", {
    className: "space-y-8 animate-pulse",
    children: [/*#__PURE__*/_jsxs("div", {
      className: "rounded-[2rem] bg-slate-100 h-64 w-full p-8 flex flex-col justify-end gap-6",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "space-y-2",
        children: [/*#__PURE__*/_jsx(Skeleton, {
          className: "h-4 w-24 bg-slate-200"
        }), /*#__PURE__*/_jsx(Skeleton, {
          className: "h-12 w-3/4 bg-slate-200"
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "grid grid-cols-2 md:grid-cols-4 gap-6",
        children: [/*#__PURE__*/_jsx(Skeleton, {
          className: "h-10 w-full bg-slate-200"
        }), /*#__PURE__*/_jsx(Skeleton, {
          className: "h-10 w-full bg-slate-200"
        }), /*#__PURE__*/_jsx(Skeleton, {
          className: "h-10 w-full bg-slate-200"
        }), /*#__PURE__*/_jsx(Skeleton, {
          className: "h-10 w-full bg-slate-200"
        })]
      })]
    }), /*#__PURE__*/_jsxs("div", {
      className: "bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "p-6 border-b border-slate-50 flex justify-between items-center",
        children: [/*#__PURE__*/_jsx(Skeleton, {
          className: "h-6 w-32"
        }), /*#__PURE__*/_jsx(Skeleton, {
          className: "h-4 w-24"
        })]
      }), [...Array(3)].map((_, index) => /*#__PURE__*/_jsxs("div", {
        className: "p-6 border-b border-slate-50 flex gap-4 items-center",
        children: [/*#__PURE__*/_jsx(Skeleton, {
          className: "h-12 w-12 rounded-2xl shrink-0"
        }), /*#__PURE__*/_jsxs("div", {
          className: "flex-1 space-y-2",
          children: [/*#__PURE__*/_jsx(Skeleton, {
            className: "h-5 w-40"
          }), /*#__PURE__*/_jsx(Skeleton, {
            className: "h-3 w-64"
          })]
        }), /*#__PURE__*/_jsx(Skeleton, {
          className: "h-8 w-20 rounded-lg hidden md:block"
        })]
      }, index))]
    })]
  });
}