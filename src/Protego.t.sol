
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Protego.sol";
import "./test/TestSpell.sol";

interface Hevm {
    function warp(uint256) external;
    function store(address,bytes32,bytes32) external;
    function load(address,bytes32) external view returns (bytes32);
    function addr(uint) external returns (address);
    function sign(uint, bytes32) external returns (uint8, bytes32, bytes32);
    function prank(address) external;
    function startPrank(address) external;
    function stopPrank() external;
}

interface ChainlogLike {
    function getAddress(bytes32) external view returns (address);
}

interface EndLike {
    function cage() external;
}

interface DSPauseTester {
    function plans(bytes32) external view returns (bool);
    function drop(address, bytes32, bytes calldata, uint256) external;
    function plot(address, bytes32, bytes calldata, uint256) external;
    function exec(address, bytes32, bytes calldata, uint256) external returns (bytes memory);
}

interface DSSpellTester {
    function action() external returns (address);
    function tag() external returns (bytes32);
    function sig() external returns (bytes memory);
    function eta() external returns (uint256);
    function done() external returns (bool);
}

interface DSChiefLike {
    function slates(bytes32) external view returns (address[] memory);
    function votes(address) external view returns (bytes32);
    function approvals(address) external view returns (uint256);
    function deposits(address) external view returns (address);
    function GOV() external view returns (address);
    function IOU() external view returns (address);
    function hat() external view returns (address);
    function lock(uint256) external;
    function free(uint256) external;
    function etch(address[] calldata) external returns (bytes32);
    function vote(address[] calldata) external returns (bytes32);
    function vote(bytes32) external;
    function lift(address) external;
}

