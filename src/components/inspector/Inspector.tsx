"use client";

import { createContext, ReactNode, useEffect, useRef } from "react";

import { formatDOMTree, initEditingStyles } from "@/lib/pub";
import { ElementBoxModel } from "./ElementBoxModel";
import { ElementBoxStyle } from "./declare";
import { useImmer } from "use-immer";
import type { Updater } from "use-immer";
import { cn } from "@/lib/utils";
import { InspectorElements } from "./InspectorElements";

// Context 里应该有什么？
// - 存储编辑中元素的新样式
// - 为编辑中元素设置新样式的事件处理器
type TEditingInfo = {
	editingElement: null | HTMLElement;
	editingNode: null | Record<string, any>;
	referenceNode: null | Record<string, any>;
	editingStyles: ElementBoxStyle;
	editingState: {
		isMoving: boolean;
		isResizing: boolean;
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
		editingNode: null,
		referenceNode: null,
		editingStyles: initEditingStyles(),
		editingState: {
			isMoving: false,
			isResizing: false,
		},
		elementList: formatDOMTree(children),
	});

	useEffect(() => {
		console.log(editingInfo.elementList);
	}, [editingInfo.elementList]);

	return (
		<InspectorContext.Provider value={{ editingInfo, setEditingInfo }}>
			<div className="border h-[600px] flex">
				<section
					className={cn(
						"relative w-[680px]",
						{
							"select-none cursor-move": editingInfo.editingState.isMoving,
						},
						{ "cursor-nwse-resize": editingInfo.editingState.isResizing }
					)}
					ref={rteContainer}
				>
					<InspectorElements />
				</section>
				<aside className="w-[260px] shrink-0 border-l px-2">
					{editingInfo.editingElement && <ElementBoxModel />}
				</aside>
			</div>
		</InspectorContext.Provider>
	);
};
