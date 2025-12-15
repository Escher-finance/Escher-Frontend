import { shortenAddress } from "@/lib/text";
import Image from "next/image";
import Link from "next/link";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "sonner";
import Icon from "../icons";
import LdrsAnimation from "../ldrsAnimation";

export type TabTypes = "all" | "evm" | "cosmos";

interface Props {
    isCosmosConnected: boolean
    isEvmConnected: boolean
    isSidebar: boolean
    openWalletModal(): void
    setTab(val: TabTypes): void
    tab: 'all' | 'evm' | 'cosmos'
}

const TabItem = (props: { title: string, isActive: boolean, isConnected: boolean, isStatus: boolean, onClick(): void }) => {
    return (
        <button className="flex items-center py-2 gap-2 bg-white dark:bg-escher-dark_0c203d rounded justify-center border border-escher-eff1f5 dark:border-escher-darkblue_border" onClick={props.onClick}>
            <div className={`text-sm ${props.isActive ? "text-escher-electricblue dark:text-white" : "text-escher-text5"} font-medium`}>{props.title}</div>
            {props.isStatus && props.isConnected &&
                <Icon type="FaCircle" className="text-escher-1fcf68 w-1.5 h-1.5" />
            }
            {props.isStatus && !props.isConnected &&
                <Icon type="FaRegCircle" className="text-gray-400 w-1.5 h-1.5" />
            }
        </button>
    );
}

export const Tab = (props: Props) => {
    return (
        <div className="grid grid-cols-3 gap-2 bg-escher-f5f6f8 dark:bg-escher-darkblue p-1 rounded-lg leading-none">
            <TabItem
                isActive={props.tab === 'evm'}
                isConnected={props.isEvmConnected}
                isStatus={true}
                onClick={() => props.isEvmConnected ? props.setTab('evm') : props.isSidebar ? props.openWalletModal() : props.setTab('evm')}
                title="EVM"
            />
            <TabItem
                isActive={props.tab === 'cosmos'}
                isConnected={props.isCosmosConnected}
                isStatus={true}
                onClick={() => props.isCosmosConnected ? props.setTab('cosmos') : props.isSidebar ? props.openWalletModal() : props.setTab('cosmos')}
                title="Cosmos"
            />
            {props.isSidebar &&
                <TabItem
                    isActive={props.tab === 'all'}
                    isConnected={false}
                    isStatus={false}
                    onClick={() => props.setTab('all')}
                    title="All"
                />
            }
        </div>
    );
}

interface WalletListProps {
    logo?: string
    name: string
    address: string
    onLogout?(): void
}

export const WalletList = (props: WalletListProps) => {
    return (
        <div className="flex items-center gap-2 bg-escher-f5f6f8 dark:bg-escher-darkblue p-2 rounded-lg">
            {props.logo &&
                <Image src={props.logo.toString()} alt={`${props.name} logo`} width={28} height={28} className="w-7 h-7" />
            }
            <div className="flex flex-1 flex-col justify-between">
                <div className="text-escher-gray600 dark:text-white font-semibold">{props.name}</div>
                <div className="text-escher-777e90 text-xs font-medium">{shortenAddress(props.address, 8, 5)}</div>
            </div>
            <div className="flex items-center gap-1">
                <CopyToClipboard
                    text={props.address}
                    onCopy={() => {
                        toast.info('Address copied to clipboard!');
                    }}
                >
                    <button
                        className="text-escher-electricblue dark:text-white bg-white dark:bg-escher-dark_0c203d hover:bg-gray-50 p-1.5 rounded border border-escher-gray200 dark:border-escher-darkblue_border"
                    >
                        <Icon type="FiCopy" size="sm" />
                    </button>
                </CopyToClipboard>

                {props.onLogout && (
                    <button
                        className="text-escher-electricblue dark:text-white bg-white dark:bg-escher-dark_0c203d hover:bg-gray-50 p-1.5 rounded border border-escher-gray200 dark:border-escher-darkblue_border"
                        onClick={props.onLogout}
                    >
                        <Icon type="RiShutDownLine" size="sm" />
                    </button>
                )}
            </div>
        </div>
    );
}

interface WalletConnectProps {
    logo?: string
    name: string
    isConnecting: boolean
    onConnect?(): void
}

export const WalletConnect = (props: WalletConnectProps) => {
    return (
        <button
            onClick={props.onConnect}
            className="flex items-center gap-2 p-2 rounded bg-escher-f5f6f8 dark:bg-escher-darkblue hover:bg-escher-gray200 hover:dark:bg-escher-darkblue_4"
        >
            {props.logo &&
                <Image src={props.logo} alt={`${props.name} logo`} width={28} height={28} className="w-7 h-7" />
            }
            <div className="flex-1 text-escher-gray600 dark:text-white text-start font-semibold">{props.name}</div>
            {props.isConnecting &&
                <LdrsAnimation size={18} />
            }
        </button>
    );
}

interface WalletInstallProps {
    logo: string
    name: string
    url: string
}

export const WalletInstall = (props: WalletInstallProps) => {
    return (
        <Link
            href={props.url}
            target="_blank"
            className="flex items-center gap-2 p-2 rounded bg-escher-f5f6f8 dark:bg-escher-darkblue hover:bg-escher-gray200 hover:dark:bg-escher-darkblue_4"
        >
            {props.logo &&
                <Image src={props.logo} alt={`${props.name} logo`} width={28} height={28} className="w-7 h-7" />
            }
            <div className="flex-1 text-escher-gray600 dark:text-white text-start font-semibold">Get {props.name}</div>
            <Icon type="FiExternalLink" className="dark:text-white" />
        </Link>
    );
}