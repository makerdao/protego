# Protego Scripts

## Usage

### CLI Commands

The Protego CLI supports the following commands:

**1. `list` command**

This command lists spells based on the provided filters. It utilizes global options (like `--rpc-url`, `--from-block`, `--pause-address`) for context and has its own specific options (`--status`, `--format`) to control its behavior.

**Usage Examples:**

To list all `PENDING` spells from block `19420069` using default RPC and table format:

```bash
npx @dewiz-xyz/protego@latest list --status PENDING --from-block 19420069
```

To list `ALL` spells from the default block, using a custom RPC URL, and outputting in `JSON` format:

```bash
npx @dewiz-xyz/protego@latest list --rpc-url <your-custom-rpc-url> --format JSON
```

**Global Options:**

```
Usage: Protego CLI [options] [command]

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
  --pause-address <address>        MCD_PAUSE contract address (default: "0xbE286431454714F511008713973d3B053A2d38f3")
  -h, --help                       display help for command

Commands:
  list [options]                   List pending spells by status
  encode                           Encode calldata to cancel Spells (Etherscan/Tenderly input)
  help [command]                   display help for command
```

**Command Options:**

```
(Use `node --trace-warnings ...` to show where the warning was created)
Usage: Protego CLI list [options]

List pending spells by status

Options:
  -s, --status <status>  Filter by status (choices: "PENDING", "DROPPED", "EXECUTED", "ALL", default: "ALL")
  -f, --format <format>  Output format (choices: "TABLE", "JSON", default: "TABLE")
  -h, --help             display help for command
```

Output can be a table for a quick glance at Spells or JSON: Better for copy and pasting into block explorers or transaction builders.

**Output - Table (default):**

```
╔═══════════════════════╤═══════════════════════════════════╤═══════════════════════╤═══════════════════════════════════╤════════════╤════════════╤════════════╗
║ GUY                   │ HASH                              │ USR                   │ TAG                               │ FAX        │ ETA        │ STATUS     ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x11378105b356039fC1C │ 0xe1ee25b3818453fe9f283b7f11bf9ea │ 0x1AF95B825DCb36cf0fB │ 0xb00835271ba99b9695e8413dbc40cf5 │ 0xc0406226 │ 2025-06-06 │ PENDING    ║
║ 264019EF182EbE581e390 │ 6c21c062329c4fb86b7472e228fdece22 │ B4Ff3cD05cf752B6BFD55 │ 784d5bd971d38f0a085e60407eb61accb │            │ 00:38 UTC  │            ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x11378105b356039fC1C │ 0x87721f1b7f036bce3eea2569dad5e3f │ 0x49cAA015f300949336f │ 0xb00835271ba99b9695e8413dbc40cf5 │ 0xc0406226 │ 2025-06-06 │ PENDING    ║
║ 264019EF182EbE581e390 │ f2932413ff2ae26a8dcece0fec55ba4ed │ b3519e59C6a9b8401E1fB │ 784d5bd971d38f0a085e60407eb61accb │            │ 00:38 UTC  │            ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x11378105b356039fC1C │ 0x90ca92f96501046e518674ce0a37db5 │ 0xA2D8880a9Fc34E40108 │ 0xb00835271ba99b9695e8413dbc40cf5 │ 0xc0406226 │ 2025-06-06 │ PENDING    ║
║ 264019EF182EbE581e390 │ 3e2bd7e3d726df37bea4c7c8c04688ccb │ d5144Bc3e79a1Deb32b05 │ 784d5bd971d38f0a085e60407eb61accb │            │ 00:38 UTC  │            ║
╚═══════════════════════╧═══════════════════════════════════╧═══════════════════════╧═══════════════════════════════════╧════════════╧════════════╧════════════╝
```

**Output - JSON:**

