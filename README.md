# Protego

Protego is a tool to permissionlessly deploy a spell which can be used to drop a particular plan in the `MCD_PAUSE`
contract, or in extreme cases the `Protego` contract can itself be lifted to the hat, allowing any user to
permissionlessly drop any scheduled plan.

## Context

- A `plan` is a scheduled `delegatecall` that exists in [`MCD_PAUSE`](https://github.com/makerdao/ds-pause) and can be
  permissionlessly executed.
- Plans in `MCD_PAUSE` are [identified by a unique 32 byte hash](https://github.com/makerdao/ds-pause/blob/master/src/pause.sol#L99).
- A conformant spell here is one where the values returned by `action()`, `tag()`, `sig()` and `eta()` are equal to the
  corresponding `plan`'s `usr`, `tag`, `fax` and `eta` values respectively. Bad actors could potentially manipulate the
  return values of these functions such that they are not equal, which would result in a non-conformant spell.

## Usage

### Create a single drop spell

If there is sufficient ecosystem interest to cancel (`drop`) a particular scheduled set of actions (the target `plan`),
Protego contains a factory to permissionlessly create a spell ("drop spell"), which &ndash; upon being given the hat
&ndash; is able to drop the targeted plan in `MCD_PAUSE`.

There are two possibilities:

#### 1. `deploy(DssSpellLike _spell)(address)`

Used for [conformant spells](https://github.com/makerdao/spells-mainnet), will create a drop spell targeting a plan in
`MCD_PAUSE`, using the values that the spell provides.

#### 2. `deploy(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta)(address)`

Used for non-conformat spells, will create a drop spell targeting a plan in `MCD_PAUSE` using values provided manually
&ndash; which can be found in the payload of the transaction that originally planned it.

### Enable permissionless dropping of any plan

In case of a governance attack, numerous spells could be created and planned by an attacker at a rate faster than a
single hat spell can `drop` them. To mitigate this risk, the `Protego` contract itself can be given the hat, which
allows any user to permissionlessly drop any plan.

Once again, there are two alternatives:

#### 1. `drop(DssSpellLike _spell)`

Used for conformat spells, will **immediately** drop a plan in `MCD_PAUSE` using the values the spell provides.

#### 2. `drop(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta)`

Used for non-conformant spells, will **immediately** drop a plan in `MCD_PAUSE` using values provided manually &ndash;
which can be found in the payload of the transaction that originally planned it.

### Additional functions

#### `id()`

- `id(DssSpellLike _spell)(bytes32)`
- `id(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta)(bytes32)`

Returns the `bytes32` id of a given plan using the same method that `hash` does in `MCD_PAUSE`.

#### `planned()`

- `planned(DssSpellLike _spell)(bool)`
- `planned(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta)(bool)`
- `planned(bytes32 _id)(bool)`

Returns `true` if a plan has been scheduled for execution.
