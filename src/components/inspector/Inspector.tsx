"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
	canSetDimensions,
	createControlLayer,
	moveHandleEvent,
	removeControlLayer,
	resizeHandleEvent,
	getElementStyle,
} from "@/utils/pub";
import { ElementBoxModel } from "./ElementBoxModel";

export const Inspector = () => {
	const rteContainer = useRef<HTMLElement>(null);
	const paragraphRef = useRef<HTMLParagraphElement>(null);
	const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);
	const [highlight] = useState<Element | null>(null);

	const handleEditElement = (event: React.MouseEvent<HTMLElement>) => {
		const target = event.target as HTMLElement;
		console.log(target);

		if (target === event.currentTarget) {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			editingElement && removeControlLayer(editingElement);
			setEditingElement(null);
			return;
		}
		if (!editingElement) {
			if (canSetDimensions(target)) {
				setEditingElement(target);
				createControlLayer(target);
			}
		} else {
			// 点了同一个
			if (target === editingElement) return;
			// 点了元素内部
			if (target.parentElement === editingElement) {
				// 点了handle
				if (target.dataset.handleType) {
					if (target.dataset.handleType === "move") {
						moveHandleEvent(event, target);
					} else if (target.dataset.handleType === "resize") {
						resizeHandleEvent(event, target);
					}
				} else {
					removeControlLayer(editingElement);
					if (canSetDimensions(target)) {
						setEditingElement(target);
						createControlLayer(target);
					}
				}
			}
			// 点了别的元素
			else {
				removeControlLayer(editingElement);
				if (canSetDimensions(target)) {
					setEditingElement(target);
					createControlLayer(target);
				}
			}
		}
	};

	useEffect(() => {
		if (highlight) {
			highlight.classList.add("ring-2", "ring-blue-500");
		}
		return () => {
			if (highlight) {
				highlight.classList.remove("ring-2", "ring-blue-500");
			}
		};
	}, [highlight]);

	const [isElementReady, setIsElementReady] = useState(false);

	useEffect(() => {
		if (paragraphRef.current) {
			setIsElementReady(true); // 确保元素已挂载后再显示
		}
	}, []);

	return (
		<div className="border h-[600px] flex">
			<section className="w-[680px]" ref={rteContainer} onMouseDown={handleEditElement}>
				<p ref={paragraphRef}>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum voluptas minus et maiores a,
					similique natus expedita tenetur quibusdam officia hic tempore atque iure odit error, veniam
					consequatur, sequi eligendi.
				</p>
			</section>
			<aside className="w-[260px] shrink-0 border-l px-2">
				{isElementReady && paragraphRef.current && <ElementBoxModel element={paragraphRef.current} />}
			</aside>
		</div>
	);
};
