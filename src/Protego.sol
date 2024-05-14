// SPDX-FileCopyrightText: © 2024 Dai Foundation <www.daifoundation.org>
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
pragma solidity ^0.8.16;

interface DsPauseLike {
    function plans(bytes32) external view returns (bool);
    function drop(address, bytes32, bytes calldata, uint256) external;
}

interface DsSpellLike {
    function action() external view returns (address);
    function tag() external view returns (bytes32);
    function sig() external view returns (bytes memory);
    function eta() external view returns (uint256);
}

/// @title A spell that drops a plan from `MCD_PAUSE` when is cast.
contract DropSpell {
    /// @notice The Protego factory that deployed the spell.
    Protego public immutable protego;
    /// @notice The MCD_PAUSE instance.
    DsPauseLike public immutable pause;
    /// @notice The original spell action address.
    address public immutable action;
    /// @notice The original spell action tag (i.e.: `extcodehash`).
    bytes32 public immutable tag;
    /// @notice The original spell expiry time.
    uint256 public immutable eta;
    /// @notice The original spell encoded call.
    bytes public sig;

    /// @param _protego The Protego factory that deployed the spell.
    /// @param _pause The MCD_PAUSE instance.
    /// @param _usr The original spell action address.
    /// @param _tag The original spell action tag (i.e.: `extcodehash`).
    /// @param _fax The original spell encoded call.
    /// @param _eta The original spell expiry time.
    constructor(address _protego, address _pause, address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) {
        protego = Protego(_protego);
        pause = DsPauseLike(_pause);
        action = _usr;
        tag = _tag;
        sig = _fax;
        eta = _eta;
    }

    /// @notice Returns the description of the spell in the format "MakerDAO Drop Spell: <ID>"
    function description() external view returns (string memory) {
        return string(abi.encodePacked("MakerDAO Drop Spell: ", protego.id(action, tag, sig, eta)));
    }

    /// @notice Returns whether the original spell has been planned or not.
    function planned() external view returns (bool) {
        return protego.planned(action, tag, sig, eta);
    }

    /// @notice Drops the original spell.
    function cast() external {
        pause.drop(action, tag, sig, eta);
    }
}

/// @title Protego: permisionlessly deploy spells to drop any plan in `DsPause`-like contracts.
contract Protego {
    /// @notice A reference to the DsPause contract.
    address public immutable pause;

    /// @notice A new `DropSpell` instance was deployed.
    /// @param dropSpell The new `DropSpell` address.
    event Deploy(address dropSpell);

    /// @notice A spell plan was dropped.
    /// @param id The ID of the dropped spell
    event Drop(bytes32 id);

    /// @param _pause A reference to the DsPause contract.
    constructor(address _pause) {
        pause = _pause;
    }

    /// @notice Deploys a spell to drop a conformant `DssSpell`
    /// @param _spell The spell address.
    /// @return The `DropSpell` address.
    function deploy(DsSpellLike _spell) external returns (address) {
        return deploy(_spell.action(), _spell.tag(), _spell.sig(), _spell.eta());
    }

    /// @notice Deploys a spell to drop a plan based on attributes.
    /// @param _usr The address lifted to the hat.
    /// @param _tag The tag identifying the address.
    /// @param _fax The encoded call to be made in `_usr`.
    /// @param _eta The expiry date.
    /// @return _spell The `DropSpell` address.
    function deploy(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public returns (address _spell) {
        _spell = address(new DropSpell(address(this), pause, _usr, _tag, _fax, _eta));
        emit Deploy(_spell);
    }

    /// @notice Calculates the id for a set of attributes.
    /// @param _usr The address lifted to the hat.
    /// @param _tag The tag identifying the address.
    /// @param _fax The encoded call to be made in `_usr`.
    /// @param _eta The expiry date.
    function id(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public pure returns (bytes32) {
        return keccak256(abi.encode(_usr, _tag, _fax, _eta));
    }

    /// @notice Calculates the id of a conformant `DssSpell`.
    /// @param _spell The spell address.
    function id(DsSpellLike _spell) public view returns (bytes32) {
        return id(_spell.action(), _spell.tag(), _spell.sig(), _spell.eta());
    }

    /// @notice Returns whether a plan matching the set of attributes is currently planned.
    /// @param _usr The address lifted to the hat.
    /// @param _tag The tag identifying the address.
    /// @param _fax The encoded call to be made in `_usr`.
    /// @param _eta The expiry date.
    function planned(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) external view returns (bool) {
        return planned(id(_usr, _tag, _fax, _eta));
    }

    /// @notice Returns whether aspell is planned or not.
    /// @param _spell The spell address.
    function planned(DsSpellLike _spell) external view returns (bool) {
        return planned(id(_spell));
    }

    /// @notice Returns whether an id is planned or not.
    /// @param _id The ide of the plan.
    function planned(bytes32 _id) public view returns (bool) {
        return DsPauseLike(pause).plans(_id);
    }

    /// @notice Permissionlessly drop anything.
    /// @dev In some cases, due to a governance attack or other unforseen causes, it may be necessary to block any spell
    ///      that is entered into the pause proxy.
    ///      In this extreme case, the system can be protected during the pause delay by lifting the Protego contract to
    ///      the hat role, which will allow any user to permissionlessly drop any id from the pause.
    ///      This function is expected to revert if it does not have the authority to perform this function.
    /// @param _usr The address lifted to the hat.
    /// @param _tag The tag identifying the address.
    /// @param _fax The encoded call to be made in `_usr`.
    /// @param _eta The expiration time.
    function drop(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public {
        DsPauseLike(pause).drop(_usr, _tag, _fax, _eta);
        emit Drop(id(_usr, _tag, _fax, _eta));
    }

    /// @notice Permissionlessly drop a conformat spell.
    /// @dev In some cases, due to a governance attack or other unforseen causes, it may be necessary to block any spell
    ///      that is entered into the pause proxy.
    ///      In this extreme case, the system can be protected during the pause delay by lifting the Protego contract to
    ///      the hat role, which will allow any user to permissionlessly drop any id from the pause.
    ///      This function is expected to revert if it does not have the authority to perform this function.
    /// @param _spell The address of the spell lifted to the hat.
    function drop(DsSpellLike _spell) external {
        drop(_spell.action(), _spell.tag(), _spell.sig(), _spell.eta());
    }
}
