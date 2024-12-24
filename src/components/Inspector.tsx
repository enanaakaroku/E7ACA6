"use client";
import { RectComponent } from "./RectComponent";

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { setElementsKey } from "@/utils/pub";

type TInspectorContext = {
	componentList: Array<React.FC>;
	rteChildren?: Array<HTMLElement>;
};

const contextInitValue = {
	componentList: [RectComponent],
};

export const InspectorContext = createContext<TInspectorContext>(contextInitValue);

export const Inspector = ({ children }: { children?: ReactNode }) => {
	const rteContainer = useRef<HTMLElement>(null);
	const [rteChildren, setRteChildren] = useState<HTMLElement[]>([]);
	useEffect(() => {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (rteContainer.current) {
					const childNodes = Array.from(rteContainer.current?.children ?? []) as HTMLElement[];

					setRteChildren(setElementsKey(childNodes));
					console.log(childNodes);
				}
			});
		});
		if (rteContainer.current) {
			// 开始监听容器
			observer.observe(rteContainer.current, {
				childList: true, // 监听子元素的变化
				subtree: true, // 不监听子元素的嵌套子元素
			});

			const childNodes = Array.from(rteContainer.current.children ?? []) as HTMLElement[];
			setRteChildren(setElementsKey(childNodes));
		}
		return () => {
			observer.disconnect();
		};
	}, []);
	return (
		<InspectorContext.Provider value={{ ...contextInitValue, rteChildren }}>
			<div className="flex w-full h-full">
				<section className="grow" ref={rteContainer}>
					<Inspector.TextEditArea></Inspector.TextEditArea>
					<Inspector.ComponentSelector></Inspector.ComponentSelector>
					<Inspector.TextEditArea editable={true}></Inspector.TextEditArea>
					<button
						onClick={() => {
							const newChild = document.createElement("p");
							newChild.textContent = `Child ${Math.random().toFixed(2)}`;
							rteContainer.current?.appendChild(newChild);
						}}
					>
						Add Child
					</button>
				</section>
				<aside className="w-[300px] border-l h-full">
					<ul>
						{rteChildren.map((item) => (
							<li className="border cursor-grab" key={item.dataset.key}>
								{item.localName}
							</li>
						))}
					</ul>
				</aside>
			</div>
		</InspectorContext.Provider>
	);
};

Inspector.ComponentSelector = () => {
	const { componentList } = useContext(InspectorContext);
	const [componentListOpen, setComponentListOpen] = useState(false);
	const [chosenComponent, setChosenComponent] = useState<ReactNode>(null);

	const handleOpenList = () => {
		setComponentListOpen((s) => !s);
	};

	const chooseComponent = (element: ReactNode = null) => {
		setChosenComponent(element);
	};

	return (
		<div className="relative border w-[500px] h-[60px]" onClick={handleOpenList}>
			{chosenComponent}
			<ul className={clsx("absolute top-full left-0 w-full h-max", { hidden: !componentListOpen })}>
				{componentList.map((ItemComponent, index) => (
					<li className="h-24 p-6" key={index} onClick={() => chooseComponent(<ItemComponent />)}>
						<ItemComponent />
					</li>
				))}
			</ul>
		</div>
	);
};

Inspector.TextEditArea = ({ editable = false }) => {
	const [isEdit, setIsEdit] = useState<boolean>(editable);
	const enterEditMode = useCallback(() => setIsEdit(true), []);
	const exitEditMode = useCallback(() => setIsEdit(false), []);
	const rbHandle = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
    
	}, []);

	return (
		<p
			className={clsx("relative", { "border-2": isEdit })}
			onClick={enterEditMode}
			style={{ width: "auto", height: "auto" }}
		>
			<span
				className="lt-handle absolute w-2 h-2 bg-slate-600 -left-1 -top-1 cursor-nwse-resize"
				onClick={exitEditMode}
			></span>
			<span
				className="rb-handle absolute w-2 h-2 bg-slate-600 -right-1 -bottom-1 cursor-nwse-resize"
				onClick={exitEditMode}
			></span>
			Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero temporibus dolores voluptas cupiditate amet
			quidem fuga consequuntur inventore impedit assumenda itaque, sit aliquam alias fugit, id nam, tenetur odio
			consequatur!
		</p>
	);
};
