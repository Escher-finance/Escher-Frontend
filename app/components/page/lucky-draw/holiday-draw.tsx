import Card from "@/components/global/card";
import { LotteryList } from "./shared";
import { useTheme } from "@/components/providers/themeProvider";

const HolidayDraw = () => {
    const { themeIsDark } = useTheme();

    return (
        <Card className="flex gap-2 dark:bg-escher-dark_0c203d">
            <div
                className="text-escher-37383C dark:text-white font-bold w-full text-center bg-[url('/images/lottery/bg-holiday.png')] dark:bg-[url('/images/lottery/bg-holiday-dark.png')] bg-cover py-[6px] leading-none mb-2"
            >HOLIDAY DRAW</div>
            <LotteryList
                title={"Prize"}
                subtitle={"800K in U tokens or eU equivalent"}
                icon={themeIsDark ? "/icons/lottery/award-02-white.svg" : "/icons/lottery/award-02.svg"}
                isDone={false}
            />
            <LotteryList
                title={"Prize Share"}
                subtitle={
                    <>1<sup className="font-normal">st</sup> Place, 2<sup className="font-normal">nd</sup> Place, 3<sup className="font-normal">rd</sup> Place</>
                }
                icon={themeIsDark ? "/icons/lottery/champion-white.svg" : "/icons/lottery/champion.svg"}
                isDone={false}
            />
            <LotteryList
                title={"When"}
                subtitle={"20th December, 2025"}
                icon={themeIsDark ? "/icons/lottery/calendar-04-white.svg" : "/icons/lottery/calendar-04.svg"}
                isDone={false}
            />
        </Card>
    );
}

export default HolidayDraw;