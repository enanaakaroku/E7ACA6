"use client";

import { createContext, ReactNode, useEffect, useRef } from "react";

import { createHTMLString, initEditingStyles, parseDOMStringToDOMTree } from "@/lib/pub";
import { ElementBoxModel } from "./ElementBoxModel";
import { ElementBoxStyle } from "./declare";
import { useImmer } from "use-immer";
import type { Updater } from "use-immer";
import { cn } from "@/lib/utils";
import { InspectorElements } from "./InspectorElements";
import { Button } from "../ui/button";

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
	editingInfo: TEditingInfo;
	setEditingInfo: Updater<TEditingInfo>;
};
export const InspectorContext = createContext<TInspectorContext>({
	editingInfo: {
		editingElement: null,
		editingNode: null,
		referenceNode: null,
		editingStyles: initEditingStyles(),
		editingState: {
			isMoving: false,
			isResizing: false,
		},
		elementList: [],
	},
	setEditingInfo: () => {},
});

export default function Inspector({ html }: { html: string }) {
	const [editingInfo, setEditingInfo] = useImmer<TEditingInfo>({
		editingElement: null,
		editingNode: null,
		referenceNode: null,
		editingStyles: initEditingStyles(),
		editingState: {
			isMoving: false,
			isResizing: false,
		},
		elementList: [],
	});

	useEffect(() => {
		console.log(editingInfo.elementList);
	}, [editingInfo.elementList]);
	useEffect(() => {
		const removeEditingNode = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const container = document.querySelector("#inspector-container");
			const rteContainer = document.querySelector("#rte-container");

			if (!container?.contains(target) || rteContainer === target) {
				setEditingInfo((draft) => {
					draft.editingElement = null;
					draft.editingNode = null;
				});
			}
		};
		document.addEventListener("click", removeEditingNode);
		return () => {
			document.removeEventListener("click", removeEditingNode);
		};
	}, []);
	useEffect(() => {
		setEditingInfo((draft) => {
			draft.elementList = parseDOMStringToDOMTree(html);
		});
	}, []);
	const handleSave = () => {
		setEditingInfo((draft) => {
			draft.editingElement = null;
			draft.editingNode = null;
		});
		if (!editingInfo.editingNode) {
			const result = createHTMLString(editingInfo.elementList);
			console.log(result);
			localStorage.setItem("inspector-content", result);
		}
	};

	return (
		<InspectorContext.Provider value={{ editingInfo, setEditingInfo }}>
			<div id="inspector-container">
				<header className="justify-self-end py-2">
					<Button onClick={handleSave}>Save</Button>
				</header>
				<div className="border h-[600px] flex">
					<InspectorElements />
					<aside className="w-[260px] shrink-0 border-l px-2">
						{editingInfo.editingElement && <ElementBoxModel />}
					</aside>
				</div>
			</div>
		</InspectorContext.Provider>
	);
}
