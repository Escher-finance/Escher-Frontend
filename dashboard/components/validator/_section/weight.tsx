import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Validator } from "@/types/types";

interface Props {
    validator?: Validator
}

const Weight = (props: Props) => {
    return (
        <div className="flex flex-col items-center gap-1 bg-sky-900 text-sky-50 rounded py-8">
            <div className="flex-1 flex flex-col items-center">
                {props.validator ?
                    <div className="text-xl md:text-5xl font-bold">{props.validator.weight}%</div>
                    :
                    <LdrsAnimation />
                }
            </div>
            <div className="text-sm font-medium opacity-80">Weight</div>
        </div>
    );
}

export default Weight;