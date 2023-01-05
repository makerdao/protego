// Copyright (C) 2020 Maker Ecosystem Growth Holdings, INC.
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

pragma solidity ^0.8.14;

interface TestEnd {
    function cage() external;
}

interface DSPauseAbstract {
    function owner() external view returns (address);
    function authority() external view returns (address);
    function setOwner(address) external;
    function setAuthority(address) external;
    function setDelay(uint256) external;
    function plans(bytes32) external view returns (bool);
    function proxy() external view returns (address);
    function delay() external view returns (uint256);
    function plot(address, bytes32, bytes calldata, uint256) external;
    function drop(address, bytes32, bytes calldata, uint256) external;
    function exec(address, bytes32, bytes calldata, uint256) external returns (bytes memory);
}

contract SpellAction {

    TestEnd immutable end;

    constructor(address _end) {
        end = TestEnd(_end);
    }

    function execute() external {
        end.cage();
    }
}

contract DssEndTestSpell {
    DSPauseAbstract public pause;
    address         public action;
    bytes32         public tag;
    bytes           public sig;
    uint256         public eta;

    string constant public description =
        "End Cage Test Spell";

    constructor(address _pause, address _end) {
        pause = DSPauseAbstract(_pause);
        sig = abi.encodeWithSignature("execute()");
        action = address(new SpellAction(_end));
        bytes32 _tag;
        address _action = action;
        assembly { _tag := extcodehash(_action) }
        tag = _tag;
    }


    function schedule() public {
        require(eta == 0, "This spell has already been scheduled");
        eta = block.timestamp + pause.delay();
        pause.plot(action, tag, sig, eta);
    }

    function cast() public {
        pause.exec(action, tag, sig, eta);
    }
}
