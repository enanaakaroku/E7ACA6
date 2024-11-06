export default function Home() {
  return (
    <div className="grid place-items-center h-screen">
      <div className="relative w-[300px] h-[200px] rounded-lg bg-gradient-to-br from-violet-500 from-30% via-indigo-500 via-60% to-blue-500 bg-[length:200%_100%]">
        <div className="absolute inset-4 p-4 bg-black rounded-lg">
          <h1 className="text-4xl font-bold">Greeting</h1>
        </div>
      </div>
    </div>
  );
}
