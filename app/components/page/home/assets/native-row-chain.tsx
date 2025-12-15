import Image from "next/image"

interface Props {
    chainLogo: string
    chainName: string
    validatorLogo: string
    validatorName: string
    balance: string
    commision: string
    reward: string
}

const AssetsNativeRowChain = (props: Props) => {
    return (
        <tr>
            <td>
                <div className="py-3 flex">
                    <div className="flex items-center gap-2 bg-escher-gray200 rounded-full px-1.5 py-1">
                        <Image src={props.chainLogo} width={20} height={20} alt="" className="rounded-full" />
                        <div className="font-medium text-black dark:text-white">{props.chainName}</div>
                    </div>
                </div>
            </td>
            <td>
                <div className="py-3 flex">
                    <div className="flex items-center gap-2 bg-escher-gray200 rounded-full px-1.5 py-1">
                        <Image src={props.validatorLogo} width={20} height={20} alt="" className="rounded-full" />
                        <div className="font-medium text-black dark:text-white">{props.validatorName}</div>
                    </div>
                </div>
            </td>
            <td className="font-semibold text-escher-gray500 dark:text-white">{props.balance}</td>
            <td className="font-semibold text-escher-gray500 dark:text-white">{props.commision}</td>
            <td className="font-semibold text-escher-gray500 dark:text-white">{props.reward}</td>
        </tr >
    );
}

export default AssetsNativeRowChain;