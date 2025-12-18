import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { DialogContent, DialogEmpty, DialogTitle } from "@/components/ui/dialog-empty";
import { getErrorMessage } from "@/lib/error-msg";
import { useState } from "react";

interface Props {
    open: boolean
    error: string
    setOpen(val: boolean): void
}

const Error = (props: Props) => {
    const [showDetails, setShowDetails] = useState(false);

    const errorMsgs = getErrorMessage(props.error);
    return (
        <DialogEmpty open={props.open} onOpenChange={props.setOpen}>
            <DialogContent
                className="w-fit rounded-[20px] md:rounded-[20px] lg:rounded-[20px] border border-escher-e4e8ed dark:border-escher-darkblue_border"
            >
                <div className="flex flex-col w-full p-2">
                    <DialogTitle className="hidden"></DialogTitle>

                    <div className="w-[464px] flex flex-col p-4 gap-4 items-center bg-[url('/images/modal-bg.svg')] dark:bg-none bg-cover bg-top bg-no-repeat">
                        <button
                            className="self-end rounded-full border border-gray-300 text-gray-400 p-1.5"
                            onClick={() => props.setOpen(false)}
                        >
                            <Icon type="FaTimes" />
                        </button>

                        <div className="bg-red-100 rounded-full p-3" onClick={() => console.log(props.error)}>
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
                                <div className="max-h-[300px] w-full overflow-y-auto break-all text-sm text-gray-600">{props.error.toString()}</div>
                            }
                        </div>

                        <Button
                            title="Close"
                            style="fill"
                            preIcon="FaRegTimesCircle"
                            onClick={() => props.setOpen(false)}
                            className="py-2 gap-2 w-full"
                        />
                    </div>
                </div>
            </DialogContent>
        </DialogEmpty >
    );
}


export default Error;