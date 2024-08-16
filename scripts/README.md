# Protego Scripts

## Usage

### 1. Install dependencies

```
npm i
```

### 2. Run scripts

List plans in `MCD_PAUSE` since block 16420000
```
npm run list 16420000
```

Pending plans in `MCD_PAUSE` since block 19420069
```
npm run list-pending 19420069
```

If no block number is passed, the script will fetch all plans since block 0.

## Output

```
╔═══════════════════════╤═══════════════════════════════════╤═══════════════════════╤═══════════════════════════════════╤════════════╤════════════╤════════════╗
║ SPELL                 │ HASH                              │ USR                   │ TAG                               │ FAX        │ ETA        │ STATUS     ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0xc25A71BDF956229a035 │ 0x76167df75647db1661a3a49b83e589e │ 0xb1F78B20B3aAfdF061b │ 0xd5b5512ac3872a37517151f280f9b9f │ 0x61461954 │ 1723728263 │ EXECUTED   ║
║ e35e8038d3FeE4aBa101C │ 9daaff46af3337552e15eb80ea8acf79f │ 0E85f2D3009c436764294 │ 3f37191196b05620d19af0f3c24f55b2e │            │            │            ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x8c7F12C7cE07916f631 │ 0x1e4a20372c4647e9428efabca662d47 │ 0x46DD85e91Eab604ca15 │ 0x54561a83a0e6eb1959742ac526aeaa0 │ 0x61461954 │ 1722371399 │ EXECUTED   ║
║ B25ce148e419FeFf19d46 │ 59f996f1353d2dcb05d52ed50def420f0 │ 0c26853a947617e7Ab322 │ 2e1d074fbbb8e26294b2a46a508c3ccf3 │            │            │            ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x452a39C34f9539E0d50 │ 0x11e3af57c6821e4b4b45559c92f5c9d │ 0xA13D7e21643bD46E2cC │ 0x041f68b86ef5961f3d578a7192a09f1 │ 0x61461954 │ 1721070179 │ EXECUTED   ║
║ C9e33Ad423a15C6f45df4 │ a681f2b7d2d232f91d7b64aa14d317f6a │ 09E87cFB91c5B951Bd955 │ 980b42bcefa8fecb810816369420c1e0c │            │            │            ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x0c0B4DA7e02960F98c2 │ 0xb8f4b59cbfe45ba425eb9c10c8a50bd │ 0x0871e28D09c29C41966 │ 0xc8dec11fc102e8810674c4db724fb12 │ 0x61461954 │ 1720383443 │ EXECUTED   ║
║ AFf2778F6f3E37321B5Dd │ 1eb919325eefdf095c44369098fd21e59 │ 9D82901d53d60A649B36D │ 9a790f93767cf54b691cbe3d2d33dd3d8 │            │            │            ║
╟───────────────────────┼───────────────────────────────────┼───────────────────────┼───────────────────────────────────┼────────────┼────────────┼────────────╢
║ 0x7fbC867dE58D6e47E43 │ 0x9ca00512f5e87da33fa1fa1e4834581 │ 0x261da1Cdbd788642034 │ 0x5e8fe783452994a42bbbe3b0edde5b9 │ 0x61461954 │ 1719777527 │ EXECUTED   ║
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