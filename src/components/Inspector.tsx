"use client";
import { RectComponent } from "./RectComponent";

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { setElementsKey } from "@/utils/pub";

type TInspectorContext = {
	componentList: Array<React.FC>;
	rteChildren?: Array<HTMLElement>;
};

const contextInitValue = {
	componentList: [RectComponent],
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

const addEditorControls = (element: HTMLElement) => {
	element.classList.add("relative", "border-2");
	const resizeHandle = createResizeHandleElement();
	const moveHandle = createMoveHandleElement();
	element.appendChild(resizeHandle);
	element.appendChild(moveHandle);

	return {
		remove() {
			element.classList.remove("relative", "border-2");
			element.removeChild(resizeHandle);
			element.removeChild(moveHandle);
		},
	};
};

export const InspectorContext = createContext<TInspectorContext>(contextInitValue);

export const Inspector = ({ children }: { children?: ReactNode }) => {
	const rteContainer = useRef<HTMLElement>(null);
	const [rteChildren, setRteChildren] = useState<HTMLElement[]>([]);
	const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
	const [isMoving, setisMoving] = useState<boolean>(false);
	useEffect(() => {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (rteContainer.current) {
					const childNodes = Array.from(rteContainer.current?.children ?? []) as HTMLElement[];

					setRteChildren(setElementsKey(childNodes));
					console.log(childNodes);
				}
			});
		});
		if (rteContainer.current) {
			// 开始监听容器
			observer.observe(rteContainer.current, {
				childList: true, // 监听子元素的变化
				subtree: true, // 不监听子元素的嵌套子元素
			});

			const childNodes = Array.from(rteContainer.current.children ?? []) as HTMLElement[];
			setRteChildren(setElementsKey(childNodes));
		}
		return () => {
			observer.disconnect();
		};
	}, []);

	const handleEditElement = (event: React.MouseEvent<HTMLElement>) => {
		if (!(event.target instanceof HTMLElement)) return;
		event.preventDefault();
		setisMoving(true);
		console.dir(event.target);
		console.dir(event.target.parentElement);
		// 点击可编辑区域
		if (event.target.parentElement === event.currentTarget) {
			// 唤出操作句柄
			const editorControls = addEditorControls(event.target);
		}

		// 点击操作句柄
		if (event.target.dataset.handleType) {
		}

		const startX = event.clientX;
		const startY = event.clientY;
		// const { "--el-translate-x": startTranslateX, "--el-translate-y": startTranslateY } = elementStyle;
		// const handleMouseMove = (moveEvent: MouseEvent) => {
		// 	const targetElement = event.target as HTMLElement;
		// 	// 获取鼠标位置的元素
		// 	// const hoveredElement = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
		// 	if (highlightedElement !== targetElement) {
		// 		if (highlightedElement) {
		// 			highlightedElement.style.outline = ""; // 移除之前的高亮
		// 		}
		// 		targetElement.style.outline = "2px solid blue"; // 为当前目标元素添加高亮
		// 		setHighlightedElement(targetElement); // 更新状态
		// 	}
		// 	const mx = moveEvent.clientX - startX;
		// 	const my = moveEvent.clientY - startY;
		// 	// setElementStyle((prev) => ({
		// 	// 	...prev,
		// 	// 	"--el-translate-x": `${parseFloat(startTranslateX) + mx}px`,
		// 	// 	"--el-translate-y": `${parseFloat(startTranslateY) + my}px`,
		// 	// }));
		// };

		// const handleMouseUp = () => {
		// 	setisMoving(false);
		// 	// setElementStyle((prev) => ({
		// 	// 	...prev,
		// 	// 	"--el-translate-x": startTranslateX,
		// 	// 	"--el-translate-y": startTranslateY,
		// 	// }));
		// 	document.removeEventListener("mousemove", handleMouseMove);
		// 	document.removeEventListener("mouseup", handleMouseUp);
		// };

		// document.addEventListener("mousemove", handleMouseMove);
		// document.addEventListener("mouseup", handleMouseUp);
	};

	// const handleMouseLeave = () => {
	// 	// 清除高亮，当鼠标移出整个容器时
	// 	if (highlightedElement) {
	// 		highlightedElement.style.outline = "";
	// 		setHighlightedElement(null);
	// 	}
	// };
	return (
		<InspectorContext.Provider value={{ ...contextInitValue, rteChildren }}>
			<div className="flex w-full h-full">
				<section
					className={clsx("glow", { "cursor-move": isMoving })}
					ref={rteContainer}
					onMouseDown={handleEditElement}
				>
					<Inspector.TextEditArea></Inspector.TextEditArea>
					<Inspector.ComponentSelector></Inspector.ComponentSelector>
					<Inspector.TextEditArea editable={true}></Inspector.TextEditArea>
					<button
						onClick={() => {
							const newChild = document.createElement("p");
							newChild.textContent = `Child ${Math.random().toFixed(2)}`;
							rteContainer.current?.appendChild(newChild);
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

Inspector.TextEditArea = ({ editable = false }) => {
	const [isEditing, setIsEditing] = useState<boolean>(editable);
	const [isResizing, setIsResizing] = useState<boolean>(false);

	const [elementStyle, setElementStyle] = useState<React.CSSProperties & { [key: string]: any }>({
		"--el-translate-x": "0px",
		"--el-translate-y": "0px",
		"--el-translate-z": "0px",
		width: "auto",
		height: "auto",
		translate: "var(--el-translate-x) var(--el-translate-y) var(--el-translate-z)",
	});
	const elementRef = useRef<HTMLParagraphElement>(null);

	const handleResize = useCallback((event: React.MouseEvent<HTMLElement>) => {
		event.preventDefault();
		setIsResizing(true);
		const startX = event.clientX;
		const startY = event.clientY;
		const startWidth = elementRef.current?.offsetWidth || 0;
		const startHeight = elementRef.current?.offsetHeight || 0;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const newWidth = Math.max(0, startWidth + (moveEvent.clientX - startX)); // 最小宽度100
			const newHeight = Math.max(0, startHeight + (moveEvent.clientY - startY)); // 最小高度100
			setElementStyle((prevState) => ({ ...prevState, width: `${newWidth}px`, height: `${newHeight}px` }));
		};

		const handleMouseUp = () => {
			setIsResizing(false);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	}, []);

	return (
		<p
			ref={elementRef}
			className={clsx({ "border-2": isEditing }, { "select-none": isResizing })}
			style={elementStyle}
		>
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero temporibus dolores voluptas cupiditate amet
			quidem fuga consequuntur inventore impedit assumenda itaque, sit aliquam alias fugit, id nam, tenetur odio
			consequatur!
		</p>
	);
};
