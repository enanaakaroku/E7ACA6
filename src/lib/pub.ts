import { ElementBoxStyle, ITreeNode, TreeNode } from "@/components/inspector/declare";
import { camelCase, capitalize, cloneDeep, flattenDeep, isPlainObject, startCase } from "lodash";
import { editingStyleList } from "./utils";
import { Children, isValidElement, ReactElement, ReactNode } from "react";

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
	element.classList.add("relative");
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

export function formatDOMTree(nodes: ReactNode) {
	// 转换 ReactNode 为数组
	const list: ReactNode[] = Children.toArray(nodes);

	// 递归函数
	const setId = (arr: ReactNode[], pId?: string): any[] => {
		const resList: any[] = [];

		arr.forEach((item, index) => {
			const itemId = pId ? `${pId}-${index}` : `${index}`;

			// 处理文本节点
			if (typeof item === "string") {
				resList.push({
					id: itemId,
					text: item,
				});
				return;
			}

			// 处理 React 元素
			if (item && typeof item === "object" && "props" in item && "type" in item) {
				const element = item as any;

				const { children, ...restProps } = element.props;

				// 递归处理子节点
				let newChildren: any[] = [];
				if (Array.isArray(children)) {
					newChildren = setId(children, itemId);
				} else if (typeof children === "string") {
					newChildren = setId([children], itemId);
				} else if (children) {
					newChildren = setId([children], itemId);
				}

				resList.push({
					props: {
						...restProps,
						key: itemId,
						style: {}, // 默认样式
					},
					children: newChildren,
					type: element.type,
					id: itemId,
				});
			}
		});

		return resList;
	};

	return setId(list);
}

export function convertReactNodeToTree(node: ReactNode, parentId: string = ""): ITreeNode[] {
	const nodeList: ReactNode[] = Children.toArray(node); // 将 ReactNode 转换为数组
	const tree: ITreeNode[] = nodeList.map((child, index) => {
		const id = parentId ? `${parentId}-${index}` : `${index}`;

		// 如果是文本节点
		if (typeof child === "string" || typeof child === "number") {
			return {
				id,
				type: null, // 文本节点没有 type
				text: String(child), // 保存文本内容
			};
		}

		// 如果是 ReactElement
		if (isValidElement(child)) {
			const {
				type,
				props: { children, ...restProps },
			} = child as any;
			const newChildren = children ? convertReactNodeToTree(children, id) : [];
			return {
				id,
				type: typeof type === "string" ? type : null, // 保存 HTML 标签类型
				props: { ...restProps }, // 移除 children 防止循环引用
				children: newChildren,
			};
		}

		// 其他情况（可能为 null、undefined 或无效节点）
		return {
			id,
			type: null,
			props: {},
			children: [],
		};
	});

	return tree;
}

export function convertChildNodesToTree(childNodes: NodeList): TreeNode[] {
	const result: TreeNode[] = [];

	// 遍历 NodeList 中的每个节点
	for (let i = 0; i < childNodes.length; i++) {
		const node = childNodes[i];
		const nodeId = `rtenode-${Math.random().toString(36).substr(2, 9)}`;

		// 处理元素节点
		if (node.nodeType === Node.ELEMENT_NODE) {
			const elementNode = node as Element;
			const treeNode: TreeNode = {
				type: elementNode.nodeName.toLowerCase(),
				children: [],
				id: nodeId,
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
			treeNode.props = attrs;

			// 递归处理子节点
			const childTreeNodes = convertChildNodesToTree(elementNode.childNodes);
			treeNode.children = childTreeNodes;

			result.push(treeNode); // 添加到结果数组
		} else if (node.nodeType === Node.TEXT_NODE && node.nodeValue?.trim()) {
			// 处理文本节点
			result.push({
				type: "text",
				text: node.nodeValue.trim(),
				children: [],
				id: nodeId,
			});
		}
	}

	return result;
}

export function parseDOMStringToDOMTree(htmlString: string) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(htmlString, "text/html");
	const rootNode = doc.body.childNodes; // 获取 DOM 树的根节点
	console.dir(rootNode);

	const treeStructure = convertChildNodesToTree(rootNode);
	return treeStructure;
}

