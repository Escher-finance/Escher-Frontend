import { twMerge } from "tailwind-merge"

interface Props {
    text?: string
    className?: string
}

const NoData = (props: Props) => {
    return (
        <div className={twMerge("text-sm text-center font-medium text-escher-gray500 dark:text-white my-4", props.className)}>-- {props.text ?? "No Data"} --</div>
    );
}

export default NoData;