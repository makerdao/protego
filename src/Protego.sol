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

import {EmergencyDropSpell} from "./EmergencyDropSpell.sol";

interface DsPauseLike {
    function plans(bytes32) external view returns (bool);
    function drop(address, bytes32, bytes calldata, uint256) external;
}

/// @title Protego: permissionlessly drop any plan in `DsPause`-like contracts.
contract Protego {
    /// @notice A reference to the `DsPause` contract.
    address public immutable pause;

    /**
     * @notice A new `EmergencyDropSpell` instance was deployed.
     * @param dropSpell The new `EmergencyDropSpell` address.
     */
    event Deploy(address dropSpell);

    /**
     * @notice A spell plan was dropped.
     * @param id The ID of the dropped plan.
     */
    event Drop(bytes32 id);

    /// @param _pause A reference to the `DsPause` contract.
    constructor(address _pause) {
        pause = _pause;
    }

    /**
     * @notice Deploys a spell to drop a plan based on attributes.
     * @param _usr The address of the scheduled spell.
     * @param _tag The tag identifying the address.
     * @param _fax The encoded call to be made in `_usr`.
     * @param _eta The earliest execution time.
     * @return _spell The `EmergencyDropSpell` address.
     */
    function deploy(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public returns (address _spell) {
        _spell = address(new EmergencyDropSpell(address(this), _usr, _tag, _fax, _eta));
        emit Deploy(_spell);
    }

    /**
     * @notice Calculates the id for a set of attributes.
     * @param _usr The address of the scheduled spell.
     * @param _tag The tag identifying the address.
     * @param _fax The encoded call to be made in `_usr`.
     * @param _eta The earliest execution time.
     */
    function id(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public pure returns (bytes32) {
        return keccak256(abi.encode(_usr, _tag, _fax, _eta));
    }

    /**
     * @notice Returns whether a plan matching the set of attributes is currently planned.
     * @param _usr The address of the scheduled spell.
     * @param _tag The tag identifying the address.
     * @param _fax The encoded call to be made in `_usr`.
     * @param _eta The earliest execution time.
     */
    function planned(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) external view returns (bool) {
        return planned(id(_usr, _tag, _fax, _eta));
    }

    /**
     * @notice Returns whether an id is planned or not.
     * @param _id The id of the plan.
     */
    function planned(bytes32 _id) public view returns (bool) {
        return DsPauseLike(pause).plans(_id);
    }

    /**
     * @notice Permissionlessly drop anything that has been planned on the pause.
     * @dev In some cases, due to a faulty spell being voted, a governance attack or other unforeseen causes, it may be
     *      necessary to block any spell that is entered into the pause proxy.
     *      In this extreme case, the system can be protected during the pause delay by lifting the Protego contract to
     *      the hat role, which will allow any user to permissionlessly drop any id from the pause.
     *      This function is expected to revert if it does not have the authority to perform this function.
     * @param _usr The address of the scheduled spell.
     * @param _tag The tag identifying the address.
     * @param _fax The encoded call to be made in `_usr`.
     * @param _eta The expiration time.
     */
    function drop(address _usr, bytes32 _tag, bytes memory _fax, uint256 _eta) public {
        DsPauseLike(pause).drop(_usr, _tag, _fax, _eta);
        emit Drop(id(_usr, _tag, _fax, _eta));
    }

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

    /**
     * @notice Drop multiple plans in a single call.
     * @dev If an empty array is passed, no spells are dropped and nothing happens as
     *      `DsPauseLike::drop` is not called.
     * @param plans An array of plans to drop.
     */
    function drop(Plan[] calldata plans) external {
        for (uint256 i; i < plans.length;) {
            drop(plans[i].usr, plans[i].tag, plans[i].fax, plans[i].eta);

            unchecked {
                i++;
            }
        }
    }
}
