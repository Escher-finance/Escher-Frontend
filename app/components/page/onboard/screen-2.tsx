import Button from "@/components/global/button";
import { useEscher } from "@/components/providers/escherProvider";
import Image from "next/image";
import Link from "next/link";

interface Props {
    setIsConnectPage(val: boolean): void
}

export default function Screen2(props: Props) {
    const { account, setOpenWalletConnection } = useEscher();

    return (
        <div className='flex flex-col items-center h-full rounded-2xl py-6'>
            <Button
                title="Go back"
                preIcon="FaChevronLeft"
                onClick={() => props.setIsConnectPage(false)}
                style="text"
                className="self-start rounded-full text-sm"
            />

            <div className="flex-1 flex flex-col items-center justify-center max-w-[363px]">
                <div className="font-bold text-[32px] text-escher-black dark:text-white" onClick={() => console.log({ account })}>Connect Account</div>
                <div className="text-escher-gray500 dark:text-white mt-2 text-center">Log in with wallet to begin your seamless (liquid) staking journey.</div>

                <div className="flex flex-col w-full gap-4 mt-10 px-6">
                    <Button
                        title='Connect wallet'
                        onClick={() => setOpenWalletConnection(true)}
                        className="grow text-sm px-4 py-3.5 whitespace-nowrap gap-2"
                        preComponent={
                            <Image alt="" src="/icons/wallet_icon.svg" width={24} height={24} />
                        }
                    />
                    {(account.cosmos?.isConnected || account.evm?.isConnected) &&
                        <Link href={"/"} className="self-center flex items-center gap-2 text-escher-text2 dark:text-white font-medium text-sm hover:border-b border-gray-400">
                            <Image alt="" src={"/icons/arrow-right-03.svg"} />
                            <div className="opacity-40">Continue to app</div>
                        </Link>
                    }
                </div>
            </div>
        </div>
    );
}