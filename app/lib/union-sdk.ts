import { wagmiConfig } from "@/configs/wagmi"
import { getConnectorClient } from "@wagmi/core"
import { Effect } from "effect"

export const getWagmiConnectorClient = Effect.tryPromise({
    try: () => getConnectorClient(wagmiConfig),
    catch: err => console.log({ err, wagmiConfig })
})