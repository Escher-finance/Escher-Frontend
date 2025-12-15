import Button from "@/components/global/button";
import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import { useTheme } from "@/components/providers/themeProvider";
import Image from "next/image";
import { useMemo } from "react";

const Liquid = () => {
    const { themeIsDark } = useTheme();

    const icon = useMemo(() => {
        return !themeIsDark ? "/icons/dashboard/liquid_staking_blue.svg" : "/icons/dashboard/liquid_staking_white.svg";
    }, [themeIsDark]);

    return (
        <Card className="flex-1 flex flex-col justify-between">
            <div className="flex items-start">
                <div className="flex-1 flex-col">
                    <div className="font-bold text-2xl text-escher-gray600 dark:text-white">Liquid Staking</div>
                    <div className="text-escher-gray400 dark:text-escher-777e90">Earn rewards while staying flexible</div>
                </div>
                <div className="w-[52px] h-[52px] flex items-center justify-center bg-escher-electricblue_light9 dark:bg-escher-darkblue_3 rounded-full">
                    <Image src={icon} alt="" width={24} height={24} />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <Button
                    title="Get Liquid Staking Tokens"
                    preComponent={
                        <div className="flex items-center justify-center rounded-full bg-escher-electricblue_light2 p-1">
                            <Icon type="FiPlus" className="w-6 h-6 text-escher-electricblue dark:text-escher-electricblue" />
                        </div>
                    }
                    style="fill-light"
                    type="link"
                    url="/liquid-staking"
                    className="self-start text-sm font-bold gap-2 py-3.5"
                />
            </div>
        </Card>
    );
}

export default Liquid;