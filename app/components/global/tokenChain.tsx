import { CustomToken } from "@/types/chain";
import Image from "next/image";

interface Props {
    token: CustomToken
    tokenSize?: number
    chainSize?: number
    chainTextSize?: number
    chainTextCircleSize?: number
    showChain?: boolean
}

const TokenChain = (props: Props) => {
    return (
        <div className="relative">
            {props.token.icon &&
                <Image src={props.token.icon} width={props.tokenSize ?? 24} height={props.tokenSize ?? 24} alt="" className="rounded-full" />
            }
            {((props.showChain ?? true) && !props.token.isNative) &&
                <>
                    {(props.token.chain.icon) ?
                        <Image src={props.token.chain.icon} width={props.chainSize ?? 14} height={props.chainSize ?? 24} alt="" className="rounded-full absolute -right-1 -bottom-1 border border-white" />
                        :
                        <div
                            className={`absolute -right-1 -bottom-1 text-[${props.chainTextSize ?? 8}px] font-bold border border-white text-white bg-black rounded-full flex justify-center items-center w-[${props.chainTextCircleSize ?? 14}px] h-[${props.chainTextCircleSize ?? 14}px]`}
                        >{props.token.chain.name[0]}</div>
                    }
                </>
            }
        </div>
    );
}

export default TokenChain;