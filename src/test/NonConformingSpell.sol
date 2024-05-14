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
    function plot(address, bytes32, bytes calldata, uint256) external;
    function drop(address, bytes32, bytes calldata, uint256) external;
    function exec(address, bytes32, bytes calldata, uint256) external returns (bytes memory);
}

contract NonConformingSpell {
    DsPauseLike public immutable pause;

    constructor(address pause_) {
        pause = DsPauseLike(pause_);
    }

    function plot(address usr, bytes32 tag, bytes memory fax, uint256 eta) public {
        pause.plot(usr, tag, fax, eta);
    }

    function drop(address usr, bytes32 tag, bytes memory fax, uint256 eta) public {
        pause.drop(usr, tag, fax, eta);
    }

    function exec(address usr, bytes32 tag, bytes memory fax, uint256 eta) public returns (bytes memory) {
        return pause.exec(usr, tag, fax, eta);
    }
}


