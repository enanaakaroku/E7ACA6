import { decomposeValue } from "@/lib/pub";
import { cn, lengthUnitList, borderRadiusUnits } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useImmer } from "use-immer";
import { useEffect, useId } from "react";

export function SizeInput({
	id,
	value,
	type,
	size,
	className,
	onChange,
	min,
}: {
	id: string;
	value: string;
	type: "length" | "radius";
	className?: string;
	size?: "sm";
	min?: number;
	onChange: (size: string) => any;
}) {
	const [sizeValue, setSizeValue] = useImmer(decomposeValue(value));
	useEffect(() => {
		setSizeValue(decomposeValue(value));
	}, [value]);

	const unitOptionsMap = {
		length: lengthUnitList,
		radius: borderRadiusUnits,
	};
	const handleChange = (index: number, value: string | number | undefined) => {
		setSizeValue((draft) => {
			draft[index] = value;
		});
		// 立即基于最新值调用回调
		const updatedSizeValue = sizeValue.map((val, i) => (i === index ? value : val)).join("");
		onChange(updatedSizeValue);
	};

	return (
		<div
			className={cn(
				"flex h-9 items-center px-1 border border-zinc-300 rounded-md has-[:focus-visible]:ring-1 ring-zinc-400",
				{ "h-7": size === "sm" },
				className
			)}
		>
			<Input
				type="number"
				id={id}
				value={sizeValue[0]}
				min={min}
				onChange={(e) => {
					handleChange(0, e.target.value);
				}}
				className={cn(
					" appearance-none h-7 border-none shadow-none rounded-tr-none rounded-br-none focus-visible:ring-0 focus-visible:border-zinc-900 px-1",
					{ "h-5": size === "sm" }
				)}
			/>
			<Select
				value={sizeValue[1] || unitOptionsMap[type][0]}
				onValueChange={(value) => {
					handleChange(1, value);
				}}
			>
				<SelectTrigger
					className={cn("w-[60px] h-7 bg-zinc-200 focus:ring-0 focus:none px-1 py-1", {
						"h-5 text-xs": size === "sm",
					})}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{unitOptionsMap[type].map((v, index) => (
							<SelectItem key={index} value={v}>
								{v}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	);
}
