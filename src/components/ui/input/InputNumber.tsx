import { NumberField, Input, Button, Group, Label } from "react-aria-components";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
export function InputNumber({label="", defaultValue = 0,  className = '', direction = 'horizontal'}) {
	return (
		<NumberField
      defaultValue={defaultValue}
      className={className}
    >
      <div className={cn("flex",{"space-x-2 items-center":direction === 'horizontal'},{"flex-col space-y-1":direction === 'vertical'})}>
        <Label className="text-sm font-medium text-foreground">{label}</Label>
        <Group className={cn("relative inline-flex w-full h-9 items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20")}>
          <Input className="w-full flex-grow bg-background px-3 py-2 tabular-nums text-foreground focus:outline-none" />
          <div className="flex h-[calc(100%+2px)] flex-col">
            <Button
              slot="increment"
              className="-me-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronUp size={12} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              slot="decrement"
              className="-me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
        </Group>
      </div>
    </NumberField>
	);
}
