import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import { DEFIS } from "@/lib/defi";
import { formatNumber } from "@/lib/utils";
import { Defi } from "@/types/defi";
import Image from "next/image";
import Link from "next/link";
import { Tag } from "./app";

interface Props {
    defi: Defi
}

const AppOsmosis = (props: Props) => {

    const defi = DEFIS.osmosis;

    return (
        <Card className="gap-6 min-h-[367px] dark:bg-escher-dark_0c203d">
            <div className="flex items-start justify-between">
                <Image src={defi.logoUriApps} alt="" width={54} height={54} onClick={() => console.log({ defi })} />
                <Link
                    href={defi.link}
                    target="_blank"
                    className="text-escher-electricblue dark:text-white text-sm font-medium flex gap-2 items-center"
                >
                    <div>{defi.linkText}</div>
                    <Icon type="FiArrowUpRight" />
                </Link>
            </div>
            <div className="flex-1 flex flex-col gap-2">
                <div className="text-escher-gray900 dark:text-white text-2xl font-semibold">{defi.name}</div>
                <div className="text-escher-gray500 dark:text-white text-sm">{defi.description}</div>
            </div>

            <div className="self-start bg-escher-F0F1F5 dark:bg-escher-darkblue_2 rounded-full py-0.5 pl-0.5 pr-2 flex gap-1 text-escher-electricblue dark:text-white text-xs font-medium">
                <Image src={"/images/points/escher.svg"} alt="" width={14} height={14} />
                <Image src={"/images/points/flash.svg"} alt="" width={14} height={14} />
                <div>Points</div>
            </div>
            <hr className="border border-gray-100" />
            <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <div className="text-[10px] text-escher-gray400 dark:text-escher-777e90">LP TVL</div>
                    <div className="text-escher-electricblue dark:text-white text-sm font-semibold">${formatNumber(props.defi.tvl ?? 0)}</div>
                </div>
                <Tag tag={defi.tag} />
            </div>
        </Card >
    );
}

export default AppOsmosis;