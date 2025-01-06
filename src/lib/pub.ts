import { ElementBoxStyle } from "@/components/inspector/declare";
import { camelCase, capitalize, startCase } from "lodash";

export function generateRandomId() {
	return `${Math.random().toString(36).slice(2, 11)}`;
}

export function setElementsKey(list: HTMLElement[]) {
	return list.map((v) => {
		if (!v.dataset.key) {
			v.dataset.key = generateRandomId();
		}
		return v;
	});
}
// 获取鼠标在元素中的相对坐标 (包含边框)
export function getMousePositionInElement(event: MouseEvent, element: HTMLElement) {
	const rect = element.getBoundingClientRect();
	return {
		x: event.clientX - rect.left, // 鼠标在元素内的X坐标
		y: event.clientY - rect.top, // 鼠标在元素内的Y坐标
	};
}
export function getMousePositionInElementArea(event: MouseEvent, element: HTMLElement) {
	const { x, y } = getMousePositionInElement(event, element);
	const { offsetWidth: w, offsetHeight: h } = element;
	// 将坐标系转成以元素中心为原点的直角坐标系
	const nx = x - w / 2;
	const ny = -y + h / 2;
	// 对角线系数
	const k = h / w;
	if (nx < 0 && ny > k * nx && ny <= -k * nx) {
		return "l";
	} else if (nx >= 0 && ny >= -k * nx && ny < k * nx) {
		return "r";
	} else if (ny >= 0 && nx > ny / -k && nx <= ny / k) {
		return "t";
	} else {
		return "b";
	}
}
export function insertAfter(newElement: HTMLElement, referenceElement: HTMLElement) {
	const parent = referenceElement.parentElement;
	if (referenceElement.nextSibling) {
		parent?.insertBefore(newElement, referenceElement.nextSibling);
	} else {
		parent?.appendChild(newElement);
	}
}
export function canSetDimensions(element: HTMLElement) {
	const computedStyle = window.getComputedStyle(element);

	// 直接检查不可设置宽高的 inline 元素
	if (computedStyle.display === "inline" && element.tagName !== "IMG") {
		return false;
	}
	return true;
}

export const createResizeHandleElement = () => {
	const span = document.createElement("span");
	span.setAttribute("data-handle-type", "resize");
	span.setAttribute("class", "absolute w-2 h-2 z-10 bg-slate-600 -right-1 -bottom-1 cursor-nwse-resize");
	return span;
};

export const createMoveHandleElement = () => {
	const span = document.createElement("span");
	span.setAttribute("data-handle-type", "move");
	span.setAttribute("class", "absolute w-4 h-2 z-10 bg-slate-600 left-1/2 -top-1 cursor-move");
	return span;
};
// 展示爆炸视图
// 将包含该元素上到最顶层，下到该元素的所有相邻元素，全部展示出来
export const createExplodedHandleElement = () => {
	const span = document.createElement("span");
	span.setAttribute("data-handle-type", "exploded");
	span.setAttribute("class", "absolute w-max h-6 z-10 text-slate-200 bg-slate-600 left-0 top-full cursor-pointer");
	span.innerText = "爆了";
	return span;
};
export const createControlLayer = (element: HTMLElement) => {
	element.classList.add("relative", "border-2");
	const resizeHandle = createResizeHandleElement();
	const moveHandle = createMoveHandleElement();
	const explodedHandle = createExplodedHandleElement();
	element.appendChild(resizeHandle);
	element.appendChild(moveHandle);
	element.appendChild(explodedHandle);
};
export const removeControlLayer = (element: HTMLElement) => {
	element.classList.remove("relative", "border-2");
	const handles = element.querySelectorAll("[data-handle-type]");
	if (handles.length === 0) return;
	handles.forEach((handle) => {
		handle.remove();
	});
};

export const checkRowFlexElement = (element: HTMLElement) => {
	const style = window.getComputedStyle(element);
	return (
		(style.display === "flex" || style.display === "inline-flex") &&
		style.flexDirection !== "column" &&
		style.flexDirection !== "column-reverse"
	);
};
export const insertFlexBoxBeforeElement = (referenceElement: HTMLElement, innerElement: HTMLElement[]) => {
	const div = document.createElement("div");
	div.style.display = "flex";
	if (!referenceElement.parentElement) return;
	referenceElement.parentElement.insertBefore(div, referenceElement);
	for (const el of innerElement) {
		div.appendChild(el);
	}
};

