import LdrsAnimation from "@/components/global/ldrsAnimation";
import { Validator } from "@/types/types";

interface Props {
    validator?: Validator
}

const Item = (props: { title: string, content: string }) => {
    return (<>
        <div className="font-medium text-sm text-slate-400 mt-4 leading-none">{props.title}</div>
        <div className="text-slate-50 font-bold mt-1 leading-none">{props.content}</div>
    </>);
}

const ValidatorInfo = (props: Props) => {
    return (
        <div
            className="col-span-2 row-span-2 flex flex-col bg-slate-800 text-slate-50 rounded p-8 leading-none overflow-x-scroll"
            onClick={() => console.log(props.validator)}
        >
            <div className="text-xl font-bold">Validator Info</div>
            {props.validator ?
                <>
                    <Item
                        title={"Name"}
                        content={props.validator.data.description.moniker}
                    />
                    <Item
                        title={"Address"}
                        content={props.validator.address}
                    />
                    <Item
                        title={"Description"}
                        content={props.validator.data.description.details}
                    />
                </>
                :
                <div>
                    <LdrsAnimation />
                </div>
            }
        </div>
    );
}

export default ValidatorInfo;