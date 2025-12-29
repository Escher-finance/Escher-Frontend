import Button from "@/components/global/button";
import Icon from "@/components/global/icons";
import { DialogContent, DialogEmpty, DialogTitle } from "@/components/ui/dialog-empty";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
    isWalletConnecting: boolean
    isWhiteListError: boolean
    connectCosmos(): void
}

const Box = ({ delay, image }: { image: string, delay: number }) => {
    return (
        <motion.img
            initial={{
                y: "-100%"
            }}
            animate={{ y: 0, rotate: 360 }}
            transition={{
                y: { duration: 0.8, ease: "easeOut", delay: delay },
                rotate: { repeat: Infinity, duration: 15, ease: "linear" },
            }}
            src={image} alt="" className="h-full" />
    );
}

const Shadow = ({ delay }: { delay: number }) => {
    return (
        <motion.img
            initial={{
                width: "0%"
            }}
            animate={{ width: "65%" }}
            transition={{ duration: 1, ease: "easeOut", delay: delay }}
            src="/images/onboard/shadow.svg" alt="" className="" />
    );
}

const Illustration = () => {
    return (
        <motion.div
            initial={{
                y: "-100%"
            }}

            animate={{ y: 0, }}
            transition={{
                y: { duration: 0.8, ease: "easeOut" },
            }}
            className="h-[40%] w-full relative flex items-end justify-center bg-[url('/images/nft-bg.svg')] bg-position-[100%]"
        >
            <div className="absolute top-[5%] left-[30vw] flex flex-col gap-1 items-center h-[40%]">
                <Box delay={0.5} image="/images/onboard/nft-2.png" />
                <Shadow delay={0.5} />
            </div>
            <div className="absolute top-[8%] flex flex-col gap-1 items-center h-[55%] pt">
                <Box delay={0.25} image="/images/onboard/nft-1.png" />
                <Shadow delay={0.25} />
            </div>
            <div className="absolute top-[5%] right-[30vw] flex flex-col gap-1 items-center h-[40%]">
                <Box delay={0.5} image="/images/onboard/nft-3.png" />
                <Shadow delay={0.5} />
            </div>
        </motion.div >
    );
}

const WhitelistModelErrorContent = ({ setShowRestricted }: { setShowRestricted(val: boolean): void }) => {
    return (
        <div className="w-[478px] flex flex-col items-center p-6">
            <button
                className="rounded-full border border-gray-300 text-gray-400 p-1.5 self-end"
                onClick={() => setShowRestricted(false)}
            >
                <Icon type="FaTimes" />
            </button>
            <div className="bg-escher-F8DFDF text-escher-E03838 rounded-full p-3 mt-4">
                <Icon type="BsExclamationCircle" size="lg" />
            </div>
            <div className="text-escher-black dark:text-white text-2xl font-bold mt-6 leading-none">Access Restricted</div>
            <div className="text-escher-777e90 flex flex-col items-center text-center gap-3.5 mt-8">
                <div>At the moment, access to Escher&apos;s App is limited to ZK Goblin Mode, Wandering Whale Sharks, and Celestine Sloth Society NFT holders.</div>
                <div>Your wallet does not contain an eligible NFT. If you&apos;d like to be notified when access expands, leave your email at <Link href={"https://www.escher.finance/"} target="_blank" className="text-escher-electricblue dark:text-white underline underline-offset-2">escher.finance</Link></div>
                <div>We appreciate your interest and look forward to welcoming more users soon.</div>
            </div>
            <Button title="Close" style="fill" className="w-full mt-6" onClick={() => setShowRestricted(false)} />
        </div>
    );
}

const Whitelist = (props: Props) => {
    const [showRestricted, setShowRestricted] = useState(false);

    useEffect(() => {
        if (props.isWhiteListError) {
            setShowRestricted(true);
        }
    }, [props.isWhiteListError]);

    return (
        <div className="mx-auto h-screen overflow-hidden flex flex-col">

            <Illustration />

            {/* Content */}
            <motion.div
                initial={{
                    y: "100%"
                }}
                animate={{ y: 0 }}
                transition={{
                    y: { duration: 0.8, ease: "easeOut" },
                }}
                className="flex-1 flex justify-center items-center -mt-12"
            >
                <div className="rounded-xl border border-escher-e6e8ec bg-escher-f5f6f8 dark:bg-escher-darkblue p-6 flex flex-col items-center max-w-[847px] mx-auto">
                    <div className="text-escher-text2 dark:text-white font-bold text-[40px] leading-none">Welcome Goblins, WWS, and Sloths!</div>

                    <Button
                        title='Connect Cosmos Wallet'
                        onClick={props.connectCosmos}
                        isLoading={props.isWalletConnecting}
                        className="text-sm px-4 py-3.5 gap-2 mt-8"
                        postIcon="BsArrowRight"
                    />

                    <div className="text-escher-valencia text-xs font-semibold px-3 py-2 rounded-md bg-escher-valencia bg-opacity-10 mt-8">Exclusive Access Notice</div>

                    <div className="text-escher-text4 dark:text-white flex flex-col text-center gap-4 mt-6">
                        <div>Currently, access is limited to ZK Goblin Mode, Wandering Whale Sharks, and Celestine Sloth Society NFT holders. If you&apos;re part of any of these groups, welcome, and thank you for being among the first to experience our product.</div>
                        <div>If you&apos;d like to be notified when access expands, leave your email: <Link href={"https://www.escher.finance/"} target="_blank" className="text-escher-electricblue dark:text-white underline underline-offset-2">escher.finance</Link></div>
                        <div>Your early participation is invaluable in shaping what&apos;s next. We appreciate your support and feedback.</div>
                    </div>
                </div>
            </motion.div>

            <DialogEmpty open={showRestricted} onOpenChange={v => setShowRestricted(v)}>
                <DialogContent className="">
                    <DialogTitle className="hidden" />
                    <WhitelistModelErrorContent setShowRestricted={setShowRestricted} />
                </DialogContent>
            </DialogEmpty>
        </div>
    );
}

export default Whitelist;