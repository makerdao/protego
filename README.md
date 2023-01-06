# protego

Protego is a tool to permissionlessly deploy a spell which can be used to drop a particular plan in MakerDAO's Pause contract, or in extreme cases the protego contract can itself be lifted to the hat, allowing any user to permissionlessly drop any scheduled plan.

## Usage

### Drop an individual plan

Protego contains a factory to permissionlessly create a spell that is able to drop a single plan in the [pause](https://github.com/dapphub/ds-pause).

* `function deploy(DSSpellLike _spell) external returns (address)`

Used to deploy a single spell that can be elected to a privileged position. This requires that the `_spell` address parameter conforms to a MakerDAO conformant [spell](https://github.com/makerdao/spells-mainnet)

* `function deploy(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) external returns (address)`

Used to deploy a single spell that can be elected to a privileged position. This can be used to drop a non-conformant spell by reproducing the associated components of the plan.

### Drop any plan

In the case of a governance attack, many spells could be plotted quickly by an attacker. To ameliorate this risk, the `protego` contract itself can be elected to a hat role, which permits any user to permissionlessly drop any plan.

* `function drop(DSSpellLike _spell) external`

Drop a conformant spell from the pause.

* `function drop(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public`

Drop a plan from the pause by reproducing the associated components of the plan.

## Additional Functions

### ID

* `function id(DSSpellLike _spell) public view returns (bytes32)`
* `function id(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public pure returns (bytes32)`

Return the `bytes32` id of a plan in the pause.

### Planned

* `function planned(DSSpellLike _spell) public view returns (bool)`
* `function planned(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public view returns (bool)`
* `function planned(bytes32 _id) public view returns (bool)`

Returns `true` if a plan has been plotted.


