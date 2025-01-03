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
import { cn } from "@/lib/utils";

export function InputWithSelect({
	selectOptions = [],
	className = "",
	size = "md",
	...props
}: {
	selectOptions: any[];
	className?: string;
	size?: string;
	[key: string]: any;
}) {
	return (
		<div
			className={cn(
				"flex h-9 items-center px-1 border border-zinc-300 rounded-md has-[:focus-visible]:ring-1 ring-zinc-400",
				{ "h-7": size === "sm" },
				className
			)}
		>
			<Input
				{...props}
				className={cn(
					" appearance-none h-7 border-none shadow-none rounded-tr-none rounded-br-none focus-visible:ring-0 focus-visible:border-zinc-900 px-1",
					{ "h-5": size === "sm" }
				)}
			/>
			<Select defaultValue={selectOptions[0]}>
				<SelectTrigger
					className={cn("w-[60px] h-7 bg-zinc-200 focus:ring-0 focus:none px-1 py-1", {
						"h-5 text-xs": size === "sm",
					})}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{selectOptions.map((v, index) => (
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
