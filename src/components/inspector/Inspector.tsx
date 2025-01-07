"use client";

import { createContext, useEffect, useRef } from "react";

import {
	canSetDimensions,
	createControlLayer,
	initEditingStyles,
	moveHandleEvent,
	removeControlLayer,
	resizeHandleEvent,
	usedComputedStyle,
} from "@/lib/pub";
import { ElementBoxModel } from "./ElementBoxModel";
import { ElementController } from "./ElementController";
import { ElementBoxStyle } from "./declare";
import { useImmer } from "use-immer";
import type { Updater } from "use-immer";

// Context 里应该有什么？
// - 存储编辑中元素的新样式
// - 为编辑中元素设置新样式的事件处理器

export const InspectorContext = createContext<{
	editingElement: HTMLElement | null;
	editingStyles: ElementBoxStyle;
	setEditingStyles: Updater<ElementBoxStyle>;
}>({
	editingElement: null,
	editingStyles: initEditingStyles(),
	setEditingStyles: () => {},
});

export const Inspector = () => {
	const rteContainer = useRef<HTMLElement>(null);
	const [editingElement, setEditingElement] = useImmer<HTMLElement | null>(null);
	const [editingStyles, setEditingStyles] = useImmer<ElementBoxStyle>(initEditingStyles());

	useEffect(() => {
		if (!editingElement) return;
		setEditingStyles(usedComputedStyle(editingElement));
		// return () => {
		//   setEditingStyled({})
		// };
	}, [editingElement]);

	useEffect(() => {
		if (!editingElement) return;
		for (const key in editingStyles) {
			if (editingStyles.hasOwnProperty(key)) {
				editingElement.style[key as keyof ElementBoxStyle] = editingStyles[key as keyof ElementBoxStyle];
			}
		}
	}, [editingStyles]);

	const handleEditElement = (event: React.MouseEvent<HTMLElement>) => {
		const target = event.target as HTMLElement;
		console.log(target);

		if (target === event.currentTarget) {
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

	return (
		<InspectorContext.Provider value={{ editingElement, editingStyles, setEditingStyles }}>
			<div className="border h-[600px] flex">
				<section className="w-[680px]" ref={rteContainer} onMouseDown={handleEditElement}>
					<p>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum voluptas minus et maiores a,
						similique natus expedita tenetur quibusdam officia hic tempore atque iure odit error, veniam
						consequatur, sequi eligendi.
					</p>
					<p className="mt-10">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium illo, hic ratione dolores
						repellendus mollitia ipsam nam consectetur optio repudiandae, maxime odit, iure ipsum error!
						Atque praesentium fugit totam laborum! <br />
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente labore rerum eos nemo ducimus
						dolorum, omnis, temporibus eligendi sint, totam architecto deleniti adipisci voluptate nisi
						facilis placeat error aspernatur at.
					</p>

					<div className="w-14 h-10 border-4 border-zinc-200 relative">
						<div className="absolute left-0 top-0 w-full h-5 bg-slate-500"></div>
					</div>
					{editingElement && <ElementController />}
				</section>
				<aside className="w-[260px] shrink-0 border-l px-2">{editingElement && <ElementBoxModel />}</aside>
			</div>
		</InspectorContext.Provider>
	);
};
