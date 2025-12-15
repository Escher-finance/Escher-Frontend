import Card from "@/components/global/card";
import { LotteryList } from "./shared";
import { useTheme } from "@/components/providers/themeProvider";

const FirstDraw = () => {
    const { themeIsDark } = useTheme();

    return (
        <Card className="flex gap-2 dark:bg-escher-dark_0c203d">
            <div
                className="text-escher-37383C dark:text-white font-bold w-full text-center bg-[url('/images/lottery/bg-first-draw-gray.png')] dark:bg-[url('/images/lottery/bg-first-draw-dark.png')] bg-cover py-[6px] leading-none mb-2 rounded-lg flex items-center justify-center relative"
            >
                <div>FIRST DRAW</div>
                <Image alt="" src={"/images/lottery/done.png"} className="absolute h-[31px]" />
            </div>
            <LotteryList
                title={"Prize"}
                subtitle={"$5,000 in U Tokens @TGE price"}
                icon={themeIsDark ? "/icons/lottery/award-02-white.svg" : "/icons/lottery/award-02-gray.svg"}
                isDone={true}
            />
            <LotteryList
                title={"Winner"}
                subtitle={"bbn1uz...a9k4gx7vr"}
                icon={themeIsDark ? "/icons/lottery/champion-white.svg" : "/icons/lottery/champion-gray.svg"}
                isDone={true}
            />
            <LotteryList
                title={"When"}
                subtitle={"4th September, 2025"}
                icon={themeIsDark ? "/icons/lottery/calendar-04-white.svg" : "/icons/lottery/calendar-04-gray.svg"}
                isDone={true}
            />
        </Card>
    );
}

export default FirstDraw;