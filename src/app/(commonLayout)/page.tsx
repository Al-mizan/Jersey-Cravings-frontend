import HeroBanner from "@/components/modules/Home/HeroBanner";
import FindYourTeam from "@/components/modules/Home/FindYourTeam";
import FeaturedProducts from "@/components/modules/Home/FeaturedProducts";

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <HeroBanner />
            <FindYourTeam />
            <FeaturedProducts />
        </div>
    );
}
