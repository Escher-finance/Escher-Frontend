import clsx from "clsx"
import Image from "next/image"

interface LotteryListProps {
    title: string
    subtitle: React.ReactNode
    icon: string
    isDone: boolean
}
export const LotteryList = (props: LotteryListProps) => {
    return (
        <div className="w-full flex items-center gap-2.5 bg-escher-F2F4F7 dark:bg-escher-darkblue rounded-full p-1">
            <div
                className={clsx(
                    "rounded-full flex items-center justify-center dark:bg-escher-1A2D49 aspect-square p-2",
                    props.isDone ? "bg-[#e7e7e7]" : "bg-escher-DADBFF"
                )}
            >
                <Image alt="" src={props.icon} className="w-5 h-5" width={20} height={20} />
            </div>
            <div className="flex flex-col gap-1 justify-center">
                <div className="text-xs text-escher-667085 leading-none">{props.title}</div>
                <div className="text-sm text-gray-600 dark:text-white font-semibold leading-none">{props.subtitle}</div>
            </div>
        </div>
    );
}