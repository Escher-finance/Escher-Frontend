import { useReadContracts } from "wagmi";
import { TokenBalance } from "./chain";

export type UseReadContractBalanceReturnType = ReturnType<typeof useReadContracts> & {
    balance?: TokenBalance;
};