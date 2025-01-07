export function ResizeIcon({ size, strokeWidth, ...props }: { size: number; strokeWidth: number; [key: string]: any }) {
	return (
		<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
			<path
				d={`m${size - strokeWidth / 2},${strokeWidth / 2}v${size - strokeWidth}h-${size - strokeWidth}`}
				strokeLinejoin="round"
				strokeLinecap="round"
				strokeWidth={strokeWidth}
				fill="none"
				{...props}
			/>
		</svg>
	);
}
