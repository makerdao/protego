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

interface ProtegoLike {
    function id(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) external view returns (bytes32);
    function planned(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) external view returns (bool);
}

interface DsPauseLike {
    function plans(bytes32) external view returns (bool);
    function drop(address, bytes32, bytes calldata, uint256) external;
}

interface EmergencySpellLike {
    function action() external view returns (address);
    function cast() external;
    function description() external view returns (string memory);
    function done() external view returns (bool);
    function eta() external view returns (uint256);
    function expiration() external view returns (uint256);
    function log() external view returns (address);
    function nextCastTime() external view returns (uint256);
    function officeHours() external view returns (bool);
    function pause() external view returns (DsPauseLike);
    function schedule() external;
    function sig() external view returns (bytes memory);
    function tag() external view returns (bytes32);
}

/// @title A spell that drops a plan from `MCD_PAUSE` when is cast.
contract EmergencyDropSpell is EmergencySpellLike {
    bool public constant officeHours = false;
    uint256 public constant expiration = type(uint256).max;
    address public constant log = address(0);

    /// @notice The Protego factory that deployed the spell.
    ProtegoLike public immutable protego;
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
        protego = ProtegoLike(_protego);
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
    function planned() public view returns (bool) {
        return protego.planned(action, tag, sig, eta);
    }

    /// @notice Drops the original spell.
    function schedule() external {
        pause.drop(action, tag, sig, eta);
    }

    /// @notice Returns whether the original spell has been dropped or not.
    function done() external view returns (bool) {
        return !planned();
    }

    /// @notice No-op
    function cast() external {}

    function nextCastTime() external view returns (uint256) {
        return block.timestamp;
    }
}


