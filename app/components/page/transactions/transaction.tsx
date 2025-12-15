import { CustomToken } from "@/types/chain";
import { IndexerTransaction } from "@/types/transaction";
import TransactionRow from "./rows/row";
import TransactionTower from "./rows/tower";

interface Props {
    transaction: IndexerTransaction
    tokens: CustomToken[]
    unbondingTime: {
        babylon: number
        union: number
    }
}

const Transaction = (props: Props) => {
    switch (props.transaction.action) {
        case "bond":
        case "unbond":
        case "bridge":
        case "dust":
        case "withdraw":
            return <TransactionRow
                transaction={props.transaction}
                tokens={props.tokens}
                unbondingTime={props.unbondingTime}
            />;
        case "towerRemove":
        case "towerAdd":
            return <TransactionTower
                transaction={props.transaction}
                tokens={props.tokens}
                unbondingTime={props.unbondingTime}
            />;
    }
    return null;
}

export default Transaction;