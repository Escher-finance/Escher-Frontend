import Card from "@/components/global/card";
import Image from "next/image";

interface Props {
    symbol: string
    name: string
    balance: string
    value: string
    logo: string
}

const Token = (props: Props) => {
    return (
        <Card className="flex flex-col justify-between gap-6 p-4">
            <Image src={props.logo} alt="" width={32} height={32} />
            <div className="flex justify-between">
                <div className="flex flex-col leading-none">
                    <div className="font-bold text-escher-gray800 dark:text-white">{props.symbol}</div>
                    <div className="text-xs text-escher-gray400 dark:text-escher-777e90">{props.name}</div>
                </div>
                <div className="flex flex-col leading-none">
                    <div className="font-bold text-escher-gray600 dark:text-white">{props.balance}</div>
                    <div className="text-xs text-escher-gray400 dark:text-escher-777e90">{props.value}</div>
                </div>
            </div>
        </Card>
    );
}

export default Token;