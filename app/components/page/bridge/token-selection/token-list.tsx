import { CustomToken } from "@/types/chain";
import { GroupedTokens } from "./content";
import TokenItem from "./token-item";
import TokenSingle from "./token-single";
import { APP_CONFIG } from "@/configs/app";

interface Props {
    tokens: GroupedTokens[]
    uniswapTokens?: CustomToken[]
    onTokenGroupSelected(props: { symbol: string, logoUri?: string }): void
    onTokenSelected(token: CustomToken): void
}

const TokenList = (props: Props) => {
    return (
        <div className="flex flex-col mt-6">
            <div className="text-escher-gray400 dark:text-escher-777e90 text-sm">All tokens</div>
            {props.tokens.map((token, key) =>
                <TokenItem
                    key={key}
                    logo={token.icon}
                    symbol={token.symbol}
                    name={token.name}
                    balance={token.balance.toString()}
                    enabled={true}
                    onSelected={() => {
                        props.onTokenGroupSelected({
                            symbol: token.symbol,
                            logoUri: token.icon
                        });
                    }}
                />
            )}
            {(APP_CONFIG.enableEvm && props.uniswapTokens && props.uniswapTokens.length > 0) &&
                <>
                    <hr className="my-2" />
                    {props.uniswapTokens?.map((token, key) =>
                        <TokenSingle
                            key={key}
                            token={token}
                            onSelected={() => {
                                props.onTokenSelected(token);
                            }}
                        />
                    )}
                </>
            }
        </div>
    );
}

export default TokenList;