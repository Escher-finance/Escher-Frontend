import Card from "@/components/global/card";
import Icon from "@/components/global/icons";
import Link from "next/link";
import Token from "./liquid-tokens/token";

const LiquidTokens = () => {
    return (
        <div className="grid grid-cols-5 gap-6">
            <Token
                symbol={"eU"}
                name={"Union"}
                balance={"10.00"}
                value={"$50"}
                logo={"/images/token-eu.png"}
            />
            <Token
                symbol={"eBABYLON"}
                name={"Babylon"}
                balance={"10.00"}
                value={"$50"}
                logo={"/images/token-ebabylon.png"}
            />
            <Token
                symbol={"eBERA"}
                name={"Berachain"}
                balance={"10.00"}
                value={"$50"}
                logo={"/images/token-bera.png"}
            />
            <Link href={'/liquid-staking'} className="flex w-full">
                <Card className="w-full bg-escher-electricblue_light6 text-escher-electricblue dark:text-white p-4 flex flex-col justify-between hover:bg-escher-electricblue_light7 transition-all">
                    <div className="bg-escher-electricblue_light7 rounded-full aspect-square self-start p-2 w-8 h-8">
                        <Icon type="FiPlus" />
                    </div>
                    <div className="font-medium text-xs">Get Liquid Staking Tokens</div>
                </Card>
            </Link>
        </div>
    );
}

export default LiquidTokens;