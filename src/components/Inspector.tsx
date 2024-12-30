"use client";
import { RectComponent } from "./RectComponent";

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { canSetDimensions, getMousePositionInElementArea, insertAfter } from "@/utils/pub";

type TInspectorContext = {
	componentList: Array<React.FC>;
	rteChildren?: Array<HTMLElement>;
};

const contextInitValue = {
	componentList: [RectComponent],
};

const createResizeHandleElement = () => {
	const span = document.createElement("span");
	span.setAttribute("data-handle-type", "resize");
	span.setAttribute("class", "absolute w-2 h-2 z-10 bg-slate-600 -right-1 -bottom-1 cursor-nwse-resize");
	return span;
};

const createMoveHandleElement = () => {
	const span = document.createElement("span");
	span.setAttribute("data-handle-type", "move");
	span.setAttribute("class", "absolute w-4 h-2 z-10 bg-slate-600 left-1/2 -top-1 cursor-move");
	return span;
};
const createControlLayer = (element: HTMLElement) => {
	element.classList.add("relative", "border-2");
	const resizeHandle = createResizeHandleElement();
	const moveHandle = createMoveHandleElement();
	element.appendChild(resizeHandle);
	element.appendChild(moveHandle);
};
const removeControlLayer = (element: HTMLElement) => {
	element.classList.remove("relative", "border-2");
	const handles = element.querySelectorAll("[data-handle-type]");
	if (handles.length === 0) return;
	handles.forEach((handle) => {
		handle.remove();
	});
};

const addEditorControls = (element: HTMLElement) => {
	element.classList.add("relative", "border-2");
	const resizeHandle = createResizeHandleElement();
	const moveHandle = createMoveHandleElement();
	element.appendChild(resizeHandle);
	element.appendChild(moveHandle);
	return [resizeHandle, moveHandle];
};

const removeEditorControls = (element: HTMLElement, handles: HTMLElement[]) => {
	for (const handle of handles) {
		element.removeChild(handle);
	}
};
const checkRowFlexElement = (element: HTMLElement) => {
	const style = window.getComputedStyle(element);
	return (
		(style.display === "flex" || style.display === "inline-flex") &&
		style.flexDirection !== "column" &&
		style.flexDirection !== "column-reverse"
	);
};
const insertFlexBoxBeforeElement = (referenceElement: HTMLElement, innerElement: HTMLElement[]) => {
	const div = document.createElement("div");
	div.style.display = "flex";
	if (!referenceElement.parentElement) return;
	referenceElement.parentElement.insertBefore(div, referenceElement);
	for (const el of innerElement) {
		div.appendChild(el);
	}
};

const resizeHandleEvent = (mouseDownEvent: React.MouseEvent<HTMLElement>, handle: HTMLElement) => {
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

const moveHandleEvent = (mouseDownEvent: React.MouseEvent<HTMLElement>, handle: HTMLElement) => {
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
		if (targetElement === rteContainer) return;
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

export const InspectorContext = createContext<TInspectorContext>(contextInitValue);

export const Inspector = ({ children }: { children?: ReactNode }) => {
	const rteContainer = useRef<HTMLElement>(null);
	const [rteChildren, setRteChildren] = useState<HTMLElement[]>([]);
	const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);

	const handleEditElement = (event: React.MouseEvent<HTMLElement>) => {
		const target = event.target as HTMLElement;
		console.log(target);

		if (target === event.currentTarget) {
			editingElement && removeControlLayer(editingElement);
			setEditingElement(null);
			return;
		}
		if (!editingElement) {
			if (canSetDimensions(target)) {
				setEditingElement(target);
				createControlLayer(target);
			}
		} else {
			// 点了同一个
			if (target === editingElement) return;
			// 点了元素内部
			if (target.parentElement === editingElement) {
				// 点了handle
				if (target.dataset.handleType) {
					console.log("handle");
					if (target.dataset.handleType === "move") {
						moveHandleEvent(event, target);
					} else if (target.dataset.handleType === "resize") {
						resizeHandleEvent(event, target);
					}
				} else {
					removeControlLayer(editingElement);
					if (canSetDimensions(target)) {
						setEditingElement(target);
						createControlLayer(target);
					}
				}
			}
			// 点了别的元素
			else {
				removeControlLayer(editingElement);
				if (canSetDimensions(target)) {
					setEditingElement(target);
					createControlLayer(target);
				}
			}
		}
	};

	return (
		<InspectorContext.Provider value={{ ...contextInitValue }}>
			<div className="border h-[400px] w-[900px] flex">
				<section className={clsx("glow")} ref={rteContainer} onMouseDown={handleEditElement}>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum voluptas minus et maiores a,
						similique natus expedita tenetur quibusdam officia hic tempore atque iure odit error, veniam
						consequatur, sequi eligendi.
					</p>
					<Inspector.ComponentSelector></Inspector.ComponentSelector>
					<p>
						取得致使世界种软水，中已的。了例如只是一宽。点就萨满职员损失现新。儿女五着和牧场？于了叫受到心理的成为。其走来了一个的。使企业东不提出刀子。也的请示总是种了看。
						血平静嘴宝座：艰巨以在限制我们苏州的。概念村个先生构成社长。时候运动员在，的时监狱。了没有无论呀折射十优秀离奇！打击制造思想老——盖念头作品空白的原则？了地星星低软太阳。好里社会主义则：地位在年又因为权限发挥。
						深处她的广大收入美丽在种款？这死去小要事美。他主要每本想于患者，物受出来的他。那关系的去会议仇——敢于？近年来使的获得书本春节他，人别大家要？
						战争最后轻可以！悄声的器整理有。日本的中炮兵发展来引导。把敌指挥部但遗产熄。提词比群众他喝别年，却最大款的！即计算到。
					</p>
					<button
						onClick={() => {
							console.log("click!");
						}}
					>
						Add Child
					</button>
				</section>
				<aside className="w-[300px] border-l h-full">
					<ul>
						{rteChildren.map((item) => (
							<li className="border cursor-grab" key={item.dataset.key}>
								{item.localName}
							</li>
						))}
					</ul>
				</aside>
			</div>
		</InspectorContext.Provider>
	);
};

Inspector.ComponentSelector = () => {
	const { componentList } = useContext(InspectorContext);
	const [componentListOpen, setComponentListOpen] = useState(false);
	const [chosenComponent, setChosenComponent] = useState<ReactNode>(null);

	const handleOpenList = () => {
		setComponentListOpen((s) => !s);
	};

	const chooseComponent = (element: ReactNode = null) => {
		setChosenComponent(element);
	};

	return (
		<div className="relative border w-[500px] h-[60px]" onClick={handleOpenList}>
			{chosenComponent}
			<ul className={clsx("absolute top-full left-0 w-full h-max", { hidden: !componentListOpen })}>
				{componentList.map((ItemComponent, index) => (
					<li className="h-24 p-6" key={index} onClick={() => chooseComponent(<ItemComponent />)}>
						<ItemComponent />
					</li>
				))}
			</ul>
		</div>
	);
};
