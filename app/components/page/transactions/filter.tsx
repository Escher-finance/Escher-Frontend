import Icon, { IconType } from "@/components/global/icons";
import { useTheme } from "@/components/providers/themeProvider";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { LiquidStaking } from "@/types/chain";
import { Action, Status } from "@/types/transaction";
import clsx from "clsx";
import Image from "next/image";

interface Props {
    lst?: LiquidStaking
    operation?: Action
    status?: Status
    setLst(val?: LiquidStaking): void
    setOperation(val?: Action): void
    setStatus(val?: Status): void
}

export default function Filter(props: Props) {
    const { themeIsDark } = useTheme();

    return (
        <div className="bg-escher-fafbfc dark:bg-escher-darkblue rounded-b-lg items-center text-xs text-escher-777e90 dark:text-white font-medium px-6 py-3 grid grid-cols-11 w-full">
            {/* Operation */}
            <div className="relative">
                <Select
                    onValueChange={v => {
                        try {
                            if (v === "all") {
                                props.setOperation(undefined)
                            } else {
                                props.setOperation(v as Action)
                            }
                        } catch {
                            props.setOperation(undefined)
                        }
                    }}
                    value={props.operation ?? "all"}
                >
                    <SelectTrigger
                        className="w-fit border border-escher-dedfff dark:border-escher-darkblue_border px-2 py-1.5 text-escher-text4 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-escher-darkblue_2 transition-all"
                    >
                        <OperationTrigger
                            operation={props.operation}
                            themeIsDark={themeIsDark}
                        />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-escher-dark_0c203d dark:border-escher-darkblue_border">
                        <SelectItem
                            value={"all"}
                            className="cursor-pointer px-2 py-1.5 font-medium items-center rounded-lg"
                        >
                            <div className="pr-6 text-gray-500">=== All operations ===</div>
                        </SelectItem>
                        <OperationItem
                            value="bond"
                            themeIsDark={themeIsDark}
                            img={"/icons/transaction/stake.svg"}
                            imgDark={"/icons/transaction/stake-dark.svg"}
                            title={"Stake"}
                        />
                        <OperationItem
                            value="unbond"
                            themeIsDark={themeIsDark}
                            img={"/icons/transaction/unstake.svg"}
                            imgDark={"/icons/transaction/unstake-dark.svg"}
                            title={"Unstake"}
                        />
                        <OperationItem
                            value="dust"
                            themeIsDark={themeIsDark}
                            icon="MdGrain"
                            iconClassName="text-emerald-600 dark:text-emerald-300"
                            img={""}
                            imgDark={""}
                            title={"Dust recovery"}
                        />
                        <OperationItem
                            value="withdraw"
                            themeIsDark={themeIsDark}
                            icon="PiHandCoins"
                            iconClassName="text-escher-electricblue dark:text-escher-electricblue_light1"
                            img={""}
                            imgDark={""}
                            title={"Token withdraws"}
                        />
                        <OperationItem
                            value="bridge"
                            themeIsDark={themeIsDark}
                            img={"/icons/transaction/bridge.svg"}
                            imgDark={"/icons/transaction/bridge.svg"}
                            title={"Bridge"}
                        />
                    </SelectContent>
                </Select>
            </div>

            {/* LST */}
            <div className="col-span-4 flex justify-center">
                <Select
                    onValueChange={v => {
                        try {
                            if (v === "all") {
                                props.setLst(undefined)
                            } else {
                                props.setLst(v as LiquidStaking)
                            }
                        } catch {
                            props.setLst(undefined)
                        }
                    }}
                    value={props.lst ?? "all"}
                >
                    <SelectTrigger
                        className="w-fit border border-escher-dedfff dark:border-escher-darkblue_border px-2 py-1.5 text-escher-text4 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-escher-darkblue_2 transition-all"
                    >
                        <LstTrigger
                            lst={props.lst}
                        />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-escher-dark_0c203d dark:border-escher-darkblue_border">
                        <SelectItem
                            value={"all"}
                            className="cursor-pointer px-2 py-1.5 font-medium items-center rounded-lg"
                        >
                            <div className="pr-6 text-gray-500">=== All LST ===</div>
                        </SelectItem>
                        <LstItem
                            value="babylon"
                        />
                        <LstItem
                            value="union"
                        />
                    </SelectContent>
                </Select>
            </div>

            <div className="col-span-2">Type</div>

            {/* Status */}
            <div className="col-span-2">
                <Select
                    onValueChange={v => {
                        try {
                            if (v === "all") {
                                props.setStatus(undefined)
                            } else {
                                props.setStatus(v as Status)
                            }
                        } catch {
                            props.setStatus(undefined)
                        }
                    }}
                    value={props.status ?? "all"}
                >
                    <SelectTrigger
                        className="w-fit border border-escher-dedfff dark:border-escher-darkblue_border px-2 py-1.5 text-escher-text4 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-escher-darkblue_2 transition-all"
                    >
                        <StatusTrigger
                            status={props.status}
                        />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-escher-dark_0c203d dark:border-escher-darkblue_border">
                        <SelectItem
                            value={"all"}
                            className="cursor-pointer px-2 py-1.5 font-medium items-center rounded-lg"
                        >
                            <div className="pr-6 text-gray-500">=== All status ===</div>
                        </SelectItem>
                        <StatusItem
                            value="success"
                        />
                        <StatusItem
                            value="pending"
                        />
                    </SelectContent>
                </Select>
            </div>

            <div className="col-span-2">Time</div>
        </div>
    );
}

