export const unionLst = [
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "SCALING_FACTOR",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "UPGRADE_INTERFACE_VERSION",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string",
                "internalType": "string"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "batchHubRecordIds",
        "inputs": [
            {
                "name": "",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "batchWithdrawal",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "batches",
        "inputs": [
            {
                "name": "",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "outputs": [
            {
                "name": "stakeAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "mintAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "unstakeAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "releasedAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "id",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "status",
                "type": "uint8",
                "internalType": "enum BatchStatus"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "config",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct Config",
                "components": [
                    {
                        "name": "feeRate",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "hubBatchPeriod",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "unbondingBatchPeriod",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "zkgm",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "lsToken",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "baseToken",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "feeReceiver",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "baseTokenSymbol",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "baseTokenName",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "unionSolverAddress",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "unionLstContractAddress",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "unionChannelId",
                        "type": "uint32",
                        "internalType": "uint32"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "currentHubBatchId",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "currentRate",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "currentUnbondingBatchId",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getHubBatch",
        "inputs": [
            {
                "name": "id",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct HubBatch",
                "components": [
                    {
                        "name": "stakeAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "mintAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "unstakeAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "releasedAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "id",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "status",
                        "type": "uint8",
                        "internalType": "enum BatchStatus"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getHubRecord",
        "inputs": [
            {
                "name": "id",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct HubRecord",
                "components": [
                    {
                        "name": "recordType",
                        "type": "uint8",
                        "internalType": "enum RecordType"
                    },
                    {
                        "name": "batchId",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "id",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "recipientChannelId",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "stakeAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "mintAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "unstakeAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "releasedAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "exchangeRate",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "timestamp",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "sender",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "staker",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "recipient",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getVersion",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint16",
                "internalType": "uint16"
            }
        ],
        "stateMutability": "pure"
    },
    {
        "type": "function",
        "name": "hubRecords",
        "inputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "outputs": [
            {
                "name": "recordType",
                "type": "uint8",
                "internalType": "enum RecordType"
            },
            {
                "name": "batchId",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "id",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "recipientChannelId",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "stakeAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "mintAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "unstakeAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "releasedAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "exchangeRate",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "timestamp",
                "type": "uint64",
                "internalType": "uint64"
            },
            {
                "name": "sender",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "staker",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "recipient",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "initialize",
        "inputs": [
            {
                "name": "payload",
                "type": "tuple",
                "internalType": "struct InitializePayload",
                "components": [
                    {
                        "name": "feeRate",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "hubBatchPeriod",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "unbondingBatchPeriod",
                        "type": "uint64",
                        "internalType": "uint64"
                    },
                    {
                        "name": "owner",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "baseToken",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "lsToken",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "zkgm",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "unionLstContractAddress",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "unionSolverAddress",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "baseTokenSymbol",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "baseTokenName",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "quoteToken",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "feeReceiver",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "unionChannelId",
                        "type": "uint32",
                        "internalType": "uint32"
                    }
                ]
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "isTestMode",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lastHubBatchTimestamp",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lastUnbondingBatchTimestamp",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lastUnionBlockRecorded",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lastUpdateTimestamp",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "lastZkgmTimestamp",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "onIntentZkgm",
        "inputs": [
            {
                "name": "caller",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "path",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "sourceChannelId",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "destinationChannelId",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "sender",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "message",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "relayer",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "relayerMsg",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "onZkgm",
        "inputs": [
            {
                "name": "_caller",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "path",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "sourceChannelId",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "destinationChannelId",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "sender",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "message",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "_relayer",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "relayerMsg",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "pauseToggle",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "paused",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "pendingReleasedUnbondingBatchId",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "proxiableUUID",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "stake",
        "inputs": [
            {
                "name": "_amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "recipient",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "recipientChannelId",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "submitBatch",
        "inputs": [
            {
                "name": "_salt",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "submitUnbondingBatch",
        "inputs": [
            {
                "name": "_salt",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "unbondingBatch",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct UnbondingBatch",
                "components": [
                    {
                        "name": "unstakeAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "exchangeRate",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "undelegateAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "receivedAmount",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "status",
                        "type": "uint8",
                        "internalType": "enum UnbondingBatchStatus"
                    },
                    {
                        "name": "id",
                        "type": "uint32",
                        "internalType": "uint32"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "unbondingBatches",
        "inputs": [
            {
                "name": "",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "outputs": [
            {
                "name": "unstakeAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "exchangeRate",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "undelegateAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "receivedAmount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "status",
                "type": "uint8",
                "internalType": "enum UnbondingBatchStatus"
            },
            {
                "name": "id",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "unbondingHubBatchIds",
        "inputs": [
            {
                "name": "",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "unstake",
        "inputs": [
            {
                "name": "_amount",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "recipient",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "recipientChannelId",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint64",
                "internalType": "uint64"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "upgradeToAndCall",
        "inputs": [
            {
                "name": "newImplementation",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "event",
        "name": "ExchangeRateUpdated",
        "inputs": [
            {
                "name": "id",
                "type": "uint32",
                "indexed": true,
                "internalType": "uint32"
            },
            {
                "name": "actionHash",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "action",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            },
            {
                "name": "rate",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HubStake",
        "inputs": [
            {
                "name": "id",
                "type": "uint64",
                "indexed": true,
                "internalType": "uint64"
            },
            {
                "name": "batchId",
                "type": "uint32",
                "indexed": true,
                "internalType": "uint32"
            },
            {
                "name": "stakerHash",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "recipientChannelId",
                "type": "uint32",
                "indexed": false,
                "internalType": "uint32"
            },
            {
                "name": "stakeAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "mintAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "exchangeRate",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "timestamp",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            },
            {
                "name": "sender",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            },
            {
                "name": "staker",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            },
            {
                "name": "recipient",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HubUnstake",
        "inputs": [
            {
                "name": "id",
                "type": "uint64",
                "indexed": true,
                "internalType": "uint64"
            },
            {
                "name": "batchId",
                "type": "uint32",
                "indexed": true,
                "internalType": "uint32"
            },
            {
                "name": "stakerHash",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "recipientChannelId",
                "type": "uint32",
                "indexed": false,
                "internalType": "uint32"
            },
            {
                "name": "unstakeAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "exchangeRate",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "timestamp",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            },
            {
                "name": "sender",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            },
            {
                "name": "staker",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            },
            {
                "name": "recipient",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Initialized",
        "inputs": [
            {
                "name": "version",
                "type": "uint64",
                "indexed": false,
                "internalType": "uint64"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Paused",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SubmitHubBatch",
        "inputs": [
            {
                "name": "id",
                "type": "uint32",
                "indexed": true,
                "internalType": "uint32"
            },
            {
                "name": "executedHeight",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "stakeAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "mintAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "unstakeAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "releasedAmount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "status",
                "type": "uint8",
                "indexed": true,
                "internalType": "uint8"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Unpaused",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Upgraded",
        "inputs": [
            {
                "name": "implementation",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ZkgmMessageReceived",
        "inputs": [
            {
                "name": "path",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "sourceChannelId",
                "type": "uint32",
                "indexed": false,
                "internalType": "uint32"
            },
            {
                "name": "destinationChannelId",
                "type": "uint32",
                "indexed": false,
                "internalType": "uint32"
            },
            {
                "name": "sender",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            },
            {
                "name": "payload",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "AddressEmptyCode",
        "inputs": [
            {
                "name": "target",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ERC1967InvalidImplementation",
        "inputs": [
            {
                "name": "implementation",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ERC1967NonPayable",
        "inputs": []
    },
    {
        "type": "error",
        "name": "EnforcedPause",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ErrUnauthorized",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ExpectedPause",
        "inputs": []
    },
    {
        "type": "error",
        "name": "FailedCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "InvalidInitialization",
        "inputs": []
    },
    {
        "type": "error",
        "name": "NotInitializing",
        "inputs": []
    },
    {
        "type": "error",
        "name": "OwnableInvalidOwner",
        "inputs": [
            {
                "name": "owner",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "OwnableUnauthorizedAccount",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "StringsInsufficientHexLength",
        "inputs": [
            {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "length",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "UUPSUnauthorizedCallContext",
        "inputs": []
    },
    {
        "type": "error",
        "name": "UUPSUnsupportedProxiableUUID",
        "inputs": [
            {
                "name": "slot",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ]
    }
] as const