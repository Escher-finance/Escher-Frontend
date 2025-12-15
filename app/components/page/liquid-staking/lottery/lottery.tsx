import Button from "@/components/global/button";
import Card from "@/components/global/card";

export default function Lottery() {
    return (
        <Card className="flex flex-row gap-4 dark:bg-escher-dark_0c203d">
            <div className="flex-1 flex flex-col">
                <div className="text-gray-600 dark:text-white text-lg font-semibold">Stake & earn tickets</div>
                <div className="text-escher-777e90 text-sm">Stand a chance to win from a 800,000 Union Token prize pool. Join the Escher Lucky Draw — prizes go to stakers.</div>
                <Button
                    title="Lucky Draw"
                    style="fill-light"
                    className="mt-4 self-start py-2 leading-none text-sm font-bold"
                    type="link"
                    url="/lucky-draw"
                />
            </div>
            <div className="w-1/3 flex flex-col items-center bg-escher-electricblue_light4 py-5 pb-0 rounded-lg text-escher-electricblue font-funnel-display">
                <div className="text-xs font-extrabold">Escher Lucky Draw</div>
                <div className="text-sm font-extrabold">800,000 U in Prizes</div>
                <div className="flex-1 flex items-center">
                    <Image alt="" src="/images/lottery/union-blue.png" alt="" className="w-[70px]" />
                </div>
            </div>
        </Card>
    );
}