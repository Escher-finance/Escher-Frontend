import { CustomToken } from "@/types/chain";
import ChainItem from "./chain-item";

interface Props {
    tokens: CustomToken[]
    onTokenSelected(token: CustomToken): void
}

const ChainList = (props: Props) => {
    return (
        <div className="flex flex-col mt-6">
            <div className="text-escher-gray400 dark:text-escher-777e90 text-sm">All Networks</div>
            {props.tokens.map((token, key) =>
                <ChainItem
                    key={key}
                    token={token}
                    enabled={true}
                    onTokenSelected={props.onTokenSelected}
                />
            )}
        </div>
    );
}

export default ChainList;