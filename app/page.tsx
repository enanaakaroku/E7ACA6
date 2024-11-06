import NeonLight from "@/components/NeonLight";

export default function Home() {
  return (
    <div className="grid place-items-center h-screen">
      <div className="w-[300px] h-[200px] rounded-md bg-gradient-to-br from-violet-500 from-30% via-indigo-500 via-60% to-blue-500 bg-[length:200%_100%] bg-clip-text">
        <h1 className="text-4xl font-bold text-transparent text-shadow-white-md">Greeting</h1>
      </div>
    </div>
  );
}
