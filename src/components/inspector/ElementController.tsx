import { useContext, useEffect } from "react";
import { useImmer } from "use-immer";
import { GripHorizontal } from "lucide-react";
import { ResizeIcon } from "./ResizeIcon";
import { InspectorContext } from "./Inspector";
import { decomposeValue } from "@/lib/pub";
import { throttle } from "lodash";

export function ElementController() {
	const { editingElement, editingStyles, setEditingStyles } = useContext(InspectorContext);
	if (!editingElement) return null;

	const offset = 5;
	useEffect(() => {
		// console.log(editingStyles, editingElementOffset);
	}, [editingStyles]);

	const resizeHandle = (mouseDownEvent: React.MouseEvent<HTMLElement>) => {
		const startX = mouseDownEvent.clientX;
		const startY = mouseDownEvent.clientY;

		const startWidth = decomposeValue(editingStyles.width)[0];
		const startHeight = decomposeValue(editingStyles.height)[0];

		const mouseMove = throttle((mouseMoveEvent: MouseEvent) => {
			if (!editingElement) return;
			const newWidth = Math.max(0, startWidth + (mouseMoveEvent.clientX - startX));
			const newHeight = Math.max(0, startHeight + (mouseMoveEvent.clientY - startY));
			setEditingStyles((draft) => {
				draft.width = `${newWidth}px`;
				draft.height = `${newHeight}px`;
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

		const mouseMove = (mouseMoveEvent: MouseEvent) => {
			if (!editingElement) return;
			const mx = mouseMoveEvent.clientX - startX;
			const my = mouseMoveEvent.clientY - startY;

			editingElement.style.pointerEvents = "none";
			editingElement.style.translate = `${mx}px ${my}px`;
		};
		const mouseUp = () => {
			editingElement.style.pointerEvents = "";
			editingElement.style.translate = "";
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
