import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const lengthUnitsList = ['px', 'cm', 'mm', 'in', 'pt', 'pc', '%,', 'em', 'rem', 'vw', 'vh', 'vmin', 'vmax', 'ch', 'ex', 'lh']