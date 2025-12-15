import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface Props {
    size?: 'xs' | 'sm' | 'md' | 'lg'
    brightness?: 'light' | 'medium' | 'dark'
    showPill?: boolean
    showText?: boolean
    className?: string
}

const ComingSoon = (props: Props) => {

    let sizeClass;
    switch ((props.size ?? 'md')) {
        case 'xs':
            sizeClass = 'px-3 py-1.5 text-xs';
            break;
        case 'sm':
            sizeClass = 'px-3 py-1.5 text-sm';
            break;
        case 'md':
            sizeClass = 'px-4 py-2 text-base';
            break;
        case 'lg':
            sizeClass = 'px-4 py-2 text-xl';
            break;
    }

    let brightnessClass;
    switch ((props.brightness ?? 'medium')) {
        case 'light':
            brightnessClass = clsx('bg-escher-gray50 dark:bg-gray-700 bg-opacity-70 dark:bg-opacity-70');
            break;
        case 'medium':
            brightnessClass = clsx('bg-escher-gray100 dark:bg-gray-900 bg-opacity-85 dark:bg-opacity-85');
            break;
        case 'dark':
            brightnessClass = clsx('bg-escher-gray200 dark:bg-gray-900 bg-opacity-85 dark:bg-opacity-85');
            break;
    }

    return (
        <div
            className={twMerge(`absolute inset-0 z-10 flex items-center justify-center rounded-lg`, brightnessClass, props.className)}
        >
            {(props.showText ?? true) &&
                <div className={twMerge(`text-escher-electricblue dark:text-white rounded-full font-medium`, ((props.showPill ?? true) && 'bg-escher-electricblue_light2 dark:bg-escher-darkblue_1'), sizeClass)}>Coming soon</div>
            }
        </div>
    );
}

export default ComingSoon;