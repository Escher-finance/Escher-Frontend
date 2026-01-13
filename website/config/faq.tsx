import Link from "next/link";
import { ReactNode } from "react";

export interface FaqData {
    type: 'general' | 'ebaby' | 'eu' | 'security' | 'epoints'
    title: ReactNode
    content: ReactNode
}

const FAQ_GENERAL: FaqData[] = [
    // GENERAL
    {
        type: 'general',
        title: <div>What is <b>Escher Finance</b>?</div>,
        content: <div>Escher Finance is an innovative platform that is revolutionizing the staking landscape by eliminating liquidity constraints and enhancing user experience across blockchain ecosystems. We introduce <b>native chain-abstracted Liquid Staking Tokens</b>, enabling seamless liquidity expansion and cross-chain interoperability.</div>
    },
    {
        type: 'general',
        title: <div>How does <b>Escher Finance</b> solve chain abstracted liquid staking?</div>,
        content: <div>Escher Finance solves liquid staking by abstracting the staking process across multiple specialized Layer 1 chains. Escher seamlessly connects users from their originating chain or roll-up to the target staking chain. Users receive liquid staking tokens (LSTs) directly on their preferred chain, where liquidity and DeFi ecosystems are most robust. Meanwhile, the target staking chain benefits by gaining the security it requires through increased staked assets.</div>
    },
    {
        type: 'general',
        title: <div>How does Escher ensure security and decentralization in staking?</div>,
        content: <div>Escher Finance is a fully decentralized protocol designed to avoid asset duplication across pools. It leverages Union technology built upon the IBC protocol, employing a burn-and-mint approach for secure asset management. Additionally, Escher's liquid staking protocol undergoes rigorous security audits to maintain the highest standards of safety and trust.</div>
    },
    {
        type: 'general',
        title: <div>What are <b>Liquid Staking Tokens (LSTs)</b>?</div>,
        content: <div>Liquid Staking Tokens (LSTs) represent staked assets in a liquid form, allowing users to earn staking rewards while maintaining the ability to trade, lend, or use their assets in DeFi applications.</div>
    },
    {
        type: 'general',
        title: <div>What are <b>“chain-abstracted” LSTs</b>?</div>,
        content: <div className="flex flex-col gap-2">
            <div>
                Unlike traditional LSTs, Escher introduces <b>chain-abstracted LSTs</b>, meaning our LSTs function as "native" assets across all interconnected chains via UNION's seamless infrastructure.
            </div>
            <div>This is a game-changer because:</div>
            <div className="w-full pl-8">
                <ul className="list-disc list-outside">
                    <li>You don't need to swap, wrap, or bridge your LSTs—no complex 20-step processes.</li>
                    <li>Your LSTs are instantly usable across any DeFi protocol integrated with Escher, no matter which chain it's based on.</li>
                    <li>You get frictionless access to staking rewards and DeFi opportunities without worrying about chain barriers. Pretty cool, right?</li>
                </ul>
            </div>
        </div>
    },
    {
        type: 'general',
        title: <div>What can I do with my LSTs in the DeFi ecosystem?</div>,
        content: <div>Once you receive liquid staking tokens (LSTs) from Escher, you can immediately deploy them across the DeFi ecosystem. Escher LSTs are compatible with various DeFi protocols within their native ecosystems as well as major platforms such as Uniswap, Aave, Pendle, and others. This interoperability significantly expands your opportunities, providing access to a larger and more diverse DeFi landscape than typical staking solutions.</div>
    },
    {
        type: 'general',
        title: <div>Which blockchain networks does Escher support?</div>,
        content: <div className="flex flex-col gap-2">
            <div>We are initially launching on Babylon. Next, we'll expand to Union, unlocking seamless access to DeFi ecosystems across EVM and Cosmos chains, Solana, Berachain, Avalanche, and more.</div>
            <div>As we grow, Escher will continue integrating with additional blockchains, ensuring our LSTs remain natively usable across multiple ecosystems—without the need for wrapping, swapping, or bridging.</div>
        </div>
    },
    {
        type: 'general',
        title: <div>Does Escher charge fees for staking or unstaking?</div>,
        content: <div className="flex flex-col gap-2">
            <div>No, Escher does not charge any fees for staking or unstaking. The only fee applies to the rewards earned by your LSTs—we take a 10% commission on staking rewards, ensuring a sustainable and efficient protocol.</div>
            <div>This means you can stake and unstake freely, while only a portion of your earned yield is used to support the network.</div>
        </div>
    },
    {
        type: 'general',
        title: <div>Are there any charges for interoperability?</div>,
        content: <div>No. As simple as that.</div>
    },
    // {
    //     type: 'general',
    //     title: <div>How do I stake my assets using Escher Finance?</div>,
    //     content: <div className="flex flex-col gap-2">
    //         <div>We've made staking as <b>intuitive and seamless as possible</b>—just <b>open the app and follow the guided process</b>. The interface will walk you through</div>
    //         <div>Want a walkthrough? Check out this <Link href={"https://www.youtube.com/"} target="_blank" className="text-primary underline underline-offset-1 font-medium">video tutorial</Link></div>
    //     </div>
    // },
    {
        type: 'general',
        title: <div>Can I unstake at any time?</div>,
        content: <div>Yes, you can unstake at any time. However, unstaking is subject to a <b>cooldown period</b>, depending on the asset.</div>
    },
    {
        type: 'general',
        title: <div>Do I still earn rewards while my unstaking request is pending?</div>,
        content: <div>No, staking rewards <b>stop accruing</b> once you submit an unstaking request. The tokens are immediately unstaked, but for <b>security reasons</b>, they remain locked during the <b>cooldown period</b> before they become available for withdrawal.</div>
    },
    {
        type: 'general',
        title: <div>How does Escher's smart contract infrastructure ensure a seamless staking experience?</div>,
        content: <div className="flex flex-col gap-2">
            <div>Great question! The <b>short answer</b>: Escher's <b>cutting-edge technology stack (which includes a 'hidden layer')</b> ensures a frictionless staking experience.</div>
            <div className="w-full pl-8">
                <ul className="list-disc list-outside">
                    <li><b>Advanced interoperability</b> solutions</li>
                    <li><b>Zero-knowledge (ZK) proofs</b> for trustless security</li>
                    <li><b>Decentralized Execution</b></li>
                </ul>
            </div>
            <div>This allows us to deliver a <b>fast, secure, and cross-chain-compatible</b> staking experience.</div>
            <div>For a deep dive, check out our <Link href={"https://docs.escher.finance/"} target="_blank" className="text-primary underline underline-offset-1 font-medium">docs</Link></div>
        </div>
    }
];

