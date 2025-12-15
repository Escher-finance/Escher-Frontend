import Icon from "@/components/global/icons";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface Props {
    active: boolean
    title: string
    subtitle: string
    onClick(): void
}

export default function UnbondTypeOption(props: Props) {
    return (
        <button
            onClick={props.onClick}
            className={
                clsx(
                    'flex-1 flex gap-2 hover:bg-slate-50 dark:hover:bg-escher-darkblue_5 border border-escher-F1F1F1 dark:border-escher-darkblue_border rounded-xl p-2 leading-none',
                    props.active ? "border-escher-DADBFF" : ""
                )
            }
        >
            <div
                className={clsx(
                    "p-2 shadow-sm border border-escher-gray200 dark:border-escher-darkblue_border flex items-center justify-center aspect-square self-center rounded-lg h-full w-auto",
                    props.active ? "bg-escher-E2E3FF dark:bg-escher-darkblue_5 border-escher-D7D8FF dark:border-escher-darkblue_border" : ""
                )}>
                <Icon
                    type={"FaRegCircle"}
                    size="md"
                    className={props.active ? "text-escher-electricblue dark:text-white" : "text-escher-gray300 dark:text-escher-darkblue_border"}
                />
            </div>
            <div className="flex flex-col items-start">
                <div className={clsx(
                    "text-sm font-semibold text-escher-text",
                    props.active ? "text-escher-electricblue dark:text-white" : "text-gray-700"
                )}>{props.title}</div>
                <div className={twMerge("text-xs text-escher-text5", (props.active ? "text-escher-text dark:text-gray-400" : ""))}>{props.subtitle}</div>
            </div>
        </button>
    );
}