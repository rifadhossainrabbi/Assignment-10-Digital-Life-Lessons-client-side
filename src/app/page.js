import WhyLearning from "@/components/home/WhyLearning";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      Hello from home page
      <WhyLearning/>
    </div>
  );
}
