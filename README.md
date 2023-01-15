# Protego

Protego is a tool to permissionlessly deploy a spell which can be used to drop a particular plan in MakerDAO's Pause contract, or in extreme cases the protego contract can itself be lifted to the hat, allowing any user to permissionlessly drop any scheduled plan.

## Context

* A `plan` is a scheduled `delegatecall` that exists in [the pause](https://github.com/dapphub/ds-pause) and can be permissionlessly executed. 
* Plans in `DsPause` are [identified by a unique 32 byte hash](https://github.com/dapphub/ds-pause/blob/master/src/pause.sol#L67).
* A conformant spell here is one where the values returned by `action()`, `tag()`, `sig()` and `eta()` are equal to the corresponding `plan`'s `usr`, `tag`, `fax` and `eta` values respectively. Bad actors could potentially manipulate the return values of these functions such that they are not equal; which would result in a nonconformant spell.

## Usage

### Create a single drop spell

If there is sufficient ecosystem interest to cancel (`drop`) a particular scheduled set of actions (the target `plan`), Protego contains a factory which allows for permissionless deployment of a Spell ('drop spell') which - when elected as the hat - drops a targeted plan in the pause via two permissionless methods:

1) For conformant spells, `deploy(TARGET_SPELL)` will create a drop spell targeting a plan in the pause by using the values that the spell provides
2) For nonconformant spells, `deploy(TARGET_PLAN_USR, TARGET_PLAN_TAG, TARGET_PLAN_FAX, TARGET_PLAN_ETA)` will create a drop spell targeting a plan in the pause using manually provided values

In this way, dishonesty by bad actors (false Spell return values) cannot be used to circumvent Protego drop spell deployment.

### Enable permissionless dropping of all plans

In the event of a governance attack, numerous spells could be created via `plot` by an attacker at a rate faster than a single hat spell can `drop` them. To ameliorate this risk, the `Protego` contract can be elected as the hat, which would make it the `authority` on the pause. Protego contains two permissionless methods which allow for anyone to `drop` *any* `plan` permissionlessly:

1) For conformant spells, `drop(TARGET_SPELL)` will *immediately `drop`* a plan in the pause by using the values that the spell provides
2) For nonconformant spells, `drop(TARGET_PLAN_USR, TARGET_PLAN_TAG, TARGET_PLAN_FAX, TARGET_PLAN_ETA)` will create a drop spell targeting a plan in the pause using manually provided values

It should be noted that these functions will revert if Protego has not been elected as the hat (due to `auth` on the `drop` function in DsPause). It should also be noted that this behaviour allows for any plans to be dropped (including those not part of a governance attack).

## Additional Functions

### id()

* `function id(DSSpellLike _spell) public view returns (bytes32)`
* `function id(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public pure returns (bytes32)`

`id` returns the `bytes32` id of a given plan using the same method that `hash` does in the pause

### planned()

* `function planned(DSSpellLike _spell) public view returns (bool)`
* `function planned(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public view returns (bool)`
* `function planned(bytes32 _id) public view returns (bool)`

`planned` returns `true` if a plan has been plotted (scheduled for execution)


