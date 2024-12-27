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
	const span = document.createElement("p");
	span.setAttribute("data-handle-type", "resize");
	span.setAttribute("class", "absolute w-2 h-2 bg-slate-600 -right-1 -bottom-1 cursor-nwse-resize");
	return span;
};

const createMoveHandleElement = () => {
	const span = document.createElement("p");
	span.setAttribute("data-handle-type", "move");
	span.setAttribute("class", "absolute w-4 h-2 bg-slate-600 left-1/2 -top-1 cursor-move");
	return span;
};

const addEditorControls = (element: HTMLElement): TEditorControls => {
	element.classList.add("relative", "border-2");
	const resizeHandle = createResizeHandleElement();
	const moveHandle = createMoveHandleElement();
	element.appendChild(resizeHandle);
	element.appendChild(moveHandle);
	return {
		removeEditorControls() {
			element.classList.remove("relative", "border-2");
			element.removeChild(resizeHandle);
			element.removeChild(moveHandle);
		},
	};
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

const resizeHandleEvent = (mouseDownEvent: MouseEvent, handle: HTMLElement) => {
	const controlingElement = handle.parentElement;
	const startX = mouseDownEvent.clientX;
	const startY = mouseDownEvent.clientY;
	const startWidth = controlingElement?.offsetWidth || 0;
	const startHeight = controlingElement?.offsetHeight || 0;
	return {
		mouseMove(mouseMoveEvent: MouseEvent) {
			if (!controlingElement) return;
			const newWidth = Math.max(0, startWidth + (mouseMoveEvent.clientX - startX));
			const newHeight = Math.max(0, startHeight + (mouseMoveEvent.clientY - startY));
			controlingElement.style.width = `${newWidth}px`;
			controlingElement.style.height = `${newHeight}px`;
		},
		mouseUp(mouseUpEvent: MouseEvent) {},
	};
};

const moveHandleEvent = (mouseDownEvent: MouseEvent, handle: HTMLElement) => {
	const startX = mouseDownEvent.clientX;
	const startY = mouseDownEvent.clientY;
	const rteContainer = mouseDownEvent.currentTarget;
	const controlingElement = handle.parentElement;
	let lastTargetElement: HTMLElement | null = null;
	let insertArea: "l" | "r" | "t" | "b" | null = null;
	return {
		mouseMove(mouseMoveEvent: MouseEvent) {
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
		},
		mouseUp(mouseUpEvent: MouseEvent) {
			if (!controlingElement) return;
			if (!rteContainer) return;
			const targetElement = mouseUpEvent.target as HTMLElement;
			if (targetElement.parentElement !== controlingElement.parentElement) {
				controlingElement.style.pointerEvents = "none";
				controlingElement.style.translate = "";
        return;
			}
      if (target.parentElement && lastMoveTargetElement && lastMoveTargetElement.parentElement) {
        const targetElementParent = lastMoveTargetElement.parentElement;
        const movingElement = target.parentElement;

        switch (insertArea) {
          case "l":
            if (!checkRowFlexElement(targetElementParent)) {
              insertBeforeFlexElement(lastMoveTargetElement, [
                movingElement,
                lastMoveTargetElement,
              ]);
            }
            break;
          case "r":
            if (!checkRowFlexElement(targetElementParent)) {
              insertBeforeFlexElement(lastMoveTargetElement, [
                lastMoveTargetElement,
                movingElement,
              ]);
            }
            break;
          case "b":
            insertAfter(movingElement, lastMoveTargetElement);
            break;
          case "t":
            targetElementParent.insertBefore(movingElement, lastMoveTargetElement);
            break;
          default:
            console.error("着陆失败");
		},
	};
};

export const InspectorContext = createContext<TInspectorContext>(contextInitValue);

export const Inspector = ({ children }: { children?: ReactNode }) => {
	const rteContainer = useRef<HTMLElement>(null);
	const [rteChildren, setRteChildren] = useState<HTMLElement[]>([]);
	const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);
	const [editingControls, setEditingControls] = useState<TEditorControls | null>(null);
	const [isMoving, setisMoving] = useState<boolean>(false);

	const handleEditElement = (event: React.MouseEvent<HTMLElement>) => {
		const target = event.target as HTMLElement;
		event.preventDefault();
		// 点击可编辑区域
		if (target.parentElement === event.currentTarget) {
			// 唤出操作句柄
			if (target !== editingElement) {
				editingControls?.removeEditorControls();
			}
			const controls = addEditorControls(target);

			setEditingElement(target);
			setEditingControls(controls);
		}

		const startX = event.clientX;
		const startY = event.clientY;

		// 点击操作句柄
		const handleMouseMove = (moveEvent: MouseEvent) => {
			if (target.dataset.handleType) {
				if (target.dataset.handleType === "resize") {
				} else if (target.dataset.handleType === "move") {
					// move只能移动至同级的元素周围
					if (!target.parentElement) return;
					target.parentElement.style.pointerEvents = "none";
					const mx = moveEvent.clientX - startX;
					const my = moveEvent.clientY - startY;
					target.parentElement.style.translate = `${mx}px ${my}px`;
					const behindMovingTarget = moveEvent.target as HTMLElement;
					// 底下的元素是可编辑块
					if (behindMovingTarget.parentElement === rteContainer.current) {
						if (lastMoveTargetElement && lastMoveTargetElement !== behindMovingTarget) {
							lastMoveTargetElement.style.backgroundColor = "";
							lastMoveTargetElement.style.border = "";
						}
						const mouseArea = getMousePositionInElementArea(moveEvent, behindMovingTarget);
						insertArea = mouseArea;
						behindMovingTarget.style.border = "";
						behindMovingTarget.style.backgroundColor = "#cccccc";
						switch (mouseArea) {
							case "l":
								behindMovingTarget.style.borderLeft = "2px solid orange";
								break;
							case "r":
								behindMovingTarget.style.borderRight = "2px solid orange";
								break;
							case "b":
								behindMovingTarget.style.borderBottom = "2px solid orange";
								break;
							case "t":
								behindMovingTarget.style.borderTop = "2px solid orange";
								break;
							default:
								console.error("未判定区域");
						}

						lastMoveTargetElement = behindMovingTarget;
					}
				}
			}
		};

		const handleMouseUp = () => {
			if (lastMoveTargetElement) {
				lastMoveTargetElement.style.backgroundColor = "";
				lastMoveTargetElement.style.border = "";
				// lastMoveTargetElement = null;
			}

			if (target.dataset.handleType) {
				if (target.dataset.handleType === "move") {
					if (target.parentElement && lastMoveTargetElement && lastMoveTargetElement.parentElement) {
						const targetElementParent = lastMoveTargetElement.parentElement;
						const movingElement = target.parentElement;

						switch (insertArea) {
							case "l":
								if (!checkRowFlexElement(targetElementParent)) {
									insertBeforeFlexElement(lastMoveTargetElement, [
										movingElement,
										lastMoveTargetElement,
									]);
								}
								break;
							case "r":
								if (!checkRowFlexElement(targetElementParent)) {
									insertBeforeFlexElement(lastMoveTargetElement, [
										lastMoveTargetElement,
										movingElement,
									]);
								}
								break;
							case "b":
								insertAfter(movingElement, lastMoveTargetElement);
								break;
							case "t":
								targetElementParent.insertBefore(movingElement, lastMoveTargetElement);
								break;
							default:
								console.error("着陆失败");
						}
					} else {
					}
				}
			}
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	return (
		<InspectorContext.Provider value={{ ...contextInitValue, rteChildren }}>
			<div className="flex w-full h-full">
				<section
					className={clsx("glow", { "cursor-move": isMoving })}
					ref={rteContainer}
					onMouseDown={handleEditElement}
				>
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
