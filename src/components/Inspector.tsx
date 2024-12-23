"use client";
import { RectComponent } from "./RectComponent";

import { createContext, ReactNode, useContext, useState } from "react";
import clsx from "clsx";

const contextInitValue = {
	componentList: [RectComponent],
};
export const InspectorContext = createContext(contextInitValue);

export const Inspector = ({ children }: { children?: ReactNode }) => {
	return (
		<div className="flex w-full h-full">
			<section className="grow">
				<Inspector.ComponentSelector></Inspector.ComponentSelector>
			</section>
			{/* <InspectorContext.Provider value={contextInitValue}>{children}</InspectorContext.Provider> */}
			<aside className="w-[300px] border-l h-full"></aside>
		</div>
	);
};

Inspector.ComponentSelector = () => {
	const { componentList } = useContext(InspectorContext);
	const [componentListOpen, setComponentListOpen] = useState(false);
	const [chosenComponent, setChosenComponent] = useState<ReactNode>((<div></div>));

	const handleOpenList = () => {
		componentListOpen ? setComponentListOpen(false) : setComponentListOpen(true);
	};

	const chooseComponent = (element: ReactNode = (<div></div>)) => {
		setChosenComponent(element);
	};

	return (
		<div className="relative border w-[500px] h-[60px]" onClick={handleOpenList}>
			{chosenComponent}
			<ul className={clsx("absolute top-full left-0 w-full h-max", { hidden: !componentListOpen })}>
				{componentList.map((item, index) => (
					<li className="h-24 p-6" key={index} onClick={()=>chooseComponent(item())}>
						{item()}
					</li>
				))}
			</ul>
		</div>
	);
};
