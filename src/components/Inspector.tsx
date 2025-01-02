"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { canSetDimensions, getMousePositionInElementArea, insertAfter } from "@/utils/pub";
import { InputNumber } from "./ui/input/InputNumber";
import "@/styles/inspector.css";

const explodedHandleEvent = (event: MouseEvent) => {
	console.log(event);
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
// 展示爆炸视图
// 将包含该元素上到最顶层，下到该元素的所有相邻元素，全部展示出来
const createExplodedHandleElement = () => {
	const span = document.createElement("span");
	span.setAttribute("data-handle-type", "exploded");
	span.setAttribute("class", "absolute w-max h-6 z-10 text-slate-200 bg-slate-600 left-0 top-full cursor-pointer");
	span.innerText = "爆了";
	span.onclick = explodedHandleEvent;
	return span;
};
const createControlLayer = (element: HTMLElement) => {
	element.classList.add("relative", "border-2");
	const resizeHandle = createResizeHandleElement();
	const moveHandle = createMoveHandleElement();
	const explodedHandle = createExplodedHandleElement();
	element.appendChild(resizeHandle);
	element.appendChild(moveHandle);
	element.appendChild(explodedHandle);
};
const removeControlLayer = (element: HTMLElement) => {
	element.classList.remove("relative", "border-2");
	const handles = element.querySelectorAll("[data-handle-type]");
	if (handles.length === 0) return;
	handles.forEach((handle) => {
		handle.remove();
	});
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

export const Inspector = () => {
	const rteContainer = useRef<HTMLElement>(null);
	const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);
	const [highlight] = useState<Element | null>(null);

	const handleEditElement = (event: React.MouseEvent<HTMLElement>) => {
		const target = event.target as HTMLElement;
		console.log(target);

		if (target === event.currentTarget) {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
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

	useEffect(() => {
		if (highlight) {
			highlight.classList.add("ring-2", "ring-blue-500");
		}
		return () => {
			if (highlight) {
				highlight.classList.remove("ring-2", "ring-blue-500");
			}
		};
	}, [highlight]);

	return (
		<div className="border h-[400px] w-[900px] flex">
			<section className={clsx("glow")} ref={rteContainer} onMouseDown={handleEditElement}>
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum voluptas minus et maiores a,
					similique natus expedita tenetur quibusdam officia hic tempore atque iure odit error, veniam
					consequatur, sequi eligendi.
				</p>
			</section>
			<aside className="min-w-[260px] shrink-0 border-l px-2">
				{/* <div className="margin-area bg-orange-200">
						<div className="padding-area bg-green-200">
							<div className={clsx("content-area bg-blue-200")}>110 &times; 140</div>
						</div>
					</div> */}
        <div className="grid grid-cols-4 gap-x-2">
				  <InputNumber className="col-span-2" label="Width" direction="vertical"/>
				  <InputNumber className="col-span-2" label="Height" direction="vertical"/>

        </div>
			</aside>
		</div>
	);
};