export const resizeHandleEvent = (mouseDownEvent: React.MouseEvent<HTMLElement>, handle: HTMLElement) => {
	const controlingElement = handle.parentElement;
	const startX = mouseDownEvent.clientX;
	const startY = mouseDownEvent.clientY;

	const startWidth = controlingElement?.offsetWidth || 0;
	const startHeight = controlingElement?.offsetHeight || 0;
	console.log(startWidth, startHeight);

	const mouseMove = (mouseMoveEvent: MouseEvent) => {
		if (!controlingElement) return;
		const newWidth = Math.max(0, startWidth + (mouseMoveEvent.clientX - startX));
		const newHeight = Math.max(0, startHeight + (mouseMoveEvent.clientY - startY));
		controlingElement.style.flexShrink = "0";
		controlingElement.style.width = `${newWidth}px`;
		controlingElement.style.height = `${newHeight}px`;
		console.log("=======", newWidth, newHeight);
	};
	const mouseUp = () => {
		document.removeEventListener("mousemove", mouseMove);
		document.removeEventListener("mouseup", mouseUp);
	};

	document.addEventListener("mousemove", mouseMove);
	document.addEventListener("mouseup", mouseUp);
};

export const moveHandleEvent = (mouseDownEvent: React.MouseEvent<HTMLElement>, handle: HTMLElement) => {
	const startX = mouseDownEvent.clientX;
	const startY = mouseDownEvent.clientY;
	const rteContainer = mouseDownEvent.currentTarget;
	const controlingElement = handle.parentElement;
	let lastTargetElement: HTMLElement | null = null;
	let insertArea: "l" | "r" | "t" | "b" | null = null;

	const mouseMove = (mouseMoveEvent: MouseEvent) => {
		if (!controlingElement) return;
		if (!rteContainer) return;

		const mx = mouseMoveEvent.clientX - startX;
		const my = mouseMoveEvent.clientY - startY;
		controlingElement.style.pointerEvents = "none";
		controlingElement.style.translate = `${mx}px ${my}px`;

		const targetElement = mouseMoveEvent.target as HTMLElement;
		// 底下的元素是可编辑块 // move只能移动至同级的元素周围
		targetElement.style.userSelect = "none";
		if (!rteContainer.contains(targetElement) || rteContainer === targetElement) return;
		if (lastTargetElement && lastTargetElement !== targetElement) {
			lastTargetElement.style.backgroundColor = "";
			lastTargetElement.style.border = "";
		}
		const mouseArea = getMousePositionInElementArea(mouseMoveEvent, targetElement);
		insertArea = mouseArea;
		targetElement.style.border = "";
		targetElement.style.backgroundColor = "#cccccc";
		switch (mouseArea) {
			case "l":
				targetElement.style.borderLeft = "2px solid orange";
				break;
			case "r":
				targetElement.style.borderRight = "2px solid orange";
				break;
			case "b":
				targetElement.style.borderBottom = "2px solid orange";
				break;
			case "t":
				targetElement.style.borderTop = "2px solid orange";
				break;
			default:
				console.error("未判定区域");
		}
		lastTargetElement = targetElement;
	};
	const mouseUp = () => {
		if (!controlingElement) return;
		if (!rteContainer) return;
		if (!lastTargetElement) return;
		const referenceElement = lastTargetElement;
		controlingElement.style.pointerEvents = "";
		controlingElement.style.translate = "";
		referenceElement.style.border = "";
		referenceElement.style.backgroundColor = "";
		referenceElement.style.userSelect = "";
		if (!referenceElement.parentElement) return;
		const parentElement = referenceElement.parentElement;
		// 放置规则
		// 在哪边就视觉上放在reference哪边
		// 特殊情况：在flexbox中
		switch (insertArea) {
			case "l":
				if (!checkRowFlexElement(parentElement)) {
					insertFlexBoxBeforeElement(referenceElement, [controlingElement, referenceElement]);
				} else {
					referenceElement.parentElement.insertBefore(controlingElement, referenceElement);
				}
				break;
			case "r":
				if (!checkRowFlexElement(parentElement)) {
					insertFlexBoxBeforeElement(referenceElement, [referenceElement, controlingElement]);
				} else {
					insertAfter(controlingElement, referenceElement);
				}
				break;
			case "b":
				insertAfter(controlingElement, referenceElement);
				break;
			case "t":
				parentElement.insertBefore(controlingElement, referenceElement);
				break;
			default:
				console.error("着陆失败");
		}

		document.removeEventListener("mousemove", mouseMove);
		document.removeEventListener("mouseup", mouseUp);
	};

	document.addEventListener("mousemove", mouseMove);
	document.addEventListener("mouseup", mouseUp);
};