const FAQ_EBABY: FaqData[] = [
    {
        type: 'ebaby',
        title: <div>What is <b>eBABY</b>?</div>,
        content: <div><b>eBABY</b> is the LST representing <b>BABY staked through Babylon's PoS network</b>. By staking via Escher Finance, users receive <b>eBABY</b>, which can be used in DeFi while continuing to earn Babylon's staking rewards.</div>
    },
    {
        type: 'ebaby',
        title: <div>What is <b>Babylon?</b></div>,
        content: <div>An L1 blockchain pioneering Bitcoin staking protocol that unlocks BTC's security for Proof-of-Stake chains, enabling trustless restaking, DeFi, and cross-chain interoperability—without compromising decentralization. <Link href={"https://babylonlabs.io/"} target="_blank" className="text-primary underline underline-offset-1 font-medium">Read more</Link></div>
    },
    {
        type: 'ebaby',
        title: <div>How can I mint and use <b>eBABY?</b></div>,
        content: <div className="flex flex-col gap-2">
            <div>Minting <b>eBABY</b> is simple</div>
            <div className="w-full pl-8">
                <ul className="list-decimal list-outside">
                    <li><b>Stake BABY</b> via <b>Escher Finance</b>, and you'll receive <b>eBABY</b> tokens in return.</li>
                    <li><b>Use eBABY</b> in <b>Tower DEX</b> to provide liquidity and earn additional rewards.</li>
                    <li><b>More integrations coming soon!</b> We're expanding support for eBABY across multiple DeFi protocols to maximize its utility.</li>
                </ul>
            </div>
            <div><b>Coming soon:</b> You'll also be able to <b>mint eBABY using other assets</b> like <b>USDC, USDT, ETH, and more—directly in our app</b> for a seamless experience.</div>
        </div>
    },
    {
        type: 'ebaby',
        title: <div>Can I use eBABY across different DeFi protocols?</div>,
        content: <div className="flex flex-col gap-2">
            <div><b>Very soon!</b> We're actively integrating <b>eBABY</b> into multiple DeFi protocols, starting with <b>Tower DEX on Babylon</b> and expanding across the <b>EVM and Cosmos ecosystem, Berachain, Solana, and more.</b></div>
            <div>Keep your eyes open—<b>chaos is coming to an end.</b></div>
        </div>
    },

    //eU
    // {
    //     type: 'eu',
    //     title: <div>What is <b>eU</b>?</div>,
    //     content: <div><b>eU</b> is the LST for <b>Union's zero-knowledge (ZK) infrastructure</b>, allowing users to stake assets in Union's network while retaining liquidity in the form of eU tokens.</div>
    // },
    // {
    //     type: 'eu',
    //     title: <div>What is <b>Union?</b></div>,
    //     content: <div>A next-gen zero-knowledge L1 Blockchain enabling seamless cross-chain transfers, DeFi, and NFTs—secured by cryptographic consensus. No trusted third parties. Just pure decentralization. <Link href={"https://union.build/"} target="_blank" className="text-primary underline underline-offset-1 font-medium">Read more</Link></div>
    // },
    // {
    //     type: 'eu',
    //     title: <div>How can I mint and use <b>eU?</b></div>,
    //     content: <div className="flex flex-col gap-2">
    //         <div>Minting <b>eU</b> is simple</div>
    //         <div className="w-full pl-8">
    //             <ul className="list-decimal list-outside">
    //                 <li><b>Stake using U, USDC, USDT, ETH, etc...</b> via <b>Escher Finance</b>, and you'll receive <b>eU</b> tokens in return.</li>
    //                 <li><b>Use eU</b> in <b>our DeFi integrated ecosystem</b></li>
    //                 <li><b>More integrations coming soon!</b> We're expanding support for eU across multiple DeFi protocols to maximize its utility.</li>
    //             </ul>
    //         </div>
    //     </div>
    // },
    // {
    //     type: 'eu',
    //     title: <div>Can I use eU across different DeFi protocols?</div>,
    //     content: <div className="flex flex-col gap-2">
    //         <div><b>Very soon!</b> We're actively integrating <b>eU</b> into multiple DeFi protocols across the <b>EVM and Cosmos ecosystem, Berachain, Solana, and more.</b>
    //         </div>
    //         <div>Keep your eyes open—<b>chaos is coming to an end.</b></div>
    //     </div>
    // },
];

