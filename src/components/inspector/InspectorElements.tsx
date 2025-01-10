import { createElement, useContext, useEffect, useRef } from "react";
import { DropIndicator } from "./DropIndicator";
import { InspectorContext } from "./Inspector";
import { cn } from "@/lib/utils";
import { ElementController } from "./ElementController";
import { findTreeItem } from "@/lib/pub";

export function InspectorElements() {
	const { editingInfo, setEditingInfo } = useContext(InspectorContext);
	if (!editingInfo || !setEditingInfo) return null;

	const renderElement = (node: any): any => {
		const { id, type, props, children, text, selected, sortable = true } = node;
		if (text) return text;
		const childElements = children ? children.map(renderElement) : [];
		if (type === "br") {
			return createElement(type, props);
		}

		return (
			<div
				key={id}
				className={cn("relative w-fit h-fit", { "bg-slate-300": editingInfo.referenceNode?.id === id })}
				data-uniq-id={id}
				data-sortable={sortable}
				onMouseEnter={() => {
					// console.log("触发mouseenter");
					if (node.id !== editingInfo.editingNode?.id) {
						setEditingInfo((draft) => {
							draft.referenceNode = node;
						});
					}
				}}
				onMouseMove={() => {
					if (!editingInfo.referenceNode) {
						setEditingInfo((draft) => {
							draft.referenceNode = node;
						});
					}
				}}
				onMouseLeave={() => {
					// console.log("触发mouseout");
					setEditingInfo((draft) => {
						draft.referenceNode = null;
					});
				}}
				onClick={(e) => {
					e.stopPropagation();
					const element = e.currentTarget.children[0];
					setEditingInfo((draft) => {
						const node = findTreeItem(draft.elementList, { key: "id", value: id });
						draft.editingNode = node;
						draft.editingElement = element as any;
					});
				}}
			>
				{createElement(type, props, ...childElements)}
				{id === editingInfo.referenceNode?.id && <DropIndicator />}
				{id === editingInfo.editingNode?.id && <ElementController />}
			</div>
		);
	};
	return editingInfo?.elementList.map(renderElement);
}