export function getElementStyle(element: HTMLElement) {}

export function decomposeValue(value: string): [number: number | string, unit: string | undefined] {
	// 检查是否是数值 + 单位
	const match = value.match(/^([+-]?\d*\.?\d+)([a-zA-Z%]*)$/);
	if (match) {
		const [_, number, unit] = match;
		return [parseFloat(number), unit || undefined];
	}

	// 如果不是数值，直接返回值作为数组的第一位
	return [value, undefined];
}

export function usedComputedStyle(element: HTMLElement): ElementBoxStyle {
	const style = window.getComputedStyle(element);
	return {
		width: style.width,
		height: style.height,
		marginLeft: style.marginLeft,
		marginTop: style.marginTop,
		marginRight: style.marginRight,
		marginBottom: style.marginBottom,
		paddingLeft: style.paddingLeft,
		paddingTop: style.paddingTop,
		paddingRight: style.paddingRight,
		paddingBottom: style.paddingBottom,
		borderLeftWidth: style.borderLeftWidth,
		borderLeftStyle: style.borderLeftStyle,
		borderLeftColor: rgbToHex(style.borderLeftColor),
		borderRightWidth: style.borderRightWidth,
		borderRightStyle: style.borderRightStyle,
		borderRightColor: rgbToHex(style.borderRightColor),
		borderTopWidth: style.borderTopWidth,
		borderTopStyle: style.borderTopStyle,
		borderTopColor: rgbToHex(style.borderTopColor),
		borderBottomWidth: style.borderBottomWidth,
		borderBottomStyle: style.borderBottomStyle,
		borderBottomColor: rgbToHex(style.borderBottomColor),
		borderTopLeftRadius: style.borderTopLeftRadius,
		borderTopRightRadius: style.borderTopRightRadius,
		borderBottomLeftRadius: style.borderBottomLeftRadius,
		borderBottomRightRadius: style.borderBottomRightRadius,
	};
}

export function kebabToCamel(str: string) {
	return str
		.split("-")
		.map((word, index) => {
			return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join("");
}

export function rgbToHex(rgb: string) {
	// 提取RGB值
	const rgbArr = rgb.match(/\d+/g);
	if (!rgbArr) return rgb;
	let [r, g, b] = rgbArr.map(Number);

	// 转换为Hex格式
	return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
}

// 输入shorthand 输出所有可修改的详细属性
type CSSDetailProperties<T extends "size" | "margin" | "padding" | "border" | "radius"> = T extends "border"
	? {
			label: string;
			id: string;
			width: keyof ElementBoxStyle;
			style: keyof ElementBoxStyle;
			color: keyof ElementBoxStyle;
	  }[]
	: { label: string; id: keyof ElementBoxStyle }[];

export function generateCSSDetailProperties<T extends "size" | "margin" | "padding" | "border" | "radius">(
	type: T
): CSSDetailProperties<T> {
	const map = {
		size: [
			{ label: "Width", id: "width" },
			{ label: "Height", id: "height" },
		],
		margin: [
			{ label: "T", id: "marginTop" },
			{ label: "R", id: "marginRight" },
			{ label: "B", id: "marginBottom" },
			{ label: "L", id: "marginLeft" },
		],
		padding: [
			{ label: "T", id: "paddingTop" },
			{ label: "R", id: "paddingRight" },
			{ label: "B", id: "paddingBottom" },
			{ label: "L", id: "paddingLeft" },
		],
		border: [
			{ label: "T", id: "borderTop", width: "borderTopWidth", style: "borderTopStyle", color: "borderTopColor" },
			{
				label: "R",
				id: "borderRight",
				width: "borderRightWidth",
				style: "borderRightStyle",
				color: "borderRightColor",
			},
			{
				label: "B",
				id: "borderBottom",
				width: "borderBottomWidth",
				style: "borderBottomStyle",
				color: "borderBottomColor",
			},
			{
				label: "L",
				id: "borderLeft",
				width: "borderLeftWidth",
				style: "borderLeftStyle",
				color: "borderLeftColor",
			},
		],
		radius: [
			{ label: "TL", id: "borderTopLeftRadius" },
			{ label: "TR", id: "borderTopRightRadius" },
			{ label: "BL", id: "borderBottomLeftRadius" },
			{ label: "BR", id: "borderBottomRightRadius" },
		],
	};
	return map[type] as CSSDetailProperties<T>;
}
