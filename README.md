# Protego

Protego is a tool to permissionlessly deploy a spell which can be used to drop a particular plan in the `MCD_PAUSE`
contract, or in extreme cases the `Protego` contract can itself be lifted to the hat, allowing any user to
permissionlessly drop any scheduled plan.

## Context

- A `plan` is a scheduled `delegatecall` that exists in [`MCD_PAUSE`](https://github.com/makerdao/ds-pause) and can be
  permissionlessly executed.
- Plans in `MCD_PAUSE` are [identified by a unique 32 byte hash](https://github.com/makerdao/ds-pause/blob/master/src/pause.sol#L99).
- A conforming spell here is one where the values returned by `action()`, `tag()`, `sig()` and `eta()` are equal to the
  corresponding `plan`, `usr`, `tag`, `fax` and `eta` values respectively. Bad actors could potentially manipulate the
  return values of these functions such that they are not equal, which would result in a non-conforming spell.
- Users interacting with `Protego` should **always** assume the spell they want to drop is non-conforming and fetch the
  parameters directly from the logs created by [`pause.plot()`](https://etherscan.deth.net/address/0xbe286431454714f511008713973d3b053a2d38f3#L189-L203)

## Usage

### 1. Create a single drop spell

```solidity
deploy(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta)(address)
```

If there is sufficient ecosystem interest to cancel (`drop`) a particular scheduled set of actions (the target `plan`),
Protego contains a factory to permissionlessly create a spell ("Emergency Drop Spell"), which &ndash; upon being given
the hat &ndash; is able to drop the targeted plan in `MCD_PAUSE`.

### 2. Enable permissionless dropping of a single or multiple plans 


```solidity
/// @notice Permissionlessly drop anything that has been planned on the pause.
drop(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta)
```

```solidity
/**
 * @notice A struct representing a plan.
 * @param usr The address of the scheduled spell.
 * @param tag The tag identifying the address.
 * @param fax The encoded call to be made in `usr`.
 * @param eta The expiration time.
 */
struct Plan {
    address usr;
    bytes32 tag;
    bytes fax;
    uint256 eta;
}

/// @notice Drop multiple plans in a single call.
drop(Plan[] calldata plans)
```

In case of a governance attack, numerous spells could be created and planned by an attacker at a rate faster than a
single hat spell can `drop` them. To mitigate this risk, the `Protego` contract itself can be given the hat, which
allows any user to permissionlessly drop any plan. Protego may either cancel one plan per call, or cancel multiple plans in a single call by passing a `Plan[]` to the multi drop function.

Both functions will **immediately** drop one or many plans in `MCD_PAUSE` using the parameters provided.

## Additional functions

### `id()`

```solidity
id(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta)(bytes32)
```

Returns the `bytes32` id of a given plan using the same method that `hash` does in `MCD_PAUSE`.

### `planned()`

```solidity
planned(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta)(bool)
planned(bytes32 _id)(bool)
```

Returns `true` if a plan has been scheduled for execution.
