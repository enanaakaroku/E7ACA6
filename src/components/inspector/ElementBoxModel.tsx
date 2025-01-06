import { Label } from "../ui/label";
import { PlainSelect } from "../form-controls/PlainSelect";
import { Input } from "@/components/ui/input";
import { cn, borderStyles } from "@/lib/utils";
import { SizeInput } from "./SizeInput";
import { useImmer } from "use-immer";
import { usedComputedStyle, kebabToCamel, rgbToHex, generateCSSDetailProperties } from "@/lib/pub";
import { useCallback, useEffect, useState } from "react";
import { camelCase, kebabCase, throttle } from "lodash";
import { ElementBoxStyle } from "./declare";

export function ElementBoxModel({ element }: { element: HTMLElement }) {
	const [styles, setStyles] = useImmer<ElementBoxStyle>({ ...usedComputedStyle(element) });
	useEffect(() => {
		console.log("change to", element);

		setStyles(usedComputedStyle(element));
	}, [element]);

	useEffect(() => {
		console.log("styles:", styles);
	}, [styles]);

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
							value={styles[item.id]}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[item.id] = value;
								});
								element.style[item.id] = value;
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
							value={styles[item.id]}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[item.id] = value;
								});
								element.style[item.id] = value;
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
							value={styles[item.id]}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[item.id] = value;
								});
								element.style[item.id] = value;
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
							value={styles[item.width]}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[item.width] = value;
								});
								element.style[item.width] = value;
							}}
						/>
						<PlainSelect
							options={borderStyles}
							size="sm"
							value={styles[item.style]}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[item.style] = value;
								});
								element.style[item.style] = value;
							}}
						></PlainSelect>
						<Input
							type="color"
							value={styles[item.color]}
							className="w-24 h-7 border-zinc-300 focus:ring-0 focus:none px-1 py-0 cursor-pointer"
							onChange={(e) =>
								handleThrottle(() => {
									setStyles((draft) => {
										draft[item.color] = e.target.value;
									});
									console.log(e.target.value);
									element.style[item.color] = e.target.value;
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
							value={styles[item.id]}
							onChange={(value) => {
								console.log(value);
								setStyles((draft) => {
									draft[item.id] = value;
								});
								element.style[item.id] = value;
							}}
						/>
					</div>
				);
			})}
		</div>
	);
}
