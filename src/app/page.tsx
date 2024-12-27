"use client";
import { Inspector } from "@/components/Inspector";

export default function Home() {
	return (
		<div className="grid h-screen place-items-center">
			<div className="border h-[400px] w-[900px]">
				<Inspector></Inspector>
			</div>
		</div>
	);
}
