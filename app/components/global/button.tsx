import Link from "next/link";
import { HTMLAttributeAnchorTarget, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import Icon, { IconType } from "./icons";
import LdrsAnimation from "./ldrsAnimation";

interface Props {
    className?: string
    enabled?: boolean
    isLoading?: boolean
    onClick?(): void
    postIcon?: IconType
    preComponent?: ReactNode
    preIcon?: IconType
    size?: 'md' | 'sm'
    style?: 'fill' | 'fill-light' | 'outline' | 'text'
    target?: HTMLAttributeAnchorTarget
    title: string
    type?: 'button' | 'link'
    url?: string
}

const Button = (props: Props) => {
    const enabled = (props.enabled ?? true) && !(props.isLoading ?? false);

    let styleProps = '';
    switch (props.style ?? 'fill') {
        case 'fill':
            styleProps = enabled ? 'bg-escher-electricblue dark:bg-white text-white dark:text-black hover:bg-escher-electricblue_light1 dark:hover:bg-gray-300' : 'bg-slate-400 text-white';
            break;
        case 'fill-light':
            styleProps = 'bg-escher-electricblue_light2 dark:bg-escher-1a2d49 text-escher-electricblue dark:text-white hover:bg-escher-electricblue_light3 dark:hover:bg-escher-243f67';
            break;
        case 'outline':
            styleProps = 'bg-transparent border border-escher-electricblue text-escher-electricblue dark:text-white hover:bg-slate-100';
            break;
        case "text":
            styleProps = 'text-escher-electricblue dark:text-white hover:text-escher-electricblue dark:text-white_light1';
            break;
    }

    let sizeProps = '';
    switch (props.size ?? 'md') {
        case 'md':
            sizeProps = 'px-4 py-3';
            break;
        case 'sm':
            sizeProps = 'px-4 py-2 text-sm';
            break;
    }
    if (props.style === 'text') {
        sizeProps = 'p-0 text-sm';
    }

    if ((props.type ?? 'button') === 'button') {
        return (
            <button
                onClick={props.onClick}
                disabled={props.isLoading || !enabled}
                className={twMerge(`flex gap-4 font-bold items-center rounded-lg justify-center transition-all`, styleProps, sizeProps, props.className)}
            >
                {props.isLoading ?
                    <LdrsAnimation color="#fff" />
                    :
                    <>
                        {props.preComponent &&
                            props.preComponent
                        }
                        {props.preIcon &&
                            <Icon type={props.preIcon} />
                        }
                        <div>{props.title}</div>
                        {props.postIcon &&
                            <Icon type={props.postIcon} />
                        }
                    </>
                }
            </button >
        );
    }

    return (
        <Link
            href={props.url ?? '#'}
            onClick={props.onClick}
            target={props.target}
            className={twMerge(`flex gap-4 items-center justify-center px-4 py-2 font-medium rounded-lg transition-all`, styleProps, sizeProps, props.className)}
        >
            {props.preComponent &&
                props.preComponent
            }
            {props.preIcon &&
                <Icon type={props.preIcon} />
            }
            <div>{props.title}</div>
            {props.postIcon &&
                <Icon type={props.postIcon} />
            }
        </Link >
    );
}

export default Button;