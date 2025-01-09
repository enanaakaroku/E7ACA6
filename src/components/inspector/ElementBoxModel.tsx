import { Label } from "../ui/label";
import { PlainSelect } from "../form-controls/PlainSelect";
import { Input } from "@/components/ui/input";
import { cn, borderStyles } from "@/lib/utils";
import { SizeInput } from "./SizeInput";
import { generateCSSDetailProperties } from "@/lib/pub";
import { useCallback, useContext } from "react";
import { kebabCase, throttle } from "lodash";
import { InspectorContext } from "./Inspector";

export function ElementBoxModel() {
	const { editingInfo, setEditingInfo } = useContext(InspectorContext);
	if (!editingInfo || !setEditingInfo) return null;

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
							value={editingInfo.editingStyles[item.id]}
							onChange={(value) => {
								console.log(value);
								setEditingInfo((draft) => {
									draft.editingStyles[item.id] = value;
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
							value={editingInfo.editingStyles[item.id]}
							onChange={(value) => {
								console.log(value);
								setEditingInfo((draft) => {
									draft.editingStyles[item.id] = value;
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
							value={editingInfo.editingStyles[item.id]}
							onChange={(value) => {
								console.log(value);
								setEditingInfo((draft) => {
									draft.editingStyles[item.id] = value;
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
							value={editingInfo.editingStyles[item.width]}
							onChange={(value) => {
								console.log(value);
								setEditingInfo((draft) => {
									draft.editingStyles[item.width] = value;
								});
							}}
						/>
						<PlainSelect
							options={borderStyles}
							size="sm"
							value={editingInfo.editingStyles[item.style]}
							onChange={(value) => {
								console.log(value);
								setEditingInfo((draft) => {
									draft.editingStyles[item.style] = value;
								});
							}}
						></PlainSelect>
						<Input
							type="color"
							value={editingInfo.editingStyles[item.color]}
							className="w-24 h-7 border-zinc-300 focus:ring-0 focus:none px-1 py-0 cursor-pointer"
							onChange={(e) =>
								handleThrottle(() => {
									setEditingInfo((draft) => {
										draft.editingStyles[item.color] = e.target.value;
									});
									console.log(e.target.value);
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
							value={editingInfo.editingStyles[item.id]}
							onChange={(value) => {
								console.log(value);
								setEditingInfo((draft) => {
									draft.editingStyles[item.id] = value;
								});
							}}
						/>
					</div>
				);
			})}
		</div>
	);
}
