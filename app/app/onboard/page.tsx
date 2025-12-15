"use client";

import Type3 from "@/components/page/onboard/type-3";
import { useEscher } from "@/components/providers/escherProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const { account, setOpenWalletConnection } = useEscher();
    const router = useRouter();

    useEffect(() => {
        if (account.cosmos?.isConnected && account.evm?.isConnected) {
            setOpenWalletConnection(false);
            router.push("/?dialog=open");
        }
    }, [account.cosmos?.isConnected, account.evm?.isConnected, router, setOpenWalletConnection]);

    return <Type3 />;

}
