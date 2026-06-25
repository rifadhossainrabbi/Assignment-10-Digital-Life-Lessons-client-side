import BannerSection from "@/components/home/BannerSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import TopContributors from "@/components/home/TopContributors";
import WhyLearning from "@/components/home/WhyLearning";


export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <BannerSection />
      <FeaturedSection />
      <TopContributors/>
      <WhyLearning/>
    </div>
  );
}
