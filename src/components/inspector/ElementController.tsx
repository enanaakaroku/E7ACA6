import { useContext, useEffect } from "react";
import { useImmer } from "use-immer";
import { GripHorizontal } from "lucide-react";
import { ResizeIcon } from "./ResizeIcon";
import { InspectorContext } from "./Inspector";
import { decomposeValue } from "@/lib/pub";

export function ElementController() {
	const { editingElement, editingStyles, setEditingStyles } = useContext(InspectorContext);
	if (!editingElement) return null;
	const [dependElementRect, setDependElementRect] = useImmer(editingElement.getBoundingClientRect());
	const offset = 5;
	useEffect(() => {
		if (!editingElement) return;
		console.log("controlling:", editingStyles, editingElement.getBoundingClientRect());

		const updateRect = () => {
			setDependElementRect(editingElement.getBoundingClientRect());
		};
		// 初始更新
		updateRect();
		window.addEventListener("resize", updateRect);

		return () => {
			window.removeEventListener("resize", updateRect);
		};
	}, [editingElement, editingStyles]);
	return (
		<div
			className="fixed border-2 rounded-md border-zinc-800"
			style={{
				width: dependElementRect.width + 2 * offset,
				height: dependElementRect.height + 2 * offset,
				left: dependElementRect.left - offset,
				top: dependElementRect.top - offset,
			}}
		>
			<div className="absolute left-[calc(50%-21px)] -top-[8px] w-[42px] h-[16px] cursor-move bg-zinc-800 rounded-md text-center">
				<GripHorizontal className="justify-self-center" size={16} stroke="#fff" />
			</div>
			<div className="absolute z-10 -right-[4px] -bottom-[4px]">
				<ResizeIcon strokeWidth={6} size={20} stroke="#27272a" />
			</div>
		</div>
	);
}
