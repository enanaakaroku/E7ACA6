import { Inspector } from "@/components/inspector/Inspector";

export default function Home() {
	return (
		<div className="grid h-screen place-items-center">
			<Inspector>
				<p>
					直連法、春田國米圓回園安要兒背屋成占種兌、畫泉者斥刀旦壯欠科急丟科洋亮杯教。帶几更音讀未文青清送更夏、又太個還四交或夏各給牠耍己兩邊假開、品邊昌自服。
				</p>
				<p className="mt-10">
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium illo, hic ratione dolores
					repellendus mollitia ipsam nam consectetur optio repudiandae, maxime odit, iure ipsum error! Atque
					praesentium fugit totam laborum! <br />
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente labore rerum eos nemo ducimus
					dolorum, omnis, temporibus eligendi sint, totam architecto deleniti adipisci voluptate nisi facilis
					placeat error aspernatur at.
				</p>

				<div className="w-14 h-10 border-4 border-zinc-200 relative">
					about sth
					<div className="absolute left-0 top-0 w-full h-5 bg-slate-500"></div>
					<p>last child</p>
				</div>
			</Inspector>
		</div>
	);
}
