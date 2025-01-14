"use client";

import Inspector from "@/components/inspector/Inspector";
import { useEffect } from "react";
import { useImmer } from "use-immer";

export default function Home() {
	const [html, setHtml] = useImmer(`
        <p>
					直連法、春田國米圓回園安要兒背屋成占種兌、畫泉者斥刀旦壯欠科急丟科洋亮杯教。帶几更音讀未文青清送更夏、又太個還四交或夏各給牠耍己兩邊假開、品邊昌自服。
				</p>
				<p class="mt-10">
					Lorem ipsum dolor <a href="localhost:3000">sit amet</a> consectetur adipisicing elit. Accusantium illo, hic ratione dolores
					repellendus mollitia ipsam nam consectetur optio repudiandae, maxime odit, iure ipsum error! Atque
					praesentium fugit totam laborum! <br />
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente labore rerum eos nemo ducimus
					dolorum, omnis, temporibus eligendi sint, totam architecto deleniti adipisci voluptate nisi facilis
					placeat error aspernatur at.
				</p>
        <ul>
          <li>list node 1</li>
          <li>list node 2</li>
          <li>list node 3</li>
          <li>list node 4</li>
        </ul>

				<div class="w-14 h-10 border-4 border-zinc-200 relative">
					about sth
					<div class="absolute left-0 top-0 w-full h-5 bg-slate-500"></div>
					<p>last child</p>
				</div>
        `);
	useEffect(() => {
		const content = localStorage.getItem("inspector-content");
		if (content) {
			setHtml(content);
		}
	}, []);
	return (
		<div className="grid h-screen place-items-center">
			<Inspector html={html} />
		</div>
	);
}
