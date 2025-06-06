# Protego Scripts

## Usage

### CLI Commands

The Protego CLI supports the following commands:

**1. List Spells (Default Command)**

This is the default command when no specific command is provided. It lists spells based on the provided filters.

**Usage:**

```
npx @dewiz-xyz/protego@latest [-V -h] | --rpc-url <rpc-url> [--from-block 19420069] [--status PENDING] [--pause-address <addr>] [--format TABLE]
```

**All options:**

```
Usage: Protego CLI [options]

  ____                   _
 |  _ \   _ __    ___   | |_    ___    __ _    ___
 | |_) | | '__|  / _ \  | __|  / _ \  / _` |  / _ \
 |  __/  | |    | (_) | | |_  |  __/ | (_| | | (_) |
 |_|     |_|     \___/   \__|  \___|  \__, |  \___/
                                      |___/

Options:
  -V, --version                    output the version number
  -r, --rpc-url <rpc-url>          Ethereum Node RPC URL (default: "https://mainnet.gateway.tenderly.co", env: ETH_RPC_URL)
  -b, --from-block <block-number>  Display spells from a given block (default: 0)
  -s, --status <status>            Filter by status (choices: "PENDING", "DROPPED", "EXECUTED", "ALL", default: "ALL")
  --pause-address <address>        MCD_PAUSE contract address (default: "0xbE286431454714F511008713973d3B053A2d38f3")
  -f, --format <format>            Output format (choices: "TABLE", "JSON", default: "TABLE")
  -h, --help                       display help for command

Commands:
  encode                           Encode calldata to cancel Spells (Etherscan/Tenderly input)
```

**Output:**

```
╔═══════════════════════╤═══════════════════════════════════╤═══════════════════════╤═══════════════════════════════════╤════════════╤════════════╤════════════╗
║ GUY                   │ HASH                              │ USR                   │ TAG                               │ FAX        │ ETA        │ STATUS     ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0xc25A71BDF956229a035 │ 0x76167df75647db1661a3a49b83e589e │ 0xb1F78B20B3aAfdF061b │ 0xd5b5512ac3872a37517151f280f9b9f │ 0x61461954 │ 1723728263 │ EXECUTED   ║
║ e35e8038d3FeE4aBa101C │ 9daaff46af3337552e15eb80ea8acf79f │ 0E85f2D3009c436764294 │ 3f37191196b05620d19af0f3c24f55b2e │            │            │            ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x8c7F12C7cE07916f631 │ 0x1e4a20372c4647e9428efabca662d47 │ 0x46DD85e91Eab604ca15 │ 0x54561a83a0e6eb1959742ac526aeaa0 │ 0x61461954 │ 1722371399 │ EXECUTED   ║
║ B25ce148e419FeFf19d46 │ 59f996f1353d2dcb05d52ed50def420f0 │ 0c26853a947617e7Ab322 │ 2e1d074fbbb8e26294b2a46a508c3ccf3 │            │            │            ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x0c0B4DA7e02960F98c2 │ 0xb8f4b59cbfe45ba425eb9c10c8a50bd │ 0x0871e28D09c29C41966 │ 0xc8dec11fc102e8810674c4db724fb12 │ 0x61461954 │ 1720383443 │ EXECUTED   ║
║ 0eB257B50481F6E878f65 │ c8684ebd9091c7883355ea0ca959a78f2 │ 288B6574d749198FDf75b │ 901ff6bd7561b680b42af92293206bb32 │            │            │            ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x622Ad624491a01a2a6b │ 0xd37c72ea00f67c76b6cda8dc0dda0b1 │ 0x6481e7443D321fFF02A │ 0xf218b00aeb30403e97dbedd8542caf1 │ 0x61461954 │ 1718481719 │ EXECUTED   ║
║ eAD916C3Ca3B90BcA0854 │ b6f825145079e9acd23bdbcfe00259a3e │ 9A7ae883DCd13FAb64Ef7 │ a879c0e15796a20b5836cfadfe9a69b43 │            │            │            ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x7B55617f7F04F7B45eE │ 0x2eb42ca4e054352eaa8ef09705925b3 │ 0x612938f231DFcd7F921 │ 0x25f5bbaef576d0cf62af933ec55a6bd │ 0x61461954 │ 1717623383 │ EXECUTED   ║
║ 865fF9066469Fbe28a632 │ c12b4c0d1a59a050a20baa2b9d44396a8 │ 81F11C9E0B575E7ed2Ec1 │ 468b65fa9902387040283da6bf88ea4a9 │            │            │            ║
╚═══════════════════════╧═══════════════════════════════════╧═══════════════════════╧═══════════════════════════════════╧════════════╧════════════╧════════════╝
```

The script outputs a table with the plans' details:

- SPELL: Address of the spell (keep in mind this only works for compliant Spells, this field lists the plan scheduler address, which is the Spell on compliant spells, if non-compliant this field should be ignored)
- HASH: Hash of the plan
- USR: Address of the `DssSpellAction` related to the Spell
- TAG: `extcodehash` from the address of `DssSpellAction`
- FAX: `callcode` to be used when calling the Spell
- ETA: Timestamp of earliest execution time
- STATUS: Status of the plan:
  - PENDING: The plan has been plotted (scheduled) on Pause, and is pending execution
  - EXECUTED: The plan has already been executed
  - DROPPED: The plan was scheduled and subsequently dropped

**2. `encode`**

The `encode` command helps users generate the necessary calldata to cancel pending spells using the `drop(Plan[] calldata _plans)` function, typically on platforms like Etherscan or Tenderly.

It fetches all `PENDING` spells based on the global options provided (like `--rpc-url`, `--from-block`, `--pause-address`) and then interactively prompts the user to select which spells they want to encode for cancellation.

**Usage:**

```bash
npx @dewiz-xyz/protego@latest encode [global options]
# or when running locally
node cli encode [global options]
```

Global options are the same as for the default command (e.g., `--rpc-url`, `--from-block`).

**Example:**

To encode pending spells using default RPC and from the default block:

```bash
node cli encode
```

To encode pending spells using a specific RPC and from block `19500000`:

```bash
node cli encode --rpc-url <your-rpc-url> --from-block 19500000
```

```
? Select spells to be encoded for `drop(Plan[] calldata _plans)` ›
Instructions:
    ↑/↓: Highlight option
    ←/→/[space]: Toggle selection
    a: Toggle all
    enter/return: Complete answer
◯   hash: 0x91d2606652507a70f4a082d4fbdf1529fef75e0c3094334c38d35fb153e09466 | usr: 0x8c2e2C00718f29eeb49000C5413309944D4D9a7e | eta: 1745636796
◯   hash: 0xe42f41e842a7e5fa695ced6b3a4cc7698327f77490de37f423799b8fd572d56b | usr: 0x4F178314D81b39497F7c16745503233313Ad45e4 | eta: 1749170028
◉   hash: 0x23ca8dd38bb387e03f0962f48616f54e2149e40633f2a0d1cc99193dfe5ee701 | usr: 0x5Bf5A2fCC196CEA49593203b7e988103F3ed46AE | eta: 1749170028
◉   hash: 0x039e6de87a7f5ecf6b108ea6978db6e2c5e8a1de272d4f920f87f0e338f71bbc | usr: 0x3fdcc68a3c434B629D0E9308D02CdB5FB19c2867 | eta: 1749170028
◯   hash: 0x70ac05e4db11d143de5cc254c67a2c41a524adb43112a945dc9349ebaf004820 | usr: 0xE4407ef9Ef4BDA23f2b63B4ED8DEAeF3a78aA9A7 | eta: 1749170028
◯   hash: 0xbde8fb64c9fbaf4e72129dbc9313fd5133400ce5db38373adad5dbda1b846109 | usr: 0xC78354EE7DDd9C8Bdd8A88c84D925e2e8977443D | eta: 1749170028
◯   hash: 0xe890ce50c45d1c811eb5c09ab037fba35027d0a7ed0db24338f24f77cc966cb9 | usr: 0xa93e949A74E57806fEbD6dE2657E9fba0f4818C5 | eta: 1749170028
◯   hash: 0xe1ee25b3818453fe9f283b7f11bf9ea6c21c062329c4fb86b7472e228fdece22 | usr: 0x1AF95B825DCb36cf0fBB4Ff3cD05cf752B6BFD55 | eta: 1749170292
◯   hash: 0x87721f1b7f036bce3eea2569dad5e3ff2932413ff2ae26a8dcece0fec55ba4ed | usr: 0x49cAA015f300949336fb3519e59C6a9b8401E1fB | eta: 1749170292
◯ ↓ hash: 0xe163693acf1542472a882e888d91159f799383904ea4f3de4b58115f3740d5f2 | usr: 0x0c5fb8D0addBd19258BDbD9221D3F87D294Be590 | eta: 1749170292
```

**Output:**

After selecting the spells, the command will output a JSON array. Each element in the array is another array representing a plan, formatted as `[usr, tag, fax, eta]`.

Example output:

```json
[
  [
    "0x5Bf5A2fCC196CEA49593203b7e988103F3ed46AE",
    "0xb00835271ba99b9695e8413dbc40cf5784d5bd971d38f0a085e60407eb61accb",
    "0xc0406226",
    "1749170028"
  ],
  [
    "0xE4407ef9Ef4BDA23f2b63B4ED8DEAeF3a78aA9A7",
    "0xb00835271ba99b9695e8413dbc40cf5784d5bd971d38f0a085e60407eb61accb",
    "0xc0406226",
    "1749170028"
  ]
]
```

This output can be directly used as the `_plans` parameter for the `drop` function.

### As a dependency

```bash
npm i @dewiz-xyz/protego
```

```javascript
import { fetchPausePlans } from "@dewiz-xyz/protego";

const plans = await fetchPausePlans({
  rpcUrl: "https://eth.llamarpc.com",
  fromBlock: 16420000,
  status: "PENDING",
  // Optional: this is the MCD_PAUSE address
  pauseAddress: "0xbE286431454714F511008713973d3B053A2d38f3",
});
```

Response type:

```typescript
type Result = {
  hash: string;
  guy: string;
  usr: string;
  tag: string;
  fax: string;
  eta: number;
  status: "PENDING" | "EXECUTED" | "DROPPED" | "ALL";
};

type Status = "ALL" | "PENDING" | "DROPPED" | "EXECUTED";

type Cfg = {
    status: Status = "ALL",
    fromBlock: number = 0,
    rpcUrl: string = "mainnet",
    pauseAddress: string = "{MCD_PAUSE}",
}

function fetchPausePlans(cfg: Cfg = {}): Promise<Result[]>{}
```

## Collaborating

### 1. Install dependencies

```bash
npm i
```

### 2. Run scripts

List plans in `MCD_PAUSE` since block 16420000

```bash
npm run cli -- --from-block 16420000

OR

node cli --from-block 16420000
```

Filter by status with `--status` flag.
Possible values are: `PENDING`, `EXECUTED`, `DROPPED` and `ALL` (default).

Get pending plans since block 19420069

```bash
npm run cli -- --status PENDING --from-block 19420069
OR
node cli --status PENDING --from-block 19420069
```

Get executed plans since block 19420069

```bash
npm run cli -- --status EXECUTED --from-block 19420069
OR
node cli --status EXECUTED --from-block 19420069
```

Get dropped plans since block 19420069

```bash
npm run cli -- --status DROPPED --from-block 19420069
OR
node cli --status DROPPED --from-block 19420069
```

### 3. Help

```bash
node cli --help
```
