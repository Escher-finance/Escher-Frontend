import { ReactNode } from "react";
import { twMerge } from "tailwind-merge"

interface Props {
    children: ReactNode;
    className?: string
}

const Card = (props: Props) => {
    return (
        <div
            className={twMerge(
                "bg-white dark:bg-escher-darkblue rounded-lg border border-escher-e4e8ed dark:border-escher-darkblue_border p-6 flex flex-col",
                props.className
            )}>
            {props.children}
        </div>
    );
}

export default Card;