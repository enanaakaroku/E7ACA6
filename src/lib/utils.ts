import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const lengthUnitList = [
	"px",
	"em",
	"rem",
	"%",
	"vw",
	"vh",
	"vmin",
	"vmax",
	"cm",
	"mm",
	"in",
	"pt",
	"pc",
	"ex",
	"ch",
];
