"use client";

import { createContext, createElement, ElementType, ReactNode, useEffect, useRef } from "react";

import {
	canSetDimensions,
	createControlLayer,
	findAncestorSortableElement,
	findTreeItemById,
	flatTreeNode,
	formatDOMTree,
	initEditingStyles,
	moveHandleEvent,
	removeControlLayer,
	resizeHandleEvent,
	usedComputedStyle,
} from "@/lib/pub";
import { ElementBoxModel } from "./ElementBoxModel";
import { ElementController } from "./ElementController";
import { ElementBoxStyle } from "./declare";
import { useImmer } from "use-immer";
import type { Updater } from "use-immer";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { throttle } from "lodash";

// Context 里应该有什么？
// - 存储编辑中元素的新样式
// - 为编辑中元素设置新样式的事件处理器

export const InspectorContext = createContext<{
	editingElement: HTMLElement | null;
	editingStyles: ElementBoxStyle;
	setEditingStyles: Updater<ElementBoxStyle>;
}>({
	editingElement: null,
	editingStyles: initEditingStyles(),
	setEditingStyles: () => {},
});

export const Inspector = ({ children }: { children: ReactNode }) => {
	const rteContainer = useRef<HTMLElement>(null);
	const [editingElement, setEditingElement] = useImmer<HTMLElement | null>(null);
	const [editingStyles, setEditingStyles] = useImmer<ElementBoxStyle>(initEditingStyles());
	const [tempState, setTempState] = useImmer({
		editingElementPosition: "",
	});
	// const [editingElementOffset, setEditingElementOffset] = useImmer({ left: 0, top: 0 });
	const [elementList, setElementList] = useImmer(formatDOMTree(children));

	// const calculateElementOffset = () => {
	// 	const { left: eLeft, top: eTop } = editingElement
	// 		? editingElement.getBoundingClientRect()
	// 		: { left: 0, top: 0 };
	// 	const { left: rteLeft, top: rteTop } = rteContainer.current
	// 		? rteContainer.current.getBoundingClientRect()
	// 		: { left: 0, top: 0 };
	// 	const offsetLeft = eLeft - rteLeft;
	// 	const offsetTop = eTop - rteTop;
	// 	setEditingElementOffset({ left: offsetLeft, top: offsetTop });
	// };
	useEffect(() => {
		console.log(elementList);
		console.log(flatTreeNode(elementList));
	}, [elementList]);
	useEffect(() => {
		console.log("editingElement", editingElement);

		if (!editingElement) return;
		setEditingStyles(usedComputedStyle(editingElement));
		setTempState((draft) => {
			draft.editingElementPosition = editingStyles.position;
		});
		if (!["relative", "absolute"].includes(editingStyles.position)) {
			editingElement.style.position = "relative";
		}
		return () => {
			editingElement.style.position = "";
		};
	}, [editingElement]);

	useEffect(() => {
		if (!editingElement) return;
		for (const key in editingStyles) {
			if (editingStyles.hasOwnProperty(key) && key !== "position") {
				editingElement.style[key as keyof ElementBoxStyle] = editingStyles[key as keyof ElementBoxStyle];
			}
		}
	}, [editingStyles]);

	const handleEditElement = (event: React.MouseEvent<HTMLElement>) => {
		if (!rteContainer.current) return;
		const target = event.target as HTMLElement;
		const sortableTarget = findAncestorSortableElement(target, rteContainer.current);
		console.log(target);

		if (target === event.currentTarget) {
			editingElement && removeControlLayer(editingElement);
			setEditingElement(null);
			return;
		}

		if (sortableTarget) {
			setEditingElement(sortableTarget);
		}
		let referenceElementId = "";
		const mouseMove = throttle((mouseMoveEvent: MouseEvent) => {
			const moveTarget = mouseMoveEvent.target as HTMLElement;
			if (!rteContainer.current) return;
			if (!editingElement) return;

			const referenceElement = findAncestorSortableElement(moveTarget, rteContainer.current);

			referenceElementId = referenceElement ? referenceElement.dataset.uniqId || "none" : "none";

			console.log(referenceElement?.dataset.uniqId);
		}, 200);
		const mouseUp = () => {
			if (!rteContainer.current) return;
			if (!editingElement) return;

			console.log(findTreeItemById(elementList, referenceElementId));

			rteContainer.current.removeEventListener("mousemove", mouseMove);
			rteContainer.current.removeEventListener("mouseup", mouseUp);
		};

		rteContainer.current.addEventListener("mousemove", mouseMove);
		rteContainer.current.addEventListener("mouseup", mouseUp);
	};

	const renderElement = (element: any): any => {
		if (typeof element === "string") return element;
		const {
			id,
			type,
			props: { children, ...restProps },
		} = element;
		const childElements = children ? (Array.isArray(children) ? children.map(renderElement) : [children]) : [];
		const controller = id === editingElement?.dataset.uniqId ? createElement(ElementController) : null;
		return createElement(type, { ...restProps }, ...childElements, controller);
	};

	return (
		<InspectorContext.Provider value={{ editingElement, editingStyles, setEditingStyles }}>
			<div className="border h-[600px] flex">
				<section className="relative w-[680px] select-none" ref={rteContainer} onMouseDown={handleEditElement}>
					{elementList.map(renderElement)}
				</section>
				<aside className="w-[260px] shrink-0 border-l px-2">{editingElement && <ElementBoxModel />}</aside>
			</div>
		</InspectorContext.Provider>
	);
};