```
[
  {
    "hash": "0xe1ee25b3818453fe9f283b7f11bf9ea6c21c062329c4fb86b7472e228fdece22",
    "guy": "0x11378105b356039fC1C264019EF182EbE581e390",
    "usr": "0x1AF95B825DCb36cf0fBB4Ff3cD05cf752B6BFD55",
    "tag": "0xb00835271ba99b9695e8413dbc40cf5784d5bd971d38f0a085e60407eb61accb",
    "fax": "0xc0406226",
    "eta": "1749170292",
    "status": "PENDING"
  },
  {
    "hash": "0x87721f1b7f036bce3eea2569dad5e3ff2932413ff2ae26a8dcece0fec55ba4ed",
    "guy": "0x11378105b356039fC1C264019EF182EbE581e390",
    "usr": "0x49cAA015f300949336fb3519e59C6a9b8401E1fB",
    "tag": "0xb00835271ba99b9695e8413dbc40cf5784d5bd971d38f0a085e60407eb61accb",
    "fax": "0xc0406226",
    "eta": "1749170292",
    "status": "PENDING"
  },
  {
    "hash": "0x90ca92f96501046e518674ce0a37db53e2bd7e3d726df37bea4c7c8c04688ccb",
    "guy": "0x11378105b356039fC1C264019EF182EbE581e390",
    "usr": "0xA2D8880a9Fc34E40108d5144Bc3e79a1Deb32b05",
    "tag": "0xb00835271ba99b9695e8413dbc40cf5784d5bd971d38f0a085e60407eb61accb",
    "fax": "0xc0406226",
    "eta": "1749170292",
    "status": "PENDING"
  }
]
```

The script outputs a table with the plans' details:

- GUY: Address of the spell (keep in mind this only works for compliant Spells, this field lists the plan scheduler address, which is the Spell on compliant spells, if non-compliant this field should be ignored)
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
◯   hash: 0xe1ee...ce22 | guy: 0x1AF9...FD55 | usr: 0x1AF9...FD55 | eta: 1749170292 (2025-06-06 00:38 UTC)
◉   hash: 0x8772...a4ed | guy: 0x49cA...E1fB | usr: 0x49cA...E1fB | eta: 1749170292 (2025-06-06 00:38 UTC)
◉   hash: 0xe163...d5f2 | guy: 0x0c5f...e590 | usr: 0x0c5f...e590 | eta: 1749170292 (2025-06-06 00:38 UTC)
◯   hash: 0x27e4...1e92 | guy: 0x36B7...e359 | usr: 0x36B7...e359 | eta: 1749170292 (2025-06-06 00:38 UTC)
◯   hash: 0x5220...981b | guy: 0x003E...23b6 | usr: 0x003E...23b6 | eta: 1749170292 (2025-06-06 00:38 UTC)
◯   hash: 0xa67e...35e2 | guy: 0xbbaC...087b | usr: 0xbbaC...087b | eta: 1749170292 (2025-06-06 00:38 UTC)
◯   hash: 0x16b4...c16f | guy: 0x59d1...5986 | usr: 0x59d1...5986 | eta: 1749170292 (2025-06-06 00:38 UTC)
◯   hash: 0x90ca...8ccb | guy: 0xA2D8...2b05 | usr: 0xA2D8...2b05 | eta: 1749170292 (2025-06-06 00:38 UTC)
```

**Output:**

After selecting the spells, the command will output a JSON array. Each element in the array is another array representing a plan, formatted as `[usr, tag, fax, eta]`.

Example output:

```
[["0x49cAA015f300949336fb3519e59C6a9b8401E1fB","0xb00835271ba99b9695e8413dbc40cf5784d5bd971d38f0a085e60407eb61accb","0xc0406226","1749170292"],["0x0c5fb8D0addBd19258BDbD9221D3F87D294Be590","0xb00835271ba99b9695e8413dbc40cf5784d5bd971d38f0a085e60407eb61accb","0xc0406226","1749170292"]]
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
npm run cli -- list --from-block 16420000

OR

node cli list --from-block 16420000
```

Filter by status with `--status` flag.
Possible values are: `PENDING`, `EXECUTED`, `DROPPED` and `ALL` (default).

Get pending plans since block 19420069

```bash
node cli list --status PENDING --from-block 19420069
```

Get executed plans since block 19420069

```bash
node cli list --status EXECUTED --from-block 19420069
```

Get dropped plans since block 19420069

```bash
node cli list --status DROPPED --from-block 19420069
```

Encode

```bash
node cli encode --from-block 19420069
```

### 3. Help

```bash
node cli --help
```