interface DSTokenLike {
    function balanceOf(address) external view returns (uint256);
    function transfer(address, uint256) external returns (bool);
    function allowance(address, address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
    function approve(address) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
}

contract Stranger {
    function plot(DSPauseTester pause, address usr, bytes32 tag, bytes memory fax, uint eta) public {
        pause.plot(usr, tag, fax, eta);
    }
    function drop(DSPauseTester pause, address usr, bytes32 tag, bytes memory fax, uint eta) public {
        pause.drop(usr, tag, fax, eta);
    }
    function exec(DSPauseTester pause, address usr, bytes32 tag, bytes memory fax, uint eta)
        public returns (bytes memory)
    {
        return pause.exec(usr, tag, fax, eta);
    }
}

struct BadSpells {
    address badSpell;
    address action;
    bytes32 tag;
    bytes   sig;
    uint256 eta;
}

contract BadAction {

    EndLike private end;

    constructor(address _end) {
        end = EndLike(_end);
    }

    function execute() external {
        end.cage();
    }
}


contract ProtegoTest is Test {

    // CHEAT_CODE = 0x7109709ECfa91a80626fF3989D68f67F5b1DD12D
    bytes20 constant CHEAT_CODE =
        bytes20(uint160(uint256(keccak256('hevm cheat code'))));

    Hevm hevm;
    DSPauseLike pause;
    DSChiefLike chief;
    DSTokenLike gov;
    address end;
    Protego protego;
    Stranger stranger;
    address target;

    //


    function setUp() public {
        hevm = Hevm(address(CHEAT_CODE));

        ChainlogLike   LOG = ChainlogLike(0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F);

        pause = DSPauseLike(LOG.getAddress("MCD_PAUSE"));
        end = LOG.getAddress("MCD_END");
        chief = DSChiefLike(LOG.getAddress("MCD_ADM"));
        gov = DSTokenLike(chief.GOV());

        protego = new Protego(address(pause));

        stranger = new Stranger();
    }

    function vote(address spell_) internal {
        if (chief.hat() != spell_) {
            giveTokens(address(gov), 999999999999 ether);
            gov.approve(address(chief), type(uint256).max);
            chief.lock(999999999999 ether);

            address[] memory slate = new address[](1);

            slate[0] = spell_;

            chief.vote(slate);
            chief.lift(spell_);
        }
        assertEq(chief.hat(), spell_);
    }

    function giveTokens(address token, uint256 amount) internal {
        // Edge case - balance is already set for some reason
        if (DSTokenLike(token).balanceOf(address(this)) == amount) return;

        // Scan the storage for the balance storage slot
        for (uint256 i = 0; i < 200; i++) {
            // Solidity-style storage layout for maps
            {
                bytes32 prevValue = vm.load(
                    address(token),
                    keccak256(abi.encode(address(this), uint256(i)))
                );

                vm.store(
                    address(token),
                    keccak256(abi.encode(address(this), uint256(i))),
                    bytes32(amount)
                );
                if (DSTokenLike(token).balanceOf(address(this)) == amount) {
                    // Found it
                    return;
                } else {
                    // Keep going after restoring the original value
                    vm.store(
                        address(token),
                        keccak256(abi.encode(address(this), uint256(i))),
                        prevValue
                    );
                }
            }

            // Vyper-style storage layout for maps
            {
                bytes32 prevValue = vm.load(
                    address(token),
                    keccak256(abi.encode(uint256(i), address(this)))
                );

                vm.store(
                    address(token),
                    keccak256(abi.encode(uint256(i), address(this))),
                    bytes32(amount)
                );
                if (DSTokenLike(token).balanceOf(address(this)) == amount) {
                    // Found it
                    return;
                } else {
                    // Keep going after restoring the original value
                    vm.store(
                        address(token),
                        keccak256(abi.encode(uint256(i), address(this))),
                        prevValue
                    );
                }
            }
        }

        // We have failed if we reach here
        assertTrue(false, "TestError/GiveTokens-slot-not-found");
    }

    function testPause() external {
        assertEq(protego.pause(), address(pause));
    }

    function testDeploySpell() external {
        DssEndTestSpell badSpell = new DssEndTestSpell(address(pause), address(end));

        assertTrue(address(badSpell) != address(0));
        assertTrue(!protego.planned(DSSpellLike(address(badSpell))));

        address        usr = badSpell.action();
        bytes32        tag = badSpell.tag();
        bytes   memory sig = badSpell.sig();
        uint256        eta = badSpell.eta();

        address goodSpell = protego.deploy(DSSpellLike(address(badSpell)));

        assertEq(protego.id(DSSpellLike(goodSpell)), protego.id(usr, tag, sig, eta));
    }

    function testDeploySpellParams() external {
        DssEndTestSpell badSpell = new DssEndTestSpell(address(pause), address(end));

        assertTrue(address(badSpell) != address(0));
        assertTrue(!protego.planned(DSSpellLike(address(badSpell))));

        address        usr = badSpell.action();
        bytes32        tag = badSpell.tag();
        bytes   memory sig = badSpell.sig();
        uint256        eta = badSpell.eta();

        address goodSpell = protego.deploy(usr, tag, sig, eta);

        assertEq(protego.id(DSSpellLike(goodSpell)), protego.id(usr, tag, sig, eta));
    }

    function testPlanned() external {
        DssEndTestSpell badSpell = new DssEndTestSpell(address(pause), address(end));

        assertTrue(address(badSpell) != address(0));
        assertTrue(!protego.planned(DSSpellLike(address(badSpell))));

        vote(address(badSpell));
        badSpell.schedule();

        address        usr = badSpell.action();
        bytes32        tag = badSpell.tag();
        bytes   memory sig = badSpell.sig();
        uint256        eta = badSpell.eta();

        assertTrue(protego.planned(usr, tag, sig, eta));
        assertTrue(protego.planned(DSSpellLike(address(badSpell))));
        assertTrue(protego.planned(protego.id(DSSpellLike(address(badSpell)))));
    }

    function testId() external {
        DssEndTestSpell badSpell = new DssEndTestSpell(address(pause), address(end));

        assertTrue(address(badSpell) != address(0));
        assertTrue(!protego.planned(DSSpellLike(address(badSpell))));

        vote(address(badSpell));
        badSpell.schedule();

        address        usr = badSpell.action();
        bytes32        tag = badSpell.tag();
        bytes   memory sig = badSpell.sig();
        uint256        eta = badSpell.eta();

        bytes32        id  = keccak256(abi.encode(usr, tag, sig, eta));

        assertEq(id, protego.id(usr, tag, sig, eta));
        assertEq(id, protego.id(DSSpellLike(address(badSpell))));
    }

    // Test drop of conformant spell
    function testDropSpell() external {
        DssEndTestSpell badSpell = new DssEndTestSpell(address(pause), address(end));

        assertTrue(address(badSpell) != address(0));
        assertTrue(!protego.planned(DSSpellLike(address(badSpell))));

        vote(address(badSpell));
        badSpell.schedule();

        address        usr = badSpell.action();
        bytes32        tag = badSpell.tag();
        bytes   memory sig = badSpell.sig();
        uint256        eta = badSpell.eta();

        assertTrue(protego.planned(usr, tag, sig, eta));

        Spell goodSpell = Spell(protego.deploy(DSSpellLike(address(badSpell))));

        vote(address(goodSpell));

        goodSpell.cast();

        assertTrue(!protego.planned(usr, tag, sig, eta));
        assertTrue(!protego.planned(DSSpellLike(address(badSpell))));
    }

    // Test drop of spell created with params
    function testDropSpellParams() external {
        DssEndTestSpell badSpell = new DssEndTestSpell(address(pause), address(end));

        assertTrue(address(badSpell) != address(0));
        assertTrue(!protego.planned(DSSpellLike(address(badSpell))));

        vote(address(badSpell));
        badSpell.schedule();

        address        usr = badSpell.action();
        bytes32        tag = badSpell.tag();
        bytes   memory sig = badSpell.sig();
        uint256        eta = badSpell.eta();

        assertTrue(protego.planned(usr, tag, sig, eta));

        Spell goodSpell = Spell(protego.deploy(usr, tag, sig, eta));

        vote(address(goodSpell));

        goodSpell.cast();

        assertTrue(!protego.planned(usr, tag, sig, eta));
        assertTrue(!protego.planned(DSSpellLike(address(badSpell))));
    }

    // Test drop anything by lifting Protego to hat
    function testDropAllSpells() external {

        uint256 iter = 100;
        BadSpells[] memory badSpells = new BadSpells[](iter);

        for (uint i = 0; i < iter; i++) {
            DssEndTestSpell badSpell = new DssEndTestSpell(address(pause), address(end));

            vote(address(badSpell));

            badSpell.schedule();

            badSpells[i].badSpell = address(badSpell);

            assertTrue(protego.planned(DSSpellLike(address(badSpell))));
        }

        vote(address(protego));

        for (uint i = 0; i < iter; i++) {

            protego.drop(DSSpellLike(badSpells[i].badSpell));

            assertTrue(!protego.planned(DSSpellLike(badSpells[i].badSpell)));
        }
    }

    // Test drop anything by lifting Protego to hat
    function testDropAllSpellsParams() external {

        uint256 iter = 100;
        BadSpells[] memory badSpells = new BadSpells[](iter);

        for (uint i = 0; i < iter; i++) {
            DssEndTestSpell badSpell = new DssEndTestSpell(address(pause), address(end));

            vote(address(badSpell));

            badSpell.schedule();

            badSpells[i].action   = badSpell.action();
            badSpells[i].tag      = badSpell.tag();
            badSpells[i].sig      = badSpell.sig();
            badSpells[i].eta      = badSpell.eta();

            assertTrue(protego.planned(badSpells[i].action, badSpells[i].tag, badSpells[i].sig, badSpells[i].eta));
        }

        vote(address(protego));

        for (uint i = 0; i < iter; i++) {

            protego.drop(badSpells[i].action, badSpells[i].tag, badSpells[i].sig, badSpells[i].eta);

            assertTrue(!protego.planned(badSpells[i].action, badSpells[i].tag, badSpells[i].sig, badSpells[i].eta));
        }
    }
}
