import { useCallback, useContext, useEffect } from "react";
import { useImmer } from "use-immer";
import { GripHorizontal } from "lucide-react";
import { ResizeIcon } from "./ResizeIcon";
import { InspectorContext } from "./Inspector";
import { decomposeValue } from "@/lib/pub";
import { throttle } from "lodash";

export function ElementController() {
	const { editingInfo, setEditingInfo } = useContext(InspectorContext);
	if (!editingInfo || !setEditingInfo) return null;

	useEffect(() => {
		// console.log(editingStyles, editingElementOffset);
	}, [editingInfo.editingStyles]);
	useEffect(() => {
		if (editingInfo.referenceElement) {
			setEditingInfo((draft) => {
				const editingElement = draft.editingElement;
				const referenceElementId = draft.referenceElement;
				draft.editingState.isMoving = false;

				if (editingElement && editingElement.dataset.uniqId && referenceElementId) {
					let editingObj: any = null;
					const removeRecursive = (arr: any[]) => {
						for (let i = 0; i < arr.length; i++) {
							if (arr[i].id === editingElement.dataset.uniqId) {
								editingObj = arr[i];
								arr.splice(i, 1);
								return;
							}
							if (arr[i].children && arr[i].children.length > 0) {
								removeRecursive(arr[i].children);
							}
						}
					};
					removeRecursive(draft.elementList);
					const insertRecursive = (arr: any[]) => {
						for (let i = 0; i < arr.length; i++) {
							if (arr[i].id === referenceElementId) {
								arr.splice(i, 0, editingObj);
								return;
							}
							if (arr[i].children && arr[i].children.length > 0) {
								insertRecursive(arr[i].children);
							}
						}
					};
					insertRecursive(draft.elementList);
				}
				draft.referenceElement = null;
			});
		}
	}, [editingInfo.referenceElement]);
	const resizeHandle = (mouseDownEvent: React.MouseEvent<HTMLElement>) => {
		const startX = mouseDownEvent.clientX;
		const startY = mouseDownEvent.clientY;

		const startWidth = decomposeValue(editingInfo.editingStyles.width)[0];
		const startHeight = decomposeValue(editingInfo.editingStyles.height)[0];

		const mouseMove = throttle((mouseMoveEvent: MouseEvent) => {
			if (!editingInfo.editingElement) return;
			const newWidth = Math.max(0, startWidth + (mouseMoveEvent.clientX - startX));
			const newHeight = Math.max(0, startHeight + (mouseMoveEvent.clientY - startY));
			setEditingInfo((draft) => {
				draft.editingStyles.width = `${newWidth}px`;
				draft.editingStyles.height = `${newHeight}px`;
			});
		}, 200);
		const mouseUp = () => {
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
			if (!editingInfo.editingElement) return;
			const mx = mouseMoveEvent.clientX - startX;
			const my = mouseMoveEvent.clientY - startY;

			editingInfo.editingElement.style.pointerEvents = "none";
			editingInfo.editingElement.style.translate = `${mx}px ${my}px`;
		};
		const mouseUp = () => {
			if (!editingInfo.editingElement) return;

			editingInfo.editingElement.style.pointerEvents = "";
			editingInfo.editingElement.style.translate = "";
			document.removeEventListener("mousemove", mouseMove);
			document.removeEventListener("mouseup", mouseUp);
		};

		document.addEventListener("mousemove", mouseMove);
		document.addEventListener("mouseup", mouseUp);
	};

	return (
		<span className="absolute border-2 rounded-md border-zinc-800 -inset-2">
			<span
				className="absolute left-[calc(50%-21px)] -top-[8px] w-[42px] h-[16px] cursor-move bg-zinc-800 rounded-md text-center"
				onMouseDown={moveHandle}
			>
				<GripHorizontal className="justify-self-center" size={16} stroke="#fff" />
			</span>
			<span className="absolute z-10 -right-[4px] -bottom-[4px]" onMouseDown={resizeHandle}>
				<ResizeIcon strokeWidth={6} size={20} stroke="#27272a" />
			</span>
		</span>
	);
}
