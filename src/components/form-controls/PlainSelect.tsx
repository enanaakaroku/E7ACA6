import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function PlainSelect({
	options,
	size,
	value,
	onChange,
}: {
	options: any[];
	size?: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<Select
			value={value || options[0]}
			onValueChange={(e) => {
				onChange(e);
			}}
		>
			<SelectTrigger
				className={cn("h-9 border-zinc-300 focus:ring-0 focus:none px-1 py-1", {
					"h-7": size === "sm",
				})}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{options.map((v, index) => (
						<SelectItem key={index} value={v}>
							{v}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
