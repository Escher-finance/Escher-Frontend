import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Validator } from "@/types/types";

interface Props {
    validator?: Validator
}

const Commission = (props: Props) => {
    return (
        <div className="flex flex-col items-center gap-1 bg-emerald-900 text-emerald-50 rounded py-8">
            <div className="flex-1 flex flex-col items-center">
                {props.validator ?
                    <div className="text-xl md:text-5xl font-bold">{props.validator.commission * 100}%</div>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80">Commission</div>
        </div>
    );
}

export default Commission;