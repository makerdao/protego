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
    function pause() external view returns (address);
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
    /// @notice The Chainlog contract address.
    /// @dev Not used in this contract. Declared to keep compatibility with `DssExec`.
    address public constant log = 0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F;
    /// @notice By definition, office hours are not applicable to emergency spells.
    bool public constant officeHours = false;
    /// @notice Emergency spells should not expire.
    uint256 public constant expiration = type(uint256).max;

    /// @notice The Protego factory that deployed the spell.
    ProtegoLike public immutable protego;
    /// @notice The MCD_PAUSE instance.
    DsPauseLike public immutable pause;
    /// @notice The original spell action address.
    address public immutable action;
    /// @notice The original spell action tag (i.e.: `extcodehash`).
    bytes32 public immutable tag;
    /// @notice The original spell earliest execution time.
    uint256 public immutable eta;
    /// @notice The original spell encoded call.
    bytes public sig;
    /**
     * @dev An emergency spell does not need to be cast, as all actions happen during the schedule phase.
     *      Notice that cast is usually not supposed to revert, so it is implemented as a no-op.
     */
    uint256 public immutable nextCastTime = type(uint256).max;

    /// @notice Drop have been called.
    event Drop();

    /**
     * @param _protego The Protego factory that deployed the spell.
     * @param _usr The original spell action address.
     * @param _tag The original spell action tag (i.e.: `extcodehash`).
     * @param _fax The original spell encoded call.
     * @param _eta The original spell earliest execution time.
     */
    constructor(address _protego, address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) {
        protego = ProtegoLike(_protego);
        pause = DsPauseLike(ProtegoLike(_protego).pause());
        action = _usr;
        tag = _tag;
        sig = _fax;
        eta = _eta;
    }

    /**
     * @notice Alias for `drop`.
     * @dev for compatibility with `DssExec`.
     */
    function schedule() external {
        drop();
    }

    /// @notice Drops the original spell.
    function drop() public {
        pause.drop(action, tag, sig, eta);
        emit Drop();
    }

    /// @notice No-op.
    function cast() external {}

    /// @notice Returns the description of the spell in the format "Sky Protocol Drop Spell: <ID>"
    function description() external view returns (string memory) {
        return string(abi.encodePacked("Sky Protocol Drop Spell: ", protego.id(action, tag, sig, eta)));
    }

    /// @notice Returns true if the original spell has been dropped or has never been planned.
    function done() external view returns (bool) {
        return !planned();
    }

    /// @notice Returns whether the original spell is currently planned or not.
    function planned() public view returns (bool) {
        return protego.planned(action, tag, sig, eta);
    }
}
