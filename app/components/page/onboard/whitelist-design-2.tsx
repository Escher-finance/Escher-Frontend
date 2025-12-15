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
            <div className="text-escher-777e90 flex flex-col items-center text-center gap-[14px] mt-8">
                <div>At the moment, access to Escher's App is limited to ZK Goblin Mode, Wandering Whale Sharks, and Celestine Sloth Society NFT holders.</div>
                <div>Your wallet does not contain an eligible NFT. If you'd like to be notified when access expands, leave your email at <Link href={"https://www.escher.finance/"} target="_blank" className="text-escher-electricblue dark:text-white underline underline-offset-2">escher.finance</Link></div>
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
        <div className="h-screen overflow-hidden flex flex-col">

            <div
                className="flex-1"
            >
                <div className="max-w-[847px] h-full mx-auto relative flex items-center justify-center">
                    <motion.img
                        className="absolute left-[19%] bottom-[-170px] right-0 w-[62%] -z-10"
                        src="/images/onboard/nft-rotate.jpg"
                        initial={{
                            y: "-125%"
                        }}
                        animate={{
                            y: 0,
                            rotate: 360
                        }}
                        transition={{
                            y: { duration: 0.8, ease: "easeOut" },
                            rotate: { repeat: Infinity, duration: 20, ease: "linear" },
                        }}
                    />
                    <div
                        className="absolute left-0 bottom-0 right-0 h-[135px] bg-gradient-to-t from-white to-transparent"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white">
                <motion.div
                    initial={{
                        y: "100%"
                    }}
                    animate={{ y: 0 }}
                    transition={{
                        y: { duration: 0.8, ease: "easeOut" },
                    }}
                    className=""
                >
                    <div className="flex flex-col items-center max-w-[847px] mx-auto">
                        <div className="text-escher-text2 dark:text-white font-bold text-4xl leading-none">Welcome Goblins, WWS, and Sloths!</div>

                        <Button
                            title='Connect Cosmos Wallet'
                            onClick={props.connectCosmos}
                            isLoading={props.isWalletConnecting}
                            className="text-sm px-4 py-3 gap-2 mt-6"
                            postIcon="BsArrowRight"
                        />

                        <div className="text-escher-valencia text-xs font-semibold px-3 py-2 rounded-md bg-escher-valencia bg-opacity-10 mt-8">Exclusive Access Notice</div>

                        <div className="text-escher-text4 dark:text-white flex flex-col text-center gap-4 mt-6">
                            <div>Currently, access is limited to ZK Goblin Mode, Wandering Whale Sharks, and Celestine Sloth Society NFT holders. If you're part of any of these groups, welcome, and thank you for being among the first to experience our product.</div>
                            <div>If you'd like to be notified when access expands, leave your email: <Link href={"https://www.escher.finance/"} target="_blank" className="text-escher-electricblue dark:text-white underline underline-offset-2">escher.finance</Link></div>
                            <div>Your early participation is invaluable in shaping what's next. We appreciate your support and feedback.</div>
                        </div>
                    </div>
                </motion.div>
            </div>
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