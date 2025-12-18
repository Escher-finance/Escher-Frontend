import { CustomToken, LiquidStaking } from "@/types/chain";
import clsx from "clsx";
import { useState } from "react";
import GroupedTokens from "./groupedTokens";

interface Props {
    tokens: {
        baby: CustomToken[];
        ebaby: CustomToken[];
        u: CustomToken[];
        eu: CustomToken[];
    }
}

const GroupedTokens2 = (props: Props) => {
    const [lst, setLst] = useState<LiquidStaking>("babylon");

    return (
        <div className="bg-escher-f5f6f8 dark:bg-escher-darkblue rounded-lg flex flex-col py-4">
            {/* 
                <div className="flex items-center gap-2 mx-4">
                <div className="text-xs text-escher-gray800 dark:text-white">Liquid Staking Tokens</div>
                <div className="text-[8px] text-escher-electricblue bg-escher-electricblue_light4 aspect-square flex items-center  justify-center w-3 h-3 rounded-full">4</div>
            </div>
                */}
            <div className="rounded-lg text-white grid grid-cols-2 mx-4 mb-2">
                <ButtonLst
                    active={lst === "babylon"}
                    icon="/images/token/e-babylon.svg"
                    onClick={() => setLst("babylon")}
                    title="Babylon"
                    position="left"
                />
                <ButtonLst
                    active={lst === "union"}
                    icon="/images/token/e-union.svg"
                    onClick={() => setLst("union")}
                    title="Union"
                    position="right"
                />
            </div>
            {lst === "babylon" && <>
                <GroupedTokens
                    tokens={props.tokens.ebaby}
                />
                <GroupedTokens
                    tokens={props.tokens.baby}
                />
            </>}
            {lst === "union" && <>
                <GroupedTokens
                    tokens={props.tokens.eu}
                />
                <GroupedTokens
                    tokens={props.tokens.u}
                />
            </>}
        </div>
    );
}

export default GroupedTokens2;

const ButtonLst = (props: { active: boolean, onClick(): void, title: string, icon: string, position: "left" | "right" }) => {
    return (
        <button
            className={clsx(
                "flex items-center justify-center gap-1 py-2",
                props.position === "left" ? "rounded-l-lg" : "rounded-r-lg",
                "bg-escher-electricblue_light2",
                "dark:hover:bg-escher-darkblue_2",
                props.active && "dark:bg-escher-darkblue_2 border border-escher-electricblue dark:border-escher-darkblue_border",
                props.active ? "text-escher-electricblue dark:text-white" : "text-gray-400 dark:bg-escher-dark_0c203d",
            )}
            onClick={props.onClick}
        >
            {/* <Image alt="" src={props.icon} className="w-4 h-4" width={16} height={16} /> */}
            <div className="text-sm font-semibold">{props.title}</div>
        </button>
    );
}