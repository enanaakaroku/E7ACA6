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

export function PlainSelect({ options, size }: { options: any[]; size?: string }) {
	return (
		<Select defaultValue={options[0]}>
			<SelectTrigger
				className={cn("h-9 bg-zinc-200 focus:ring-0 focus:none px-1 py-1", {
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
