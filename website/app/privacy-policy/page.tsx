import Link from "next/link";

const Page = () => {
    return (
        <div className="container max-w-[800px] mx-auto flex flex-col bg-white z-10 py-16 md:py-28 px-8 md:px-0 text-sm md:text-base">
            <div className="font-funnel-display text-4xl md:text-5xl font-medium text-primary">Privacy Policy</div>

            <div className="my-8 font-medium">Effective Date: April 5, 2025</div>

            <div className="flex flex-col gap-4 leading-relaxed text-text">
                <div className="flex gap-4">
                    <div className="font-bold">1.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Introduction Escher Finance Ltd. ("Escher", "we", "us", or "our") is committed to protecting the privacy and personal data of individuals ("you", "your", or "Data Subject") who interact with our website at https://www.escher.finance and any related services, interfaces, applications, or decentralized software (collectively, the "Services"). This Privacy Policy ("Policy") outlines the manner in which we collect, use, disclose, retain, and protect your personal data, and is designed to comply with applicable data protection legislation, including:
                        </div>
                        <ul className="list-disc list-inside">
                            <li>The European Union General Data Protection Regulation (EU GDPR)</li>
                            <li>The United Kingdom General Data Protection Regulation (UK GDPR)</li>
                            <li>The California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA)</li>
                            <li>Other applicable international data protection frameworks</li>
                        </ul>
                    </div>
                </div>

                <div>By accessing or using the Services, you acknowledge that you have read, understood, and agree to the terms of this Policy.</div>
                <div className="flex gap-4">
                    <div className="font-bold">2.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Definitions:
                        </div>
                        <ul className="list-disc list-inside">
                            <li>"Personal Data" means any information relating to an identified or identifiable natural person.</li>
                            <li>"Processing" means any operation performed on Personal Data, whether or not by automated means.</li>
                            <li>"Controller" means the natural or legal person who determines the purposes and means of the Processing of Personal Data.</li>
                            <li>"Processor" means a natural or legal person who processes Personal Data on behalf of the Controller.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">3.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Data Controller Escher Finance Ltd., incorporated under the laws of the British Virgin Islands, is the data controller with respect to the Personal Data collected and processed through the Services. For inquiries or to exercise your data rights, you may contact us at info@escher.finance.
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">4.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Categories of Personal Data Collected We collect and process the following categories of Personal Data:
                        </div>

                        <div className="flex gap-4">
                            <div className="font-bold">4.1</div>
                            <div className="flex flex-col gap-2">
                                <div>Identifiers</div>
                                <ul className="list-disc list-inside">
                                    <li>Email address</li>
                                    <li>Public blockchain wallet address</li>
                                    <li>IP address</li>
                                    <li>Device identifiers (e.g., MAC address, device ID)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="font-bold">4.2</div>
                            <div className="flex flex-col gap-2">
                                <div>Technical and Usage Data</div>
                                <ul className="list-disc list-inside">
                                    <li>Browser type, language, and version</li>
                                    <li>Operating system and platform</li>
                                    <li>Pages visited, clickstream data, session timestamps</li>
                                    <li>Referring and exit URLs</li>
                                    <li>Screen resolution and device type</li>
                                    <li>Geolocation data inferred from IP address</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="font-bold">4.3</div>
                            <div className="flex flex-col gap-2">
                                <div>Communications and Metadata</div>
                                <ul className="list-disc list-inside">
                                    <li>Contents of support tickets, emails, and messages</li>
                                    <li>Metadata from communications</li>
                                    <li>Files or documents voluntarily submitted</li>
                                </ul>
                            </div>
                        </div>

                        <div>Note: We do not intentionally collect sensitive Personal Data such as information revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, or health data. Do not submit such data unless explicitly necessary and with your express consent.</div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">5.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Methods of Data Collection We may collect Personal Data:
                        </div>
                        <ul className="list-disc list-inside">
                            <li>Directly from you when you fill out forms, send communications, or connect a wallet</li>
                            <li>Automatically through your interaction with the Services via cookies and similar technologies</li>
                            <li>Through third-party integrations or analytics services</li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">6.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Legal Basis for Processing We rely on one or more of the following lawful bases under the GDPR and UK GDPR to process your Personal Data:
                        </div>
                        <ul className="list-disc list-inside">
                            <li><b>Consent:</b> For marketing, analytics, and use of non-essential cookies.</li>
                            <li><b>Contractual Necessity:</b> To deliver the Services and execute user-initiated transactions.</li>
                            <li><b>Legitimate Interests:</b> To maintain and improve the security, functionality, and performance of our Services.</li>
                            <li><b>Legal Obligation:</b> To comply with applicable laws, regulations, or judicial orders.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">7.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Purposes of Processing We process your Personal Data for the following purposes:
                        </div>
                        <ul className="list-disc list-inside">
                            <li>To provide access to the Services and enable blockchain interactions</li>
                            <li>To communicate with you and respond to inquiries</li>
                            <li>To deliver marketing and promotional content (subject to your consent)</li>
                            <li>To detect, prevent, and investigate fraud or abuse</li>
                            <li>To comply with regulatory, legal, tax, or audit requirements</li>
                            <li>To analyze user behavior and improve functionality and design</li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">8.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Cookies and Tracking Technologies We use cookies and similar tracking technologies, including web beacons and pixels, to:
                        </div>
                        <ul className="list-disc list-inside">
                            <li>Recognize and remember user preferences</li>
                            <li>Enable core site functionality</li>
                            <li>Conduct performance and analytics</li>
                            <li>Deliver personalized content and advertising</li>
                        </ul>
                    </div>
                </div>
                <div>You may control or disable cookies through your browser settings. More information is available at <Link href={"http://www.allaboutcookies.org"} className="font-medium text-primary">http://www.allaboutcookies.org</Link></div>

                <div className="flex gap-4">
                    <div className="font-bold">9.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Data Sharing and Disclosures We do not sell your Personal Data. We share your data only when necessary and with adequate safeguards:
                        </div>
                        <ul className="list-disc list-inside">
                            <li><b>Service Providers:</b> Vendors providing hosting, analytics, customer support, and technical infrastructure, bound by data processing agreements (DPAs)</li>
                            <li><b>Corporate Affiliates:</b> For internal operations and cross-border collaboration</li>
                            <li><b>Legal Authorities:</b> Where required by law or in response to lawful government requests</li>
                            <li><b>Business Transfers:</b> In the context of mergers, acquisitions, or restructuring</li>
                            <li><b>With Your Consent:</b> Where you have explicitly requested or authorized sharing</li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">10.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Public Blockchain and On-Chain Data Due to the nature of public blockchains, any transactions initiated via the Services—including wallet addresses, transaction metadata, and token balances—are recorded publicly, immutably, and are outside the control of Escher Finance. These records:
                        </div>
                        <ul className="list-disc list-inside">
                            <li>May be visible to any network participant</li>
                            <li>Cannot be modified or deleted</li>
                            <li>May be linkable to your identity when combined with off-chain data</li>
                        </ul>
                    </div>
                </div>

                <div>Users should exercise caution and avoid associating Personal Data with wallet activity.</div>

                <div className="flex gap-4">
                    <div className="font-bold">11.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            International Data Transfers Where Personal Data is transferred outside the European Economic Area (EEA), United Kingdom, or other jurisdictions with data protection adequacy, we rely on the following mechanisms:
                        </div>
                        <ul className="list-disc list-inside">
                            <li>Adequacy decisions by the European Commission</li>
                            <li>Standard Contractual Clauses (SCCs)</li>
                            <li>Binding Corporate Rules (BCRs)</li>
                            <li>Other lawful transfer mechanisms under the GDPR/UK GDPR</li>
                        </ul>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">12.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Data Retention We retain Personal Data only as long as necessary to:
                        </div>
                        <ul className="list-disc list-inside">
                            <li>Fulfill the purpose for which it was collected</li>
                            <li>Comply with legal, accounting, or audit requirements</li>
                            <li>Enforce or defend legal rights</li>
                        </ul>
                    </div>
                </div>

                <div>When no longer needed, data is securely deleted or anonymized. Retention periods vary depending on the data type and jurisdictional requirements.</div>

                <div className="flex gap-4">
                    <div className="font-bold">13.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Data Subject Rights Subject to applicable law, you have the following rights:
                        </div>
                        <ul className="list-disc list-inside">
                            <li><b>Right to Access:</b> Obtain a copy of your Personal Data</li>
                            <li><b>Right to Rectification:</b> Request correction of inaccurate or incomplete data</li>
                            <li><b>Right to Erasure:</b> Request deletion under specific conditions ("right to be forgotten")</li>
                            <li><b>Right to Restrict Processing:</b> Limit the use of your data under certain conditions</li>
                            <li><b>Right to Data Portability:</b> Receive your Personal Data in a machine-readable format</li>
                            <li><b>Right to Object:</b> Object to data processing based on legitimate interests</li>
                            <li><b>Right to Withdraw Consent:</b> At any time, where processing is based on consent</li>
                            <li><b>Right to Lodge a Complaint:</b> With a supervisory authority in your jurisdiction</li>
                        </ul>
                    </div>
                </div>

                <div>You may exercise these rights by contacting us at info@escher.finance. We may request proof of identity before fulfilling your request.</div>

                <div className="flex gap-4">
                    <div className="font-bold">14.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Data Security We implement appropriate technical and organizational measures to protect your Personal Data, including:
                        </div>
                        <ul className="list-disc list-inside">
                            <li>Encryption of data in transit and at rest</li>
                            <li>Access control, authentication, and role-based permissions</li>
                            <li>Periodic security audits and risk assessments</li>
                        </ul>
                    </div>
                </div>

                <div>Despite our efforts, no system can guarantee absolute security. Users are responsible for safeguarding their private keys and access credentials.</div>

                <div className="flex gap-4">
                    <div className="font-bold">15.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Children's Privacy Our Services are intended for users aged 18 and older. We do not knowingly collect data from individuals under this age. If we become aware that a minor has submitted Personal Data, we will delete it promptly.
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">16.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Automated Decision-Making We do not engage in automated decision-making or profiling that produces legal or similarly significant effects on you.
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">17.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Changes to this Policy We may revise this Privacy Policy periodically. When updates occur, we will:
                        </div>
                        <ul className="list-disc list-inside">
                            <li>Post the revised version on our website</li>
                            <li>Update the "Effective Date" at the top of this document</li>
                            <li>Notify users where legally required</li>
                        </ul>
                    </div>
                </div>

                <div>Your continued use of the Services after the posting of changes constitutes your acceptance of the revised Policy.</div>

                <div className="flex gap-4">
                    <div className="font-bold">18.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Governing Law This Privacy Policy shall be governed and interpreted in accordance with the laws of the British Virgin Islands, without regard to conflicts of law principles.
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="font-bold">19.</div>
                    <div className="flex flex-col gap-2">
                        <div>
                            Contact Information For questions, requests, or complaints regarding this Privacy Policy, please contact: Email: info@escher.finance Website: <Link href={"https://www.escher.finance"} className="font-medium text-primary">https://www.escher.finance</Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Page;