"use client";
import { createElement, useContext, useEffect, useRef } from "react";
import { DropIndicator } from "./DropIndicator";
import { InspectorContext } from "./Inspector";
import { canNotSortable, cn, inlineLevelElements } from "@/lib/utils";
import { ElementController } from "./ElementController";
import { useImmer } from "use-immer";
import { findTreeItem } from "@/lib/pub";

export function InspectorElements() {
	const rteContainer = useRef<HTMLElement>(null);
	const { editingInfo, setEditingInfo } = useContext(InspectorContext);
	const [draggingNode, setDraggingNode] = useImmer(null); // 当前拖拽的节点
	const [draggingPosition, setDraggingPosition] = useImmer({ x: 0, y: 0 }); // 拖拽的坐标
	if (!editingInfo || !setEditingInfo) return null;

	const handleStartDrag = (e: React.MouseEvent<HTMLElement>, node: any) => {
		e.stopPropagation(); // 防止冒泡
		console.log(e, node);
		setEditingInfo((draft) => {
			draft.editingState.isMoving = true;
		});
		setDraggingNode(node);
		setDraggingPosition({ x: e.clientX, y: e.clientY });
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
		if (!draggingNode) return;

		// 更新拖拽位置
		setDraggingPosition({
			x: e.clientX,
			y: e.clientY,
		});
	};

	const handleMouseUp = (e: React.MouseEvent<HTMLElement>) => {
		console.log(e.clientX, e.clientY);
		if (!draggingNode || !rteContainer.current) return;

		const dropTarget = findDropTarget(e.clientX, e.clientY, rteContainer.current);
		console.log(dropTarget);

		if (dropTarget) {
			setEditingInfo((draft) => {
				draft.elementList = moveNode(draft.elementList, draggingNode, dropTarget);
			});
		}

		setDraggingNode(null);
		setEditingInfo((draft) => {
			draft.editingState.isMoving = false;
		});
	};

	const findDropTarget = (x: number, y: number, container: HTMLElement) => {
		const elements = container.querySelectorAll("[data-sortable='true']");
		for (let el of elements) {
			const ele = el as HTMLElement;
			const rect = ele.getBoundingClientRect();
			if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
				return ele.dataset.uniqId;
			}
		}
		return null;
	};

	const moveNode = (tree: any[], nodeToMove: any, targetId: any) => {
		const removeNode = (nodes: any[]) =>
			nodes.reduce((acc, node) => {
				if (node.id === nodeToMove.id) return acc;
				if (node.children) {
					node.children = removeNode(node.children);
				}
				return [...acc, node];
			}, []);

		const insertNode = (nodes: any[]) => {
			for (let i = 0; i < nodes.length; i++) {
				if (nodes[i].id === targetId) {
					nodes.splice(i, 0, nodeToMove);
					break;
				}
				if (nodes[i].children) {
					insertNode(nodes[i].children);
				}
			}
			return nodes;
		};

		const updatedTree = removeNode(tree);
		return insertNode(updatedTree);
	};

	return (
		<section
			className={cn(
				"relative w-[680px]",
				{
					"select-none cursor-move": editingInfo.editingState.isMoving,
				},
				{ "select-none cursor-nwse-resize": editingInfo.editingState.isResizing }
			)}
			id="rte-container"
			ref={rteContainer}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
		>
			<TreeNodes nodes={editingInfo.elementList} onDragStart={handleStartDrag} />
			{draggingNode && rteContainer.current && (
				<div
					className="w-fit h-fit"
					style={{
						position: "absolute",
						top: draggingPosition.y - rteContainer.current?.getBoundingClientRect().top - 200,
						left: draggingPosition.x - rteContainer.current?.getBoundingClientRect().left - 50,
						pointerEvents: "none",
						backgroundColor: "#eee",
						padding: "5px",
						border: "1px solid #999",
					}}
				>
					<TreeNodes nodes={[draggingNode]} />
				</div>
			)}
		</section>
	);
}

function TreeNodes({
	nodes,
	onDragStart,
}: {
	nodes: any[];
	onDragStart?: (e: React.MouseEvent<HTMLElement>, node: any) => void;
}) {
	const { editingInfo, setEditingInfo } = useContext(InspectorContext);
	const renderTreeNode = (node: any) => {
		const { id, type, props, children, text, sortable = true } = node;
		if (text) return text;
		const childElements = children ? children.map((child: any) => renderTreeNode(child)) : [];
		if (type === "br" || type === "hr") {
			return createElement(type, props);
		}
		if (inlineLevelElements.includes(type)) {
			return createElement(type, props, ...childElements);
		}
		if (!sortable) {
			return createElement(type, props, ...childElements);
		}
		return (
			<div
				key={id}
				className={cn("relative w-fit h-fit", { "bg-slate-300": editingInfo?.referenceNode?.id === id })}
				data-uniq-id={id}
				data-sortable={sortable}
				onClick={(e) => {
					e.stopPropagation();
					const element = e.currentTarget.children[0];
					setEditingInfo((draft) => {
						draft.editingNode = node;
						draft.editingElement = element as any;
					});
				}}
			>
				{createElement(type, props, ...childElements)}
				{id === editingInfo.referenceNode?.id && <DropIndicator />}
				{id === editingInfo.editingNode?.id && (
					<ElementController
						onMove={(e) => {
							onDragStart && onDragStart(e, node);
						}}
					/>
				)}
			</div>
		);
	};
	return nodes.map((node: any) => renderTreeNode(node));
}
