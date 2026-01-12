/* 
    weight : commision
    L5 12% 5%,
    Crypto crew 2% 5%,
    Block hunters 12% 5%,
    01 node 14% 5%,
    Range 10% 5%,
    Cosmos spaces 25% 5%,
    Defi Dojo 25% 10%
*/

// Fee
interface ValidatorFee {
    address: string
    fee: number
}

const fee_babylon: ValidatorFee[] = [
    {
        address: "bbnvaloper140l6y2gp3gxvay6qtn70re7z2s0gn57zx9gg4e",
        fee: 0.3
    },
    {
        address: "bbnvaloper1eunu7l7qfmemdw4xv7apejl28jzgd3t346dh63",
        fee: 0.3
    },
    {
        address: "bbnvaloper1symf474wnypes2d3mecllqk6l26rwz8mx605rm",
        fee: 0.3
    },
    {
        address: "bbnvaloper1fyfnvvswqjmg2xlpx2grldmlnuzqj6zj2hc8hd",
        fee: 0.3
    },
    {
        address: "bbnvaloper1004nqmppj9tvwf0l5gawl747lg452vl35m5x0x",
        fee: 0.7
    },
    {
        address: "bbnvaloper1g2dslw8hn62tj3yyjcw3t7gx7lxghna7auh4qw",
        fee: 0.7
    },
    {
        address: "bbnvaloper163zszfeemrqfyg3jlasztzmy0eea8l8qjlvlz2",
        fee: 0.7
    },
    {
        address: "bbnvaloper1l5c6cf6rps3vq65hmk73hqv2epj6wrn2vlkawa",
        fee: 0.7
    },
    {
        address: "bbnvaloper176nnuls55nkgtpc67tp3p70vjnnwx3c4q3w225",
        fee: 0.7
    }
]

const fee_union: ValidatorFee[] = [
    {
        address: "unionvaloper140l6y2gp3gxvay6qtn70re7z2s0gn57zhqqe9e",
        fee: 0
    },
    {
        address: "unionvaloper1maxq9hma5h89ham2uvtfmv9uqujfratjsqqqds",
        fee: 0
    },
    {
        address: "unionvaloper1symf474wnypes2d3mecllqk6l26rwz8mhl89nm",
        fee: 0
    },
    {
        address: "unionvaloper1dqsjs63kpahlkfj3x5f9kuryk78uekqdv9z72k",
        fee: 0
    },
    {
        address: "unionvaloper15zf3fp5f96ncs8dcmg5t5amxgleyels4jyq0ud",
        fee: 0
    },
    {
        address: "unionvaloper16appturqyamylwha87st4j0nrwmtn450lcqre7",
        fee: 0.7
    },
    {
        address: "unionvaloper1zef80pxh6yynt5krj20c8rezcv7hsf9cq2ts4e",
        fee: 0.7
    },
]

export const VALIDATORS_FEE: ValidatorFee[] = [
    ...fee_babylon,
    ...fee_union
]

// Weight
interface ValidatorWeight {
    address: string
    weight: number
}

const weight_union: ValidatorWeight[] = [
    {
        address: "unionvaloper140l6y2gp3gxvay6qtn70re7z2s0gn57zhqqe9e",
        weight: 0.12
    },
    {
        address: "unionvaloper1maxq9hma5h89ham2uvtfmv9uqujfratjsqqqds",
        weight: 0.02
    },
    {
        address: "unionvaloper1symf474wnypes2d3mecllqk6l26rwz8mhl89nm",
        weight: 0.12
    },
    {
        address: "unionvaloper1dqsjs63kpahlkfj3x5f9kuryk78uekqdv9z72k",
        weight: 0.14
    },
    {
        address: "unionvaloper15zf3fp5f96ncs8dcmg5t5amxgleyels4jyq0ud",
        weight: 0.1
    },
    {
        address: "unionvaloper16appturqyamylwha87st4j0nrwmtn450lcqre7",
        weight: 0.25
    },
    {
        address: "unionvaloper1zef80pxh6yynt5krj20c8rezcv7hsf9cq2ts4e",
        weight: 0.25
    },
]

export const VALIDATORS_WEIGHT: ValidatorWeight[] = [
    ...weight_union
]