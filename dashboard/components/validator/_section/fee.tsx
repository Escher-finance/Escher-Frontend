import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Validator } from "@/types/types";

interface Props {
    validator?: Validator
}

const Fee = (props: Props) => {
    return (
        <div className="flex flex-col items-center gap-1 bg-rose-900 text-rose-50 rounded py-8">
            <div className="flex-1 flex flex-col items-center">
                {props.validator ?
                    <div className="text-xl md:text-5xl font-bold">{Number(props.validator.fee ?? 0) * 100}%</div>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80">Escher Fee</div>
        </div>
    );
}

export default Fee;