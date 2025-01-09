import { createElement } from "react";
import { DropIndicator } from "./DropIndicator";

export function InspectorElements() {
	const renderElement = (element: any): any => {
		const { id, type, props, children, text } = element;
		if (text) return text;
		const childElements = children ? children.map(renderElement) : [];
		const controller = id === editingInfo.editingElement?.dataset.uniqId ? createElement(ElementController) : null;

		if (type === "br") {
			return createElement(type, props);
		}
		return (
			<div
				key={id}
				className={cn({ relative: id === editingInfo.referenceElement })}
				data-uniq-id={id}
				data-sortable={true}
			>
				{id === editingInfo.referenceElement && <DropIndicator />}
				{createElement(type, props, ...childElements, controller)}
			</div>
		);
	};
}
