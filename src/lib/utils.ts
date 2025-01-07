import { ElementBoxStyle } from "@/components/inspector/declare";
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

export const borderStyles = [
	"none", // 无边框
	"solid", // 实线边框
	"dashed", // 虚线边框
	"dotted", // 点状边框
	"double", // 双实线边框
	"groove", // 3D 凹槽边框（根据背景颜色）
	"ridge", // 3D 脊状边框（根据背景颜色）
	"inset", // 3D 内嵌边框（根据背景颜色）
	"outset", // 3D 外凸边框（根据背景颜色）
	"hidden", // 隐藏边框（与 `none` 类似，但用于表格元素时有特殊意义）
];

export const borderRadiusUnits = ["px", "em", "rem", "%", "cm", "mm", "in", "pt", "pc"];

export const editingStyleList: Array<keyof ElementBoxStyle> = [
	"width",
	"height",
	"marginLeft",
	"marginTop",
	"marginRight",
	"marginBottom",
	"paddingLeft",
	"paddingTop",
	"paddingRight",
	"paddingBottom",
	"borderLeftWidth",
	"borderLeftStyle",
	"borderLeftColor",
	"borderRightWidth",
	"borderRightStyle",
	"borderRightColor",
	"borderTopWidth",
	"borderTopStyle",
	"borderTopColor",
	"borderBottomWidth",
	"borderBottomStyle",
	"borderBottomColor",
	"borderTopLeftRadius",
	"borderTopRightRadius",
	"borderBottomLeftRadius",
	"borderBottomRightRadius",
];
