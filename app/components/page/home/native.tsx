import Button from "@/components/global/button";
import Card from "@/components/global/card";
import Image from "next/image";

const Native = () => {
    return (
        <Card className="flex-1 flex flex-col justify-between gap-8">
            <div className="flex items-start">
                <div className="flex-1 flex-col">
                    <div className="font-bold text-2xl text-escher-gray600 dark:text-white">Native Staking</div>
                    <div className="text-escher-gray400 dark:text-escher-777e90">Secure networks and earn rewards</div>
                </div>
                <div className="w-[52px] h-[52px] flex items-center justify-center bg-escher-electricblue_light9 rounded-full">
                    <Image src={'/icons/dashboard/native_staking_icon.svg'} alt="" width={40} height={40} />
                </div>
            </div>

            <Button
                title="Coming soon"
                style="fill-light"
                type="link"
                url="#"
                className="self-start text-sm font-bold gap-2 py-3.5 bg-escher-gray200 text-gray-400"
            />
        </Card>
    );
}

export default Native;