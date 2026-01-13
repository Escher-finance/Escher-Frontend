import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { HTMLAttributeAnchorTarget } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
    url: string
    target?: HTMLAttributeAnchorTarget | undefined
    title: string
    preImage?: string
    postImage?: string
    className?: string
}

const ButtonLink = (props: Props) => {
    return (
        <Link
            href={props.url}
            target={(props.url !== "#") ? (props.target ?? "_blank") : undefined}
            className={twMerge("flex items-center gap-2 bg-primary hover:opacity-80 transition-all rounded-lg px-6 py-3 font-bold text-white", props.className)}
        >
            {props.preImage &&
                <Image src={props.preImage} alt="" width={16} height={16} />
            }

            <div>{props.title}</div>

            {props.postImage &&
                <Image src={props.postImage} alt="" width={16} height={16} />
            }
        </Link>
    );
}

export default ButtonLink;