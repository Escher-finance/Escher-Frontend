import Button from "@/components/global/button";
import Card from "@/components/global/card";
import LotteryTnc from "@/components/modal/lotteryTnc/lotteryTnc";
import { useTheme } from "@/components/providers/themeProvider";
import clsx from "clsx";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Header = () => {
    const { themeIsDark } = useTheme();
    const [show, setShow] = useState(true);
    const reload = () => {
        setShow(false);
        setTimeout(() => setShow(true), 0); // triggers re-mount
    };

    if (!show) return <></>

    if (show)
        return (
            <Card className="flex flex-col items-center gap-2 p-0 pb-6 bg-[url('/images/lottery/sun.svg')] dark:bg-[url('/images/lottery/sun-dark.svg')] bg-cover relative">
                <div className="dark:hidden absolute inset-0 bg-linear-to-b from-transparent to-white to-90% rounded-lg" />
                <div className="dark:hidden absolute inset-0 bg-white opacity-50 rounded-lg" />
                <div className="absolute inset-0 z-10 overflow-hidden">
                    <motion.img
                        src={themeIsDark ? "/images/lottery/union-blue-light.png" : "/images/lottery/union-blue.png"}
                        className="absolute w-[145px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        initial={{ x: "-270%", y: "-110%" }}
                        animate={{ x: "-270%", y: "-80%" }}
                        transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.img
                        src={themeIsDark ? "/images/lottery/union-blue-light-blur.png" : "/images/lottery/union-blue-blur.png"}
                        className="absolute w-[105px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        initial={{ x: "270%", y: "-110%" }}
                        animate={{ x: "270%", y: "-80%" }}
                        transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.img
                        src={themeIsDark ? "/images/lottery/union-blue-light-blur.png" : "/images/lottery/union-blue-blur.png"}
                        className="absolute w-[125px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-x-[-1]"
                        initial={{ x: "-350%", y: "60%", scaleX: -1 }}
                        animate={{ x: "-350%", y: "70%", scaleX: -1 }}
                        transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.img
                        src={themeIsDark ? "/images/lottery/union-blue-light.png" : "/images/lottery/union-blue.png"}
                        className="absolute w-[225px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-x-[-1]"
                        initial={{ x: "70%", y: "15%", scaleX: -1 }}
                        animate={{ x: "70%", y: "20%", scaleX: -1 }}
                        transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity, repeatType: "reverse" }}
                    />
                </div>
                <div className="z-20 flex flex-col items-center">
                    <Link
                        href={"/faq?tab=luckydraw"}
                        className="absolute top-5 right-5 flex items-center gap-2 text-escher-777e90 text-sm font-semibold bg-escher-F1F2FB px-4 py-2 leading-none rounded-full hover:bg-slate-200 transition-all dark:bg-escher-dark_20324d dark:text-white"
                    >
                        <Image alt="" src="/icons/sidebar/faqs_icon_2.svg" className="w-5 h-5" width={20} height={20} />
                        <div>FAQ</div>
                    </Link>
                    <div className="text-4xl text-escher-electricblue dark:text-white font-extrabold font-funnel-display mt-10" onClick={reload}>Escher Lucky Draw</div>
                    <div className="text-[56px] text-escher-electricblue dark:text-white font-semibold font-funnel-display mt-0 leading-none" onClick={reload}>800K U in Prizes</div>
                    <Button
                        type="link"
                        title="Stake & Earn Tickets"
                        url="/liquid-staking?liquid=babylon"
                        className={clsx(
                            "mt-8",
                            "dark:bg-escher-dark_172c4d dark:text-white border dark:hover:bg-escher-darkblue_2 dark:hover:text-white border-[#ffffff10]"
                        )}
                    />
                    <LotteryTnc
                        className="mt-2"
                    />
                </div>
            </Card>
        );
}

export default Header;