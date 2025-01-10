import { Label } from "../ui/label";
import { PlainSelect } from "../form-controls/PlainSelect";
import { Input } from "@/components/ui/input";
import { cn, borderStyles } from "@/lib/utils";
import { SizeInput } from "./SizeInput";
import { findTreeItem, generateCSSDetailProperties, usedComputedStyle } from "@/lib/pub";
import { createElement, useCallback, useContext, useEffect } from "react";
import { kebabCase, throttle } from "lodash";
import { InspectorContext } from "./Inspector";
import { useImmer } from "use-immer";

export function ElementBoxModel() {
	const { editingInfo, setEditingInfo } = useContext(InspectorContext);
	if (!editingInfo || !setEditingInfo) return null;
	const { editingNode, editingElement } = editingInfo;
	if (!editingNode || !editingElement) return null;
	const [style, setStyle] = useImmer<Record<string, any>>(usedComputedStyle(editingElement));

	useEffect(() => {
		if (editingNode) {
			setStyle(usedComputedStyle(editingElement));
		}
	}, [editingNode]);

	const handleThrottle = useCallback(
		throttle((callback) => {
			callback();
		}, 500),
		[]
	);
	return (
		<div className="grid grid-cols-6 gap-x-2 gap-y-1">
			{generateCSSDetailProperties("size").map((item) => {
				return (
					<div key={item.id} className="col-span-3">
						<Label htmlFor={kebabCase(item.id)}>{item.label}</Label>
						<SizeInput
							id={kebabCase(item.id)}
							type="length"
							min={0}
							value={style[item.id]}
							onChange={(value) => {
								setStyle((draft) => {
									draft[item.id] = value;
								});
								setEditingInfo((draft) => {
									const node = findTreeItem(draft.elementList, { key: "id", value: editingNode.id });
									node && (node.props.style[item.id] = value);
								});
							}}
						/>
					</div>
				);
			})}
			<Label className="col-span-6">Margin</Label>
			{generateCSSDetailProperties("margin").map((item) => {
				return (
					<div key={item.id} className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor={kebabCase(item.id)} title={kebabCase(item.id)}>
							{item.label}
						</Label>
						<SizeInput
							size="sm"
							id={kebabCase(item.id)}
							type="length"
							min={0}
							value={style[item.id]}
							onChange={(value) => {
								setStyle((draft) => {
									draft[item.id] = value;
								});
								setEditingInfo((draft) => {
									const node = findTreeItem(draft.elementList, { key: "id", value: editingNode.id });
									node && (node.props.style[item.id] = value);
								});
							}}
						/>
					</div>
				);
			})}

			<Label className="col-span-6">Padding</Label>

			{generateCSSDetailProperties("padding").map((item) => {
				return (
					<div key={item.id} className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor={kebabCase(item.id)} title={kebabCase(item.id)}>
							{item.label}
						</Label>
						<SizeInput
							size="sm"
							id={kebabCase(item.id)}
							type="length"
							min={0}
							value={style[item.id]}
							onChange={(value) => {
								setStyle((draft) => {
									draft[item.id] = value;
								});
								setEditingInfo((draft) => {
									const node = findTreeItem(draft.elementList, { key: "id", value: editingNode.id });
									node && (node.props.style[item.id] = value);
								});
							}}
						/>
					</div>
				);
			})}

			<Label className="col-span-6">Border</Label>
			{generateCSSDetailProperties("border").map((item) => {
				return (
					<div key={item.id} className="col-span-6 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor={kebabCase(item.width)} title={kebabCase(item.width)}>
							{item.label}
						</Label>
						<SizeInput
							size="sm"
							id={kebabCase(item.width)}
							type="length"
							min={0}
							value={style[item.width]}
							onChange={(value) => {
								setStyle((draft) => {
									draft[item.width] = value;
								});
								setEditingInfo((draft) => {
									const node = findTreeItem(draft.elementList, { key: "id", value: editingNode.id });
									node && (node.props.style[item.width] = value);
								});
							}}
						/>
						<PlainSelect
							options={borderStyles}
							size="sm"
							value={style[item.style]}
							onChange={(value) => {
								setStyle((draft) => {
									draft[item.style] = value;
								});
								setEditingInfo((draft) => {
									const node = findTreeItem(draft.elementList, { key: "id", value: editingNode.id });
									node && (node.props.style[item.style] = value);
								});
							}}
						></PlainSelect>
						<Input
							type="color"
							value={style[item.color]}
							className="w-24 h-7 border-zinc-300 focus:ring-0 focus:none px-1 py-0 cursor-pointer"
							onChange={(e) =>
								handleThrottle(() => {
									setStyle((draft) => {
										draft[item.color] = e.target.value;
									});
									setEditingInfo((draft) => {
										const node = findTreeItem(draft.elementList, {
											key: "id",
											value: editingNode.id,
										});
										node && (node.props.style[item.color] = e.target.value);
									});
								})
							}
						/>
					</div>
				);
			})}

			<Label className="col-span-6">Border radius</Label>

			{generateCSSDetailProperties("radius").map((item) => {
				return (
					<div key={item.id} className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-5" htmlFor={kebabCase(item.id)} title={kebabCase(item.id)}>
							{item.label}
						</Label>
						<SizeInput
							size="sm"
							id={kebabCase(item.id)}
							type="radius"
							min={0}
							value={style[item.id]}
							onChange={(value) => {
								setStyle((draft) => {
									draft[item.id] = value;
								});
							}}
						/>
					</div>
				);
			})}
		</div>
	);
}
