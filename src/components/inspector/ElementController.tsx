import { useCallback, useContext, useEffect } from "react";
import { useImmer } from "use-immer";
import { GripHorizontal } from "lucide-react";
import { ResizeIcon } from "./ResizeIcon";
import { InspectorContext } from "./Inspector";
import { decomposeValue, findTreeItem, insertBeforeItemById, insertListBeforeById, removeItemById } from "@/lib/pub";
import { throttle } from "lodash";
import { cn } from "@/lib/utils";

export function ElementController({ onMove }: { onMove: (e: React.MouseEvent<HTMLElement>) => void }) {
	const { editingInfo, setEditingInfo } = useContext(InspectorContext);
	if (!editingInfo || !setEditingInfo) return null;
	const { editingElement, editingNode } = editingInfo;
	// if (!editingElement || !editingNode) return null;
	// useEffect(() => {
	// 	console.log(editingInfo.referenceNode);
	// }, [editingInfo.referenceNode]);
	const resizeHandle = (mouseDownEvent: React.MouseEvent<HTMLElement>) => {
		setEditingInfo((draft) => {
			draft.editingState.isResizing = true;
		});
		const startX = mouseDownEvent.clientX;
		const startY = mouseDownEvent.clientY;

		const startWidth = editingElement.offsetWidth;
		const startHeight = editingElement.offsetHeight;

		const mouseMove = (mouseMoveEvent: MouseEvent) => {
			if (!editingElement) return;
			const newWidth = Math.max(0, startWidth + (mouseMoveEvent.clientX - startX));
			const newHeight = Math.max(0, startHeight + (mouseMoveEvent.clientY - startY));
			editingElement.style.width = `${newWidth}px`;
			editingElement.style.height = `${newHeight}px`;
		};
		const mouseUp = () => {
			setEditingInfo((draft) => {
				draft.editingState.isResizing = false;
				const node = findTreeItem(draft.elementList, { key: "id", value: editingNode.id });
				node.props.style.width = editingElement.style.width;
				node.props.style.height = editingElement.style.height;
			});
			document.removeEventListener("mousemove", mouseMove);
			document.removeEventListener("mouseup", mouseUp);
		};

		document.addEventListener("mousemove", mouseMove);
		document.addEventListener("mouseup", mouseUp);
	};

	const moveHandle = (mouseDownEvent: React.MouseEvent<HTMLElement>) => {
		const startX = mouseDownEvent.clientX;
		const startY = mouseDownEvent.clientY;

		setEditingInfo((draft) => {
			draft.editingState.isMoving = true;
		});

		const mouseMove = (mouseMoveEvent: MouseEvent) => {
			if (!editingElement) return;
			const mx = mouseMoveEvent.clientX - startX;
			const my = mouseMoveEvent.clientY - startY;
			if (editingElement.parentElement) {
				editingElement.parentElement.style.pointerEvents = "none";
				editingElement.parentElement.style.translate = `${mx}px ${my}px`;
			}
			// console.log(editingInfo.referenceNode);
		};
		const mouseUp = () => {
			if (editingElement.parentElement) {
				editingElement.parentElement.style.pointerEvents = "";
				editingElement.parentElement.style.translate = "";
			}

			setEditingInfo((draft) => {
				draft.editingState.isMoving = false;
				if (draft.referenceNode) {
					const item = insertListBeforeById(draft.elementList, draft.referenceNode, editingNode);
					console.log(item);
				}
			});

			document.removeEventListener("mousemove", mouseMove);
			document.removeEventListener("mouseup", mouseUp);
		};

		document.addEventListener("mousemove", mouseMove);
		document.addEventListener("mouseup", mouseUp);
	};

	return (
		<div
			className={cn("absolute border-2 rounded-md border-zinc-800 -inset-2", {
				"pointer-events-none": editingInfo.editingState.isMoving,
			})}
		>
			<div
				className="absolute left-[calc(50%-21px)] -top-[8px] w-[42px] h-[16px] cursor-move bg-zinc-800 rounded-md text-center"
				onMouseDown={(e) => {
					onMove(e);
				}}
			>
				<GripHorizontal className="justify-self-center" size={16} stroke="#fff" />
			</div>
			<div
				className="absolute z-10 -right-[4px] -bottom-[4px] hover:cursor-nwse-resize"
				onMouseDown={resizeHandle}
			>
				<ResizeIcon strokeWidth={6} size={20} stroke="#27272a" />
			</div>
		</div>
	);
}
