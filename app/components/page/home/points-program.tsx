import Button from "@/components/global/button";
import Card from "@/components/global/card";
import { useTheme } from "@/components/providers/themeProvider";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";

const PointsProgram = () => {
    const { themeIsDark } = useTheme();

    return (
        <Card className="flex-1 flex flex-row justify-between gap-0 relative overflow-hidden">
            <div className="flex flex-col gap-8 z-10">
                <div className="flex items-start">
                    <div className="flex-1 flex-col">
                        <div className="font-bold text-2xl text-escher-gray600 dark:text-white">ePoints Program</div>
                        <div className="text-escher-gray400 dark:text-escher-777e90">Earn more points when you stake.</div>
                    </div>
                </div>

                <Button
                    title="ePoints Dashboard"
                    preComponent={
                        <div className="flex items-center justify-center rounded-full bg-escher-electricblue_light2 p-1">
                            <Image src="/icons/sidebar/epoints-blue.svg" alt="ePoints" width={24} height={24} />
                        </div>
                    }
                    style="fill-light"
                    type="link"
                    url="/epoints"
                    className="self-start text-sm font-bold gap-2 py-3"
                />
            </div>
            <motion.div
                animate={{
                    rotate: 360
                }}
                transition={{
                    rotate: { repeat: Infinity, duration: 20, ease: "linear" },
                }}
                className={clsx(
                    "absolute -top-12 right-5 w-[210px] h-[210px] bg-contain bg-right bg-no-repeat opacity-50",
                    themeIsDark ? "bg-[url('/images/point-program-transparent-white-v2.png?v=3')]" : "bg-[url('/images/point-program-transparent-v2.png?v=3')]"
                )}
            />
        </Card>
    );
}

export default PointsProgram;