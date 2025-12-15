import Card from "@/components/global/card";

const Odds = () => {
    return (
        <Card className="min-h-[236px] text-sm">
            <div className="text-escher-667085 dark:text-white">My Winning Odds</div>
            <div className="text-escher-black dark:text-white text-3xl font-semibold">0.3%</div>

            <div className="text-escher-667085 dark:text-white mt-8">Average Winning Odds</div>
            <div className="text-escher-black dark:text-white text-3xl font-semibold">0.5%</div>
        </Card>
    );
}

export default Odds;