export function flatDOMTree(nodes: ReactNode) {
	const list: any[] = Children.toArray(nodes);
	const setExtraData = (arr: any[], pId?: string) => {
		const resList: any[] = [];
		arr.forEach((item, index) => {
			const itemId = pId ? `${pId}-${index}` : `${index}`;
			const pid = pId ? { pId } : {};
			if (typeof item === "string") {
				resList.push({
					...pid,
					id: itemId,
					text: item,
				});
			} else {
				const {
					props: { children, ...restProps },
					type,
				} = item;
				resList.push({
					type,
					...pid,
					id: itemId,
					props: {
						...restProps,
						key: itemId,
						"data-uniq-id": itemId,
						"data-sortable": true,
					},
				});
				if (Array.isArray(children) && children.length > 0) {
					resList.push(setExtraData(children, itemId));
				} else if (typeof children === "string") {
					resList.push(setExtraData([children], itemId));
				}
			}
		});
		return resList;
	};
	// return setExtraData(list);
	return flattenDeep(setExtraData(list));
}

export function treelify(data: any[], idKey = "id", parentKey = "pId", childrenKey = "children") {
	// 构建树结构
	const root = cloneDeep(data);

	data.forEach((item) => {
		const parentId = item[parentKey];
		if (!parentId) {
			return;
		} else {
			root.forEach((v) => {
				if (v[idKey] !== parentId) return;
				if (!v[childrenKey]) v[childrenKey] = [];
				v[childrenKey].push({ ...item });
			});
		}
	});
	const result = root.filter((item) => !item[parentKey]);

	return result;
}

// 找被点击的元素上层中sortable=true的元素
export function findAncestorSortableElement(startElement: HTMLElement, endElement: HTMLElement) {
	if (startElement.dataset.sortable === "true") {
		return startElement;
	}
	if (!startElement.parentElement || startElement === endElement) return;
	return findAncestorSortableElement(startElement.parentElement, endElement);
}

export function findTreeItemInfoById(
	list: any[],
	id: string
): [Record<string, any> | null, number | null, any[] | null] {
	let res: Record<string, any> | null = null;
	let resIndex: number | null = null;
	let resArray: any[] | null = null;
	const recursive = (arr: any[]) => {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].id === id) {
				res = arr[i];
				resIndex = i;
				resArray = arr;
				break;
			}
			if (arr[i].children && arr[i].children.length > 0) {
				recursive(arr[i].children);
			}
		}
	};
	recursive(list);
	return [res, resIndex, resArray];
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
export function insertListBeforeById(list: any[], refer: Record<string, any>, remove: Record<string, any>) {
	if (refer.id === remove.id) return;
	let foundRefer = false; // 标记是否已处理 refer
	let foundRemove = false; // 标记是否已处理 remove
	for (let i = 0; i < list.length; i++) {
		console.log(list[i].id, refer.id, remove);

		if (list[i].id === refer.id) {
			list.splice(i, 0, remove);
			foundRefer = true; // 更新状态
		}

		// 如果找到 remove.id
		if (list[i].id === remove.id) {
			list.splice(i, 1);
			foundRemove = true; // 更新状态
			i--; // 因为 splice 删除元素，索引需要回退
		}
		if (foundRefer && foundRemove) {
			return true;
		}
		// if (list[i].children && list[i].children.length > 0) {
		// 	const found = insertListBeforeById(list[i].children, refer, remove);
		// 	if (found) return true;
		// }
	}
	return false;
}
export function removeItemById(list: any[], id: string) {
	for (let i = 0; i < list.length; i++) {
		if (list[i].id === id) {
			return list.splice(i, 1);
		}
		if (list[i].children && list[i].children.length > 0) {
			removeItemById(list[i].children, id);
		}
	}
}
export function insertBeforeItemById(list: any[], id: string) {
	for (let i = 0; i < list.length; i++) {
		if (list[i].id === id) {
			return list.splice(i, 0);
		}
		if (list[i].children && list[i].children.length > 0) {
			insertBeforeItemById(list[i].children, id);
		}
	}
}
