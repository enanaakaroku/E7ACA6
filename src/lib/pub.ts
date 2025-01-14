"use client";
import { ElementBoxStyle, TextNode, TreeNode, ElementNode } from "@/components/inspector/declare";
import { camelCase, isEmpty } from "lodash";
import { canNotSortable, editingStyleList } from "./utils";
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

export const checkRowFlexElement = (element: HTMLElement) => {
	const style = window.getComputedStyle(element);
	return (
		(style.display === "flex" || style.display === "inline-flex") &&
		style.flexDirection !== "column" &&
		style.flexDirection !== "column-reverse"
	);
};

// 它一定会用在分解getComputedStyle解析出的值，因此值里不会有关键字存在
export function decomposeValue(value: string): [number: number, unit: string | undefined] {
	// 检查是否是数值 + 单位
	const match = value.match(/^([+-]?\d*\.?\d+)([a-zA-Z%]*)$/);
	if (match) {
		const [_, number, unit] = match;
		return [parseFloat(number), unit || undefined];
	}

	// 如果不是数值，直接返回值作为数组的第一位
	return [NaN, undefined];
}

export function usedComputedStyle(element: HTMLElement): ElementBoxStyle {
	const style = window.getComputedStyle(element);
	const resObj = {} as ElementBoxStyle;
	for (const v of editingStyleList) {
		resObj[v] = style[v];
		if (v.match(/Color/i)) {
			resObj[v] = rgbToHex(style[v]);
		}
	}
	return resObj;
}

export function initEditingStyles(): ElementBoxStyle {
	const resObj = {} as ElementBoxStyle;
	for (const v of editingStyleList) {
		resObj[v] = "0px";
		if (v.match(/Color/i)) {
			resObj[v] = "#000";
		}
	}
	return resObj;
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
// 把DOM转成对象数组
export function convertChildNodesToTree(childNodes: NodeList): TreeNode[] {
	const result: TreeNode[] = [];

	// 遍历 NodeList 中的每个节点
	for (let i = 0; i < childNodes.length; i++) {
		const node = childNodes[i];
		const nodeId = `rtenode-${Math.random().toString(36).substr(2, 9)}`;

		// 处理元素节点
		if (node.nodeType === Node.ELEMENT_NODE) {
			const elementNode = node as Element;
			const treeNode: ElementNode = {
				type: elementNode.nodeName.toLowerCase(),
				children: [],
				id: nodeId,
				sortable: !canNotSortable.includes(elementNode.nodeName.toLowerCase()),
			};

			// 提取属性
			const attrs: { [key: string]: any } = {};
			const attrsNameConvert = (name: string) => {
				switch (name) {
					case "class":
						return "className";
					case "for":
						return "htmlFor";
					default:
						return name;
				}
			};
			const styleValueConvert = (value: string) => {
				const styleObject: { [key: string]: string } = {};
				value.split(";").forEach((style) => {
					const [property, val] = style.split(":");
					if (property && val) {
						const formattedProperty = camelCase(property);
						styleObject[formattedProperty] = val.trim();
					}
				});
				return styleObject;
			};
			if (elementNode.attributes) {
				for (let j = 0; j < elementNode.attributes.length; j++) {
					const attr = elementNode.attributes[j];
					attrs[attrsNameConvert(attr.name)] =
						attr.name === "style" ? styleValueConvert(attr.value) : attr.value;
				}
			}
			treeNode.props = {
				style: {},
				...attrs,
			};

			// 递归处理子节点
			const childTreeNodes = convertChildNodesToTree(elementNode.childNodes);
			treeNode.children = childTreeNodes;

			result.push(treeNode); // 添加到结果数组
		} else if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()) {
			// 处理文本节点
			result.push({
				type: "text",
				text: node.nodeValue,
				id: nodeId,
				sortable: false,
			});
		}
	}

	return result;
}

// 把html string转成DOM,再转成对象数组
export function parseDOMStringToDOMTree(htmlString: string) {
	if (typeof window === "undefined" || typeof DOMParser === "undefined") {
		throw new Error("This function can only be run in the browser.");
	}
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, "text/html");
	const rootNode = doc.body.childNodes;

	const treeStructure = convertChildNodesToTree(rootNode);
	return treeStructure;
}

// 找被点击的元素上层中sortable=true的元素
export function findAncestorSortableElement(startElement: HTMLElement, endElement: HTMLElement) {
	if (startElement.dataset.sortable === "true") {
		return startElement;
	}
	if (!startElement.parentElement || startElement === endElement) return;
	return findAncestorSortableElement(startElement.parentElement, endElement);
}
export function findTreeItem(list: any[], { key, value }: { key: string; value: string }) {
	for (let i = 0; i < list.length; i++) {
		if (list[i][key] === value) {
			return list[i];
		}
		if (list[i].children && list[i].children > 0) {
			return findTreeItem(list[i].children, { key, value });
		}
	}
}

// 将nodeList转成 htmlString
export function createHTMLString(data: TreeNode[]): string {
	const buildHTML = (node: TreeNode): string => {
		if (node.type === "text") {
			return (node as TextNode).text || "";
		}
		if (node.type === "br" || node.type === "hr") {
			return `<${node.type}>`;
		}

		const props = (node as ElementNode).props || {};
		const attributes = Object.entries(props)
			.map(([key, value]) => {
				if (key === "className") return `class="${value}"`;
				if (key === "style" && typeof value === "object") {
					if (isEmpty(value)) return null;
					const styleString = Object.entries(value)
						.map(([k, v]) => `${k}: ${v}`)
						.join(";");
					return `style="${styleString}"`;
				}
				return `${key}="${value}"`;
			})
			.filter(Boolean)
			.join(" ");

		const childrenHTML = ((node as ElementNode).children || []).map((child) => buildHTML(child)).join("");

		return `<${node.type}${attributes && " " + attributes}>${childrenHTML}</${node.type}>`;
	};

	return data.map(buildHTML).join("");
}
