"use client";
import { RectComponent } from "./RectComponent";

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { throttle } from "lodash";
import { getMousePositionInElementArea, insertAfter } from "@/utils/pub";

type TInspectorContext = {
	componentList: Array<React.FC>;
	rteChildren?: Array<HTMLElement>;
};

const contextInitValue = {
	componentList: [RectComponent],
};

type TEditorControls = {
	removeEditorControls: () => void;
};

const createResizeHandleElement = () => {
	const span = document.createElement("span");
	span.setAttribute("data-handle-type", "resize");
	span.setAttribute("class", "absolute w-2 h-2 bg-slate-600 -right-1 -bottom-1 cursor-nwse-resize");
	return span;
};

const createMoveHandleElement = () => {
	const span = document.createElement("span");
	span.setAttribute("data-handle-type", "move");
	span.setAttribute("class", "absolute w-4 h-2 bg-slate-600 left-1/2 -top-1 cursor-move");
	return span;
};

const addEditorControls = (element: HTMLElement) => {
	element.classList.add("relative", "border-2");
	const resizeHandle = createResizeHandleElement();
	const moveHandle = createMoveHandleElement();
	element.appendChild(resizeHandle);
	element.appendChild(moveHandle);
	// return {
	// 	removeEditorControls() {
	// 		element.classList.remove("relative", "border-2");
	// 		element.removeChild(resizeHandle);
	// 		element.removeChild(moveHandle);
	// 	},
	// };
};
const checkRowFlexElement = (element: HTMLElement) => {
	const style = window.getComputedStyle(element);
	return (
		(style.display === "flex" || style.display === "inline-flex") &&
		style.flexDirection !== "column" &&
		style.flexDirection !== "column-reverse"
	);
};
const insertBeforeFlexElement = (referenceElement: HTMLElement, innerElement: HTMLElement[]) => {
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

	const mouseMove = (mouseMoveEvent: MouseEvent) => {
		if (!controlingElement) return;
		const newWidth = Math.max(0, startWidth + (mouseMoveEvent.clientX - startX));
		const newHeight = Math.max(0, startHeight + (mouseMoveEvent.clientY - startY));
		controlingElement.style.width = `${newWidth}px`;
		controlingElement.style.height = `${newHeight}px`;
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
		if (targetElement.parentElement !== controlingElement.parentElement) return;
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
		if (!referenceElement.parentElement) return;
		const parentElement = referenceElement.parentElement;
		switch (insertArea) {
			case "l":
				if (!checkRowFlexElement(parentElement)) {
					insertBeforeFlexElement(referenceElement, [controlingElement, referenceElement]);
				}
				break;
			case "r":
				if (!checkRowFlexElement(parentElement)) {
					insertBeforeFlexElement(referenceElement, [referenceElement, controlingElement]);
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
	const [editingControls, setEditingControls] = useState<TEditorControls | null>(null);

	const handleEditElement = (event: React.MouseEvent<HTMLElement>) => {
		const target = event.target as HTMLElement;
		console.log(target);

		event.preventDefault();
		// 点击可编辑区域
		if (target !== event.currentTarget) {
			// 唤出操作句柄
			if (target !== editingElement) {
				editingControls?.removeEditorControls();
			}
			const controls = addEditorControls(target);

			setEditingElement(target);
			setEditingControls(controls);
		} else {
			console.log(1111111111);

			editingControls?.removeEditorControls();
		}
		// 点击操作句柄
		if (target.dataset.handleType) {
			if (target.dataset.handleType === "move") {
				moveHandleEvent(event, target);
			} else if (target.dataset.handleType === "resize") {
				resizeHandleEvent(event, target);
			}
		}
	};

	return (
		<InspectorContext.Provider value={{ ...contextInitValue }}>
			<div className="flex w-full h-full">
				<section className={clsx("glow")} ref={rteContainer} onMouseDown={handleEditElement}>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero temporibus dolores voluptas
						cupiditate amet quidem fuga consequuntur inventore impedit assumenda itaque, sit aliquam alias
						fugit, id nam, tenetur odio consequatur!
					</p>
					<Inspector.ComponentSelector></Inspector.ComponentSelector>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero temporibus dolores voluptas
						cupiditate amet quidem fuga consequuntur inventore impedit assumenda itaque, sit aliquam alias
						fugit, id nam, tenetur odio consequatur!
					</p>
					<button>Add Child</button>
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
