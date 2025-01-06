import { Label } from "../ui/label";
import { PlainSelect } from "../form-controls/PlainSelect";
import { Input } from "@/components/ui/input";
import { cn, borderStyles } from "@/lib/utils";
import { SizeInput } from "./SizeInput";
import { useImmer } from "use-immer";
import { usedComputedStyle, kebabToCamel, rgbToHex } from "@/utils/pub";
import { useCallback, useEffect } from "react";
import { throttle } from "lodash";

export function ElementBoxModel({ element }: { element: HTMLElement }) {
	const [styles, setStyles] = useImmer({ ...usedComputedStyle(element) });

	const handleColorChange = useCallback(
		throttle((e, id: string) => {
			setStyles((draft) => {
				draft[kebabToCamel(id + "-color") as keyof typeof draft] = e.target.value;
			});
			console.log(e.target.value);
		}, 500),
		[setStyles]
	);
	return (
		<div className="grid grid-cols-6 gap-x-2 gap-y-1">
			{[
				{ label: "Width", value: styles.width, id: "width" },
				{ label: "Height", value: styles.height, id: "height" },
			].map((item) => {
				return (
					<div key={item.id} className="col-span-3">
						<Label htmlFor={item.id}>{item.id}</Label>
						<SizeInput
							id={item.id}
							type="length"
							min={0}
							value={item.value}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[kebabToCamel(item.id) as keyof typeof draft] = value;
								});
								element.style[item.id as "width" | "height"] = value;
							}}
						/>
					</div>
				);
			})}
			<Label className="col-span-6">Margin</Label>
			{[
				{ label: "T", value: styles.marginTop, id: "margin-top" },
				{ label: "R", value: styles.marginRight, id: "margin-right" },
				{ label: "B", value: styles.marginBottom, id: "margin-bottom" },
				{ label: "L", value: styles.marginLeft, id: "margin-left" },
			].map((item) => {
				return (
					<div key={item.id} className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor={item.id} title="Top">
							{item.label}
						</Label>
						<SizeInput
							size="sm"
							id={item.id}
							type="length"
							min={0}
							value={item.value}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[kebabToCamel(item.id) as keyof typeof draft] = value;
								});
								element.style[item.id as "width" | "height"] = value;
							}}
						/>
					</div>
				);
			})}

			<Label className="col-span-6">Padding</Label>

			{[
				{ label: "T", value: styles.paddingTop, id: "padding-top" },
				{ label: "R", value: styles.paddingRight, id: "padding-right" },
				{ label: "B", value: styles.paddingBottom, id: "padding-bottom" },
				{ label: "L", value: styles.paddingLeft, id: "padding-left" },
			].map((item) => {
				return (
					<div key={item.id} className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor={item.id} title="Top">
							{item.label}
						</Label>
						<SizeInput
							size="sm"
							id={item.id}
							type="length"
							min={0}
							value={item.value}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[kebabToCamel(item.id) as keyof typeof draft] = value;
								});
							}}
						/>
					</div>
				);
			})}

			<Label className="col-span-6">Border</Label>
			{[
				{
					label: "T",
					defaultWidth: styles.borderTopWidth,
					defaultStyle: styles.borderTopStyle,
					defaultColor: styles.borderTopColor,
					id: "border-top",
				},
				{
					label: "R",
					defaultWidth: styles.borderRightWidth,
					defaultStyle: styles.borderRightStyle,
					defaultColor: styles.borderRightColor,
					id: "border-right",
				},
				{
					label: "B",
					defaultWidth: styles.borderBottomWidth,
					defaultStyle: styles.borderBottomStyle,
					defaultColor: styles.borderBottomColor,
					id: "border-bottom",
				},
				{
					label: "L",
					defaultWidth: styles.borderLeftWidth,
					defaultStyle: styles.borderLeftStyle,
					defaultColor: styles.borderLeftColor,
					id: "border-left",
				},
			].map((item) => {
				return (
					<div key={item.id} className="col-span-6 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor={item.id} title={item.id}>
							{item.label}
						</Label>
						<SizeInput
							size="sm"
							id={item.id}
							type="length"
							min={0}
							value={item.defaultWidth}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[kebabToCamel(item.id + "-width") as keyof typeof draft] = value;
								});
							}}
						/>
						<PlainSelect
							options={borderStyles}
							size="sm"
							value={item.defaultStyle}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[kebabToCamel(item.id + "-style") as keyof typeof draft] = value;
								});
							}}
						></PlainSelect>
						<Input
							type="color"
							value={item.defaultColor}
							className="w-24 h-7 border-zinc-300 focus:ring-0 focus:none px-1 py-0 cursor-pointer"
							onChange={(e) => {
								handleColorChange(e, item.id);
							}}
						/>
					</div>
				);
			})}

			<Label className="col-span-6">Border radius</Label>

			{[
				{ label: "LT", value: styles.borderTopLeftRadius, id: "border-top-left" },
				{ label: "RT", value: styles.borderTopRightRadius, id: "border-top-right" },
				{ label: "LB", value: styles.borderBottomLeftRadius, id: "border-bottom-left" },
				{ label: "RB", value: styles.borderBottomRightRadius, id: "border-bottom-right" },
			].map((item) => {
				return (
					<div key={item.id} className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-5" htmlFor={item.id} title="Top">
							{item.label}
						</Label>
						<SizeInput
							size="sm"
							id={item.id}
							type="radius"
							min={0}
							value={item.value}
							onChange={(value) => {
								console.log(value);
							}}
						/>
					</div>
				);
			})}
		</div>
	);
}
