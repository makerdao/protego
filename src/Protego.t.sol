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

import {DssTest} from "dss-test/DssTest.sol";
import {Protego, EmergencyDropSpell} from "../src/Protego.sol";
import {ConformingSpell} from "./test/ConformingSpell.sol";
import {NonConformingSpell} from "./test/NonConformingSpell.sol";

interface ChainlogLike {
    function getAddress(bytes32) external view returns (address);
}

interface DsPauseLike {
    function plot(address, bytes32, bytes calldata, uint256) external;
    function drop(address, bytes32, bytes calldata, uint256) external;
    function exec(address, bytes32, bytes calldata, uint256) external returns (bytes memory);
}

interface DsChiefLike {
    function GOV() external view returns (address);
    function hat() external view returns (address);
    function lock(uint256) external;
    function vote(address[] calldata) external returns (bytes32);
    function lift(address) external;
}

interface GemLike {
    function balanceOf(address) external view returns (uint256);
    function transfer(address, uint256) external returns (bool);
    function allowance(address, address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
    function approve(address) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
}

struct BadSpells {
    address badSpell;
    address action;
    bytes32 tag;
    bytes sig;
    uint256 eta;
}

contract ProtegoTest is DssTest {
    DsChiefLike chief;
    GemLike gov;
    Protego protego;
    address pause;
    address end;

    function setUp() public {
        vm.createSelectFork("mainnet");

        ChainlogLike chainlog = ChainlogLike(0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F);
        chief = DsChiefLike(chainlog.getAddress("MCD_ADM"));
        gov = GemLike(chief.GOV());
        pause = chainlog.getAddress("MCD_PAUSE");
        protego = new Protego(pause);
        end = chainlog.getAddress("MCD_END");
    }

    function testPause() public view {
        assertEq(protego.pause(), pause);
    }

    function testDeployDropSpell() public {
        ConformingSpell badSpell = new ConformingSpell(pause, end);

        assertFalse(
            protego.planned(badSpell.action(), badSpell.tag(), badSpell.sig(), badSpell.eta()),
            "Spell already planned for params"
        );

        vm.expectEmit(true, true, true, true);
        emit Deploy(vm.computeCreateAddress(address(protego), vm.getNonce(address(protego))));
        protego.deploy(badSpell.action(), badSpell.tag(), badSpell.sig(), badSpell.eta());
    }

    function testPlanned() public {
        ConformingSpell badSpell = new ConformingSpell(pause, end);

        assertFalse(
            protego.planned(badSpell.action(), badSpell.tag(), badSpell.sig(), badSpell.eta()),
            "Spell already planned for params"
        );

        _vote(address(badSpell));
        badSpell.schedule();

        assertTrue(
            protego.planned(badSpell.action(), badSpell.tag(), badSpell.sig(), badSpell.eta()),
            "Planned failed for params"
        );
        assertTrue(
            protego.planned(protego.id(badSpell.action(), badSpell.tag(), badSpell.sig(), badSpell.eta())),
            "Planned failed for id"
        );
    }

    function testId() public {
        ConformingSpell badSpell = new ConformingSpell(pause, end);
        address usr = badSpell.action();
        bytes32 tag = badSpell.tag();
        bytes memory sig = badSpell.sig();
        uint256 eta = badSpell.eta();

        bytes32 id = keccak256(abi.encode(usr, tag, sig, eta));

        assertEq(id, protego.id(usr, tag, sig, eta), "Invalid id from params");
    }

    // Test drop of spell created with params
    function testDropSpellParams() public {
        address usr = address(0x1337);
        bytes32 tag = keccak256("Bad spell");
        bytes memory sig = abi.encodeWithSignature("destroy(bool)", true);
        uint256 eta = block.timestamp + 1000 days;

        NonConformingSpell badSpell = new NonConformingSpell(pause);

        assertFalse(protego.planned(usr, tag, sig, eta), "Spell already planned");

        _vote(address(badSpell));
        badSpell.plot(usr, tag, sig, eta);

        EmergencyDropSpell goodSpell = EmergencyDropSpell(protego.deploy(usr, tag, sig, eta));

        assertTrue(protego.planned(usr, tag, sig, eta), "Before drop spell: not planned");
        assertFalse(goodSpell.done(), "Before drop spell: already done");

        _vote(address(goodSpell));
        goodSpell.schedule();

        assertTrue(goodSpell.done(), "After drop spell: not done");
        assertFalse(protego.planned(usr, tag, sig, eta), "After drop spell: spell still planned");
    }

    // Test drop anything by lifting Protego to hat
    function testDropAllSpellsParams() public {
        uint256 iter = 10;
        BadSpells[] memory badSpells = new BadSpells[](iter);

        for (uint256 i; i < iter; i++) {
            ConformingSpell badSpell = new ConformingSpell(pause, end);
            _vote(address(badSpell));
            badSpell.schedule();

            badSpells[i].action = badSpell.action();
            badSpells[i].tag = badSpell.tag();
            badSpells[i].sig = badSpell.sig();
            badSpells[i].eta = badSpell.eta();

            assertTrue(protego.planned(badSpells[i].action, badSpells[i].tag, badSpells[i].sig, badSpells[i].eta));
        }

        _vote(address(protego));

        Protego.Plan[] memory plans = new Protego.Plan[](iter);

        for (uint256 i; i < iter; i++) {
            plans[i] = Protego.Plan({
                usr: badSpells[i].action,
                tag: badSpells[i].tag,
                fax: badSpells[i].sig,
                eta: badSpells[i].eta
            });
            vm.expectEmit(true, true, true, true);
            emit Drop(protego.id(badSpells[i].action, badSpells[i].tag, badSpells[i].sig, badSpells[i].eta));
        }

        protego.drop(plans);

        for (uint256 i; i < iter; i++) {
            assertFalse(protego.planned(badSpells[i].action, badSpells[i].tag, badSpells[i].sig, badSpells[i].eta));
        }

        // After Protego loses the hat, it can no longer drop spells
        _vote(address(0));
        vm.expectRevert("ds-auth-unauthorized");
        protego.drop(plans);
    }

    function _vote(address spell_) internal {
        if (chief.hat() != spell_) {
            deal(address(gov), address(this), 999999999999 ether);
            gov.approve(address(chief), type(uint256).max);
            chief.lock(999999999999 ether);

            address[] memory slate = new address[](1);
            slate[0] = spell_;

            chief.vote(slate);
            chief.lift(spell_);
        }
        assertEq(chief.hat(), spell_);
    }

    event Deploy(address dropSpell);
    event Drop(bytes32 id);
}
