import { useTheme } from "@/components/providers/themeProvider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useHover } from "@uidotdev/usehooks";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import Icon from "../icons";

interface Props {
    icon: string
    iconActive: string
    title: string
    active: boolean
    iconDarkActive: string
    child: {
        url: string
        title: string
        active: boolean
        enabled: boolean
    }[]
}

const SidebarMenuMulti = (props: Props) => {
    const { themeIsDark } = useTheme();
    const [ref, hovering] = useHover();
    const [open, setOpen] = useState(false);

    let activeClass = '';
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
        <Accordion type="single" collapsible onValueChange={v => setOpen(v === 'item-1')}>
            <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger
                    ref={ref}
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
                    <Image src={icon} width={24} height={24} alt="" className="w-6 h-6" width={24} height={24} />
                    <div className="flex-1">{props.title}</div>
                    <Icon type="FaChevronRight" size="sm" className={`${open && 'rotate-90'} transition-all`} />
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-escher-777e90 text-sm font-medium pl-10 py-2">
                    {props.child.map((c, v) =>
                        <Link
                            key={v}
                            href={c.url}
                            className={clsx(
                                `flex gap-3 items-center`,
                                c.active ? "text-escher-electricblue dark:text-white" : "text:white",
                                c.enabled ? "hover:text-escher-electricblue dark:hover:text-white dark:text-escher-777e90" : "cursor-default"
                            )}
                        >
                            <Icon type="FaCircle" className="w-1.5 h-1.5" />
                            <div>{c.title}</div>
                        </Link>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

export default SidebarMenuMulti;