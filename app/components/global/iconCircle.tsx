import { twMerge } from "tailwind-merge";
import Icon, { IconSize, IconType } from "./icons";

interface Props {
    icon: IconType
    size?: IconSize;
    className?: string
}

const SIZE_CLASS_DICT: Record<IconSize, string> = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
};

const IconCircle = ({ icon, size = 'md', className }: Props) => {
    const sizeClassName = SIZE_CLASS_DICT[size];

    return (
        <div
            className={
                twMerge(
                    "text-escher-electricblue dark:text-white bg-escher-gray100 rounded-full flex items-center justify-center",
                    sizeClassName,
                    className
                )
            }
        >
            <Icon type={icon} size={size} />
        </div>
    );
}

export default IconCircle;