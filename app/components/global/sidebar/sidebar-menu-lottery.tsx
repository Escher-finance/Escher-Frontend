import { useTheme } from "@/components/providers/themeProvider";
import { useHover } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";
import ComingSoon from "../comingSoon";

interface Props {
    url?: string
    title: string
    icon: string
    iconActive: string
    iconDarkActive: string
    active?: boolean
}

const SidebarMenuLottery = (props: Props) => {
    const { themeIsDark } = useTheme();
    const [ref, hovering] = useHover();

    let activeClass;
    if (props.active) {
        activeClass = 'text-escher-electricblue dark:text-white bg-escher-electricblue_light2 dark:bg-escher-darkblue_4';
    }

    const icon = useMemo(() => {
        if (hovering || props.active) {
            return themeIsDark ? props.iconDarkActive : props.iconActive;
        }
        return props.icon;
    }, [themeIsDark, hovering, props.active, props.icon, props.iconActive, props.iconDarkActive]);

    return (
        <div className="relative">
            <Link
                ref={ref}
                href={props.url ?? "#"}
                className={twMerge(
                    `
                        flex items-center rounded-lg font-semibold text-sm px-4 py-2 gap-2 transition-all
                        hover:bg-escher-electricblue_light2 dark:hover:bg-escher-darkblue_4
                        text-escher-777e90 dark:text-escher-c3c3c3
                        hover:text-escher-electricblue dark:hover:text-white
                    `,
                    activeClass
                )}
            >
                <Image src={icon} width={24} height={24} alt="" />
                <div>{props.title}</div>
            </Link>
            {props.url === undefined &&
                <ComingSoon size="sm" showText={false} brightness="light" />
            }
            <motion.img
                src={"/images/lottery/sidebar.png"}
                className="absolute -right-4 -top-5 bottom-0 z-10 w-full pointer-events-none"
                initial={{ y: "15%" }}
                animate={{ y: "20%" }}
                transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity, repeatType: "reverse" }}
            />
        </div>
    );
}

export default SidebarMenuLottery;