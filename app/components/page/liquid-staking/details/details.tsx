import Card from "@/components/global/card";
import { useTheme } from "@/components/providers/themeProvider";
import { formatNumber } from "@/lib/utils";
import { CustomToken } from "@/types/chain";
import Detail from "./detail";

interface Props {
    token: {
        native: CustomToken | undefined
        liquid: CustomToken | undefined
    }
    inflation?: number
}

const Details = (props: Props) => {
    const { themeIsDark } = useTheme();
    return (
        <Card className="relative text-escher-gray600 dark:text-white text-sm font-medium py-2 dark:bg-escher-dark_0c203d">
            <div className="text-sm font-semibold mb-4 mt-2">Staking details</div>

            <Detail
                icon={"/icons/staking/fee_icon.svg"}
                iconDark={"/icons/staking/fee_icon-dark.svg"}
                value={"10%"}
                title={"Fee"}
                themeIsDark={themeIsDark}
            />
            <Detail
                icon={"/icons/staking/inflation_icon.svg"}
                iconDark={"/icons/staking/inflation_icon-dark.svg"}
                value={props.inflation ? `${formatNumber(props.inflation * 100)}%` : "-"}
                title={"Inflation"}
                themeIsDark={themeIsDark}
            />
            <Detail
                icon={"/icons/staking/price_icon.svg"}
                iconDark={"/icons/staking/price_icon-dark.svg"}
                value={props.token.liquid?.coingeckoPrice ? `$${formatNumber(props.token.liquid?.coingeckoPrice, false, 4)}` : "-"}
                title={`${props.token.liquid?.symbol} Price`}
                themeIsDark={themeIsDark}
            />
            <Detail
                icon={"/icons/staking/price_icon.svg"}
                iconDark={"/icons/staking/price_icon-dark.svg"}
                value={props.token.native?.coingeckoPrice ? `$${formatNumber(props.token.native?.coingeckoPrice, false, 4)}` : "-"}
                title={`${props.token.native?.symbol} Price`}
                themeIsDark={themeIsDark}
            />
        </Card>
    );
}

export default Details;