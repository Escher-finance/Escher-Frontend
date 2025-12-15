import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { getErrorMessage } from "@/lib/error-msg";
import { useState } from "react";

interface Props {
    error?: string
    onClose(): void
}

const Error = (props: Props) => {
    const [showDetails, setShowDetails] = useState(false);

    const errorMsgs = getErrorMessage(props.error);

    return (
        <div className="w-[464px] flex flex-col p-4 gap-4 items-center bg-[url('/images/modal-bg.svg')] dark:bg-none bg-cover bg-top bg-no-repeat">
            <button
                className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                onClick={props.onClose}
            >
                <Icon type="FaTimes" />
            </button>

            <div className="bg-red-100 dark:bg-escher-dark_384961 rounded-full p-3">
                <Icon type="BsExclamationCircle" size="xl" className="text-red-500" />
            </div>
            <div className="text-2xl font-bold text-escher-gray800 dark:text-white">{errorMsgs?.at(0) ?? "Something went wrong!"}</div>
            <div className="bg-red-100 border border-red-500 rounded-lg p-4 w-full flex flex-col gap-2 items-start">
                {errorMsgs?.at(1) &&
                    <div className="text-red-700 text-sm font-medium">{errorMsgs?.at(1)}</div>
                }
                <button onClick={() => setShowDetails(prev => !prev)} className="flex items-center text-xs text-red-500 font-semibold gap-1">
                    <div>Show Details</div>
                    {showDetails ?
                        <Icon type="FaChevronDown" size="sm" />
                        :
                        <Icon type="FaChevronDown" size="sm" className="rotate-180" />
                    }
                </button>
                {showDetails &&
                    <div className="max-h-[300px] w-full overflow-y-auto break-all text-sm text-gray-600">{props.error}</div>
                }
            </div>

            <Button title="Close" style="fill" preIcon="FaRegTimesCircle" onClick={props.onClose} className="py-2 gap-2 w-full" />
        </div>
    );
}

export default Error;