"use client";

import WalletConnection from "@/components/global/walletConnection/walletConnection";
import { useEscher } from "@/components/providers/escherProvider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function WalletModal() {
    const { openWalletConnection, setOpenWalletConnection } = useEscher();

    return (
        <Dialog open={openWalletConnection} onOpenChange={v => setOpenWalletConnection(v)}>
            <DialogContent className="flex flex-col w-[364px] p-4 dark:bg-escher-dark_0c203d">
                <DialogTitle className="flex flex-col gap-1">
                    <div className="text-escher-gray900 dark:text-white font-semibold">Connect Wallet</div>
                    <div className="text-escher-text4 dark:text-white text-xs font-normal">Choose how you want to connect</div>
                </DialogTitle>
                <WalletConnection />
            </DialogContent>
        </Dialog>
    );
}