// Operation
const OperationTrigger = (props: { operation?: Action, themeIsDark: boolean }) => {
    let text = "All operations";
    let prefix = <></>;

    switch (props.operation) {
        case "bond":
            text = "Stake";
            prefix = <Image alt=""
                src={props.themeIsDark ?
                    "/icons/transaction/stake-dark.svg" :
                    "/icons/transaction/stake.svg"
                }
                width={24}
                height={24}
            />
            break;
        case "unbond":
            text = "Unstake";
            prefix = <Image alt=""
                src={props.themeIsDark ?
                    "/icons/transaction/unstake-dark.svg" :
                    "/icons/transaction/unstake.svg"
                }
                width={24}
                height={24}
            />
            break;
        case "bridge":
            text = "Bridge";
            prefix = <Image alt=""
                src={props.themeIsDark ?
                    "/icons/transaction/bridge.svg" :
                    "/icons/transaction/bridge.svg"
                }
                width={24}
                height={24}
            />
            break;
        case "dust":
            text = "Dust recovery";
            prefix = <Icon
                type={"MdGrain"}
                className={"w-6 h-6 text-emerald-600 dark:text-emerald-300"} />;
            break;
        case "withdraw":
            text = "Token withdraws";
            prefix = <Icon
                type={"PiHandCoins"}
                className={"w-6 h-6 text-escher-electricblue dark:text-escher-electricblue_light1"} />;
            break;
    }

    return (
        <div className="flex items-center">
            {prefix}
            <div className="ml-2 mr-4">{text}</div>
        </div>
    );
}

const OperationItem = (props: {
    value: Action
    themeIsDark: boolean
    img: string
    imgDark: string
    title: string
    icon?: IconType
    iconClassName?: string
}) => {
    return (
        <SelectItem value={props.value} className="cursor-pointer px-2 py-1.5 font-medium rounded-lg">
            <div className="flex items-center gap-2 pr-6" >
                {!props.icon ?
                    <Image alt=""
                        src={props.themeIsDark ?
                            props.imgDark :
                            props.img
                        }
                        width={24}
                        height={24}
                    />
                    :
                    <Icon type={props.icon} className={clsx(
                        "w-6 h-6",
                        props.iconClassName
                    )} />
                }
                <div>{props.title}</div>
            </div>
        </SelectItem>
    );
}

// LST
const ImgBaby = () => <Image alt=""
    src={"/images/token/e-babylon.svg"}
    width={20}
    height={20}
/>;

const ImgUnion = () => <Image alt=""
    src={"/images/token/e-union.svg"}
    width={20}
    height={20}
/>;

const LstTrigger = (props: { lst?: LiquidStaking }) => {
    let text = "All LST";
    let prefix = <>
        <ImgBaby />
        <ImgUnion />
    </>;

    switch (props.lst) {
        case "babylon":
            text = "Babylon";
            prefix = <ImgBaby />
            break;
        case "union":
            text = "Union";
            prefix = <ImgUnion />
            break;
    }

    return (
        <div className="flex items-center">
            {prefix}
            <div className="pl-2">{text}</div>
        </div>
    );
}

const LstItem = (props: {
    value: LiquidStaking
}) => {
    return (
        <SelectItem value={props.value} className="cursor-pointer px-2 py-1.5 font-medium rounded-lg">
            <div className="flex items-center gap-2 pr-6" >
                {props.value === "babylon" ? <ImgBaby /> : <ImgUnion />}
                <div>{props.value === "babylon" ? "Babylon" : "Union"}</div>
            </div>
        </SelectItem>
    );
}

const StatusTrigger = (props: { status?: Status }) => {
    let text = "All Status";

    switch (props.status) {
        case "success":
            text = "Success";
            break;
        case "pending":
            text = "Pending";
            break;
    }

    return (
        <div className="flex items-center px-2">
            <div className="">{text}</div>
        </div>
    );
}

const StatusItem = (props: {
    value: Status
}) => {
    return (
        <SelectItem value={props.value} className="cursor-pointer px-2 py-1.5 font-medium rounded-lg">
            <div className="flex items-center gap-2 pr-6" >
                <div>{props.value === "success" ? "Success" : "Pending"}</div>
            </div>
        </SelectItem>
    );
}