const FAQ_SECURITY: FaqData[] = [
    {
        type: 'security',
        title: <div>How does Escher protect my staked assets?</div>,
        content: <div>Escher protects your staked assets by relying on the inherent security of the underlying blockchain where assets are staked. Additionally, Escher's liquid staking smart contracts undergo thorough audits by reputable audit firms to ensure robust security measures.</div>
    },
    {
        type: 'security',
        title: <div>What are the risks of using liquid staking instead of traditional staking?</div>,
        content: <div>While Escher implements comprehensive security protocols and regular audits, risks associated with smart contracts can still exist. Users should understand that despite extensive security efforts, smart contract vulnerabilities can never be completely eliminated.</div>
    },
    {
        type: 'security',
        title: <div>Can my staked assets be slashed?</div>,
        content: <div>Yes, your staked assets can be slashed, similar to native staking. Escher collaborates only with validators that maintain insurance pools against slashing risks. However, the insurance coverage may sometimes be insufficient to fully offset potential slashing events. Although Escher makes every effort to mitigate slashing risk, users should be aware that slashing remains a possibility, albeit a rare one.</div>
    },
];

const FAQ_EPOINTS: FaqData[] = [
    {
        type: 'epoints',
        title: <div>What are ePoints?</div>,
        content: <div>ePoints are Escher's way of recognizing and rewarding your contributions to the ecosystem. Every action you take—staking, swapping, providing liquidity—is measured, multiplied, and rewarded. ePoints turn the chaos of fragmented efforts into structured value.</div>
    },
    {
        type: 'epoints',
        title: <div>How do I earn ePoints?</div>,
        content: <div className="flex flex-col gap-2">
            <div>
                You earn ePoints by participating in key actions across Escher's ecosystem, such as:
            </div>
            <div className="w-full pl-8">
                <ul className="list-disc list-outside">
                    <li>Holding eBABY</li>
                    <li>Swapping eBABY on Tower DEX</li>
                    <li>Providing liquidity in eBABY pools on Tower DEX</li>
                    <li>Bridging assets with Escher's abstraction layer (powered by Union)</li>
                    <li>More ways coming soon!</li>
                </ul>
            </div>
            <div>
                Each action has a specific multiplier that amplifies your ePoint earnings depending on the value and impact of your contribution.
            </div>
        </div>
    },
    {
        type: 'epoints',
        title: <div>How are ePoints calculated</div>,
        content: <div className="flex flex-col gap-2">
            <div className="w-full pl-8">
                <ul className="list-disc list-outside">
                    <li><b>ePoints</b> are earned per <b>$100 of value per hour</b> across most activities.</li>
                    <li><b>Swapping eBABY</b> is the exception—ePoints are earned <b>per event</b>, specifically for every <b>1,000 eBABYs swapped on Tower DEX</b>, not measured hourly.</li>
                    <li>Your total reward is determined by the multiplier assigned to each action.</li>
                </ul>
            </div>
            <div>Example:</div>
            <div className="w-full pl-8">
                <ul className="list-disc list-outside">
                    <li>Holding $100 of eBABY at a 1x multiplier = <b>1 ePoint per hour</b>.</li>
                    <li>Providing $100 of liquidity with a 2.5x multiplier = <b>2.5 ePoints per hour</b>.</li>
                    <li>Swapping $100 eBABYs = <b>1 ePoints per event</b>.</li>
                </ul>
            </div>
        </div>
    },
    {
        type: 'epoints',
        title: <div>What are the multipliers for different activities</div>,
        content: <div className="flex flex-col gap-2">
            <table className="table-auto border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">Action</th>
                        <th className="border border-gray-300 p-2">Partner</th>
                        <th className="border border-gray-300 p-2">Multiplier</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-gray-300 p-2">Swap $100 eBABYs</td>
                        <td className="border border-gray-300 p-2">
                            <div className="flex justify-center">
                                <img src="/images/apps/app-tower-circle.png" width={20} height={20} alt="Tower" />
                            </div>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">1x</td>
                    </tr>
                    <tr>
                        <td className="border border-gray-300 p-2">Hold $100 worth of eBABY</td>
                        <td className="border border-gray-300 p-2 text-center">-</td>
                        <td className="border border-gray-300 p-2 text-center">1x</td>
                    </tr>

                    <tr>
                        <td className="border border-gray-300 p-2">Provide $100 liquidity on Tower DEX</td>
                        <td className="border border-gray-300 p-2">
                            <div className="flex justify-center">
                                <img src="/images/apps/app-tower-circle.png" width={20} height={20} alt="Tower" />
                            </div>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">2.5x</td>
                    </tr>

                    <tr>
                        <td className="border border-gray-300 p-2">Bridge $100 using Union (Coming Soon)</td>
                        <td className="border border-gray-300 p-2">
                            <div className="flex justify-center">
                                <img src="/images/apps/app-union.png" width={20} height={20} alt="Tower" />
                            </div>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">3x</td>
                    </tr>
                </tbody>
            </table>
            <div>Multipliers are cumulative when actions are combined across different paths… <b>With more partners joining soon!</b></div>
        </div>
    },
    {
        type: 'epoints',
        title: <div>When did the ePoints program start?</div>,
        content: <div>The program began with the launch of eBABY. All actions taken from Day 1 are being tracked, and early adopters are eligible for retroactive ePoints.</div>
    },
    {
        type: 'epoints',
        title: <div>How often are my ePoints updated?</div>,
        content: <div>ePoints are tracked in real time and officially calculated and updated every hour based on the live USD value of your positions.</div>
    },
    {
        type: 'epoints',
        title: <div>Where can I track my ePoints?</div>,
        content: <div>You can monitor your progress, optimize your strategy, and see detailed metrics through the <b>ePoints Dashboard</b> on Escher's platform.</div>
    },
    {
        type: 'epoints',
        title: <div>Do I need to sign up separately to start earning ePoints?</div>,
        content: <div>No sign-ups required. Simply stake, swap, or LP using Escher—and the system will automatically recognize and log your contributions.</div>
    },
    {
        type: 'epoints',
        title: <div>Can I earn rewards in other partner programs too?</div>,
        content: <div className="flex flex-col gap-2">
            <div>
                Absolutely. Your actions don't just earn ePoints—they ripple across other protocols:
            </div>
            <div className="w-full pl-8">
                <ul className="list-disc list-outside">
                    <li><b>Union BTCfi Points Program</b>: Earn bonus points by minting, holding, and LP-ing eBABY. More info <a href="https://x.com/union_build/status/1912867939251814833" target="_blank" className="text-primary">here</a></li>
                    <li><b>Tower Points Program</b>: Get extra Tower points for swaps and liquidity provisioning. More info <a href="https://x.com/Tower/status/1915364910331990207" target="_blank" className="text-primary">here</a></li>
                </ul>
            </div>
            <div>
                One action. Many echoes.
            </div>
        </div>
    },
    {
        type: 'epoints',
        title: <div>What can I do with my ePoints?</div>,
        content: <div>Stay tuned. ePoints will soon unlock access to exclusive rewards, roles, special drops, and more. Every point is a building block toward the Escher ecosystem.</div>
    },
    {
        type: 'epoints',
        title: <div>Who can I contact if I have more questions?</div>,
        content: <div>Reach out to us at <a href="mailto:epoints@escher.finance" className="text-primary">epoints@escher.finance</a>. Whether you're a user, builder, or potential partner, we'd love to weave Order with you.</div>
    },
];

export const FAQ_LIST: FaqData[] = [
    ...FAQ_GENERAL,
    ...FAQ_EBABY,
    ...FAQ_SECURITY,
    ...FAQ_EPOINTS
];