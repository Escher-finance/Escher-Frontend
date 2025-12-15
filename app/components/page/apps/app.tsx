import { Dapp, DappTag } from "@/app/apps/page";
import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import Image from "next/image";
import Link from "next/link";

interface Props {
    app: Dapp
}

export const Tag = ({ tag }: { tag: DappTag }) => {
    switch (tag) {
        case "lending": return (
            <div className="flex items-center gap-[6px] bg-escher-blue50 text-escher-blue700 text-xs font-medium rounded-full py-0.5 px-2">
                <Icon type="FaCircle" size="xs" className="text-escher-blue500" />
                <div>LENDING</div>
            </div>
        );
        case "yield": return (
            <div className="flex items-center gap-[6px] bg-escher-purple50 text-escher-purple700 text-xs font-medium rounded-full py-0.5 px-2">
                <Icon type="FaCircle" size="xs" className="text-escher-purple500" />
                <div>YIELD AGGREGATION</div>
            </div>
        );
        case "pools": return (
            <div className="flex items-center gap-[6px] bg-escher-orange50 dark:bg-[#202338] text-escher-orange700 dark:text-[#b93814] text-xs font-medium rounded-full py-0.5 px-2">
                <Icon type="FaCircle" size="xs" className="text-escher-orange700" />
                <div>LIQUIDITY POOLS</div>
            </div>
        );
    }
}

const App = (props: Props) => {
    return (
        <Card className="gap-6 min-h-[367px]">
            <div className="flex items-start justify-between">
                <Image src={props.app.logo} alt="" width={54} height={54} />
                <Link
                    href={props.app.link}
                    target="_blank"
                    className="text-escher-electricblue dark:text-white text-sm font-medium flex gap-2 items-center"
                >
                    <div>{props.app.linkText}</div>
                    <Icon type="FiArrowUpRight" />
                </Link>
            </div>
            <div className="flex-1 flex flex-col gap-2">
                <div className="text-escher-gray900 dark:text-white text-2xl font-semibold">{props.app.name}</div>
                <div className="text-escher-gray500 dark:text-white text-sm">{props.app.description}</div>
            </div>

            <div className="self-start bg-escher-F0F1F5 rounded-full py-0.5 pl-0.5 pr-2 flex gap-1 text-escher-electricblue dark:text-white text-xs font-medium">
                <Image src={"/images/points/escher.svg"} alt="" width={14} height={14} />
                <Image src={"/images/points/union.svg"} alt="" width={14} height={14} />
                <Image src={"/images/points/tower.svg"} alt="" width={14} height={14} />
                <Image src={"/images/points/flash.svg"} alt="" width={14} height={14} />
                <div>Points</div>
            </div>
            <hr className="border border-gray-100" />
            <div className="flex justify-between items-end">
                <Tag tag={props.app.tag} />
                <div className="flex flex-col">
                    <div className="text-[10px] text-escher-gray400 dark:text-escher-777e90">Total Value Locked</div>
                    <div className="flex items-center gap-1">
                        <Icon type="FiChevronRight" className="text-escher-gray400 dark:text-escher-777e90" />
                        <div className="text-escher-electricblue dark:text-white text-sm font-semibold">{props.app.value}</div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default App;