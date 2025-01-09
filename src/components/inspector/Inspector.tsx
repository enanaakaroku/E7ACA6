"use client";

import { createContext, createElement, ElementType, ReactNode, useEffect, useRef } from "react";

import {
	findAncestorSortableElement,
	findTreeItemInfoById,
	flatDOMTree,
	formatDOMTree,
	initEditingStyles,
	insertListBefore,
	removeControlLayer,
	treelify,
	usedComputedStyle,
} from "@/lib/pub";
import { ElementBoxModel } from "./ElementBoxModel";
import { ElementController } from "./ElementController";
import { ElementBoxStyle } from "./declare";
import { useImmer } from "use-immer";
import type { Updater } from "use-immer";
import { throttle } from "lodash";
import { cn } from "@/lib/utils";
import { WritableDraft } from "immer";
import { DropIndicator } from "./DropIndicator";

// Context 里应该有什么？
// - 存储编辑中元素的新样式
// - 为编辑中元素设置新样式的事件处理器
type TEditingInfo = {
	editingElement: null | HTMLElement;
	referenceElement: null | string;
	editingStyles: ElementBoxStyle;
	editingState: {
		isMoving: boolean;
	};
	elementList: any[];
};
type TInspectorContext = {
	editingInfo?: TEditingInfo;
	setEditingInfo?: Updater<TEditingInfo>;
};
export const InspectorContext = createContext<TInspectorContext>({});

export const Inspector = ({ children }: { children: ReactNode }) => {
	const rteContainer = useRef<HTMLElement>(null);
	const [editingInfo, setEditingInfo] = useImmer<TEditingInfo>({
		editingElement: null,
		referenceElement: null,
		editingStyles: initEditingStyles(),
		editingState: {
			isMoving: false,
		},
		elementList: formatDOMTree(children),
	});

	useEffect(() => {
		console.log(editingInfo.elementList);
	}, [editingInfo.elementList]);
	useEffect(() => {
		const editingElement = editingInfo.editingElement;

		if (!editingElement) return;
		setEditingInfo((draft) => {
			draft.editingStyles = usedComputedStyle(editingElement);
		});
		const { position: initPos } = window.getComputedStyle(editingElement);
		initPos === "static" && (editingElement.style.position = "relative");
		return () => {
			initPos === "static" ? (editingElement.style.position = "") : (editingElement.style.position = initPos);
		};
	}, [editingInfo.editingElement]);

	useEffect(() => {
		if (!editingInfo.editingElement) return;
		for (const key in editingInfo.editingStyles) {
			if (editingInfo.editingStyles.hasOwnProperty(key) && key !== "position") {
				editingInfo.editingElement.style[key as keyof ElementBoxStyle] =
					editingInfo.editingStyles[key as keyof ElementBoxStyle];
			}
		}
	}, [editingInfo.editingStyles]);

	const handleEditElement = (event: React.MouseEvent<HTMLElement>) => {
		if (!rteContainer.current) return;
		const target = event.target as HTMLElement;
		const sortableTarget = findAncestorSortableElement(target, rteContainer.current);

		if (target === event.currentTarget) {
			setEditingInfo((draft) => {
				draft.editingElement = null;
			});
			return;
		}

		if (sortableTarget) {
			setEditingInfo((draft) => {
				draft.editingElement = sortableTarget as unknown as WritableDraft<HTMLElement>;
			});
		}

		let referenceElementId: null | string = null;
		const mouseMove = throttle((mouseMoveEvent: MouseEvent) => {
			const moveTarget = mouseMoveEvent.target as HTMLElement;

			if (!rteContainer.current) return;
			if (!editingInfo.editingElement) return;

			const referenceElement = findAncestorSortableElement(moveTarget, rteContainer.current);
			referenceElementId = referenceElement ? referenceElement.dataset.uniqId || null : null;
		}, 200);
		const mouseUp = () => {
			if (!rteContainer.current) return;
			setEditingInfo((draft) => {
				draft.referenceElement = referenceElementId;
			});

			rteContainer.current.removeEventListener("mousemove", mouseMove);
			rteContainer.current.removeEventListener("mouseup", mouseUp);
		};

		rteContainer.current.addEventListener("mousemove", mouseMove);
		rteContainer.current.addEventListener("mouseup", mouseUp);
	};
	const renderElement = (element: any): any => {
		const { id, type, props, children, text } = element;
		if (text) return text;
		const childElements = children ? children.map(renderElement) : [];
		const controller = id === editingInfo.editingElement?.dataset.uniqId ? createElement(ElementController) : null;

		if (type === "br") {
			return createElement(type, props);
		}
		return (
			<div
				key={id}
				className={cn({ relative: id === editingInfo.referenceElement })}
				data-uniq-id={id}
				data-sortable={true}
			>
				{id === editingInfo.referenceElement && <DropIndicator />}
				{createElement(type, props, ...childElements, controller)}
			</div>
		);
	};
	return (
		<InspectorContext.Provider value={{ editingInfo, setEditingInfo }}>
			<div className="border h-[600px] flex">
				<section
					className={cn("relative w-[680px]", {
						"select-none cursor-move": editingInfo.editingState.isMoving,
					})}
					ref={rteContainer}
					onMouseDown={handleEditElement}
				>
					{editingInfo.elementList.map(renderElement)}
				</section>
				<aside className="w-[260px] shrink-0 border-l px-2">
					{editingInfo.editingElement && <ElementBoxModel />}
				</aside>
			</div>
		</InspectorContext.Provider>
	);
};
