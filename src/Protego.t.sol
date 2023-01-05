
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

contract BadAction {

    EndLike private end;

    constructor(address _end) {
        end = EndLike(_end);
    }

    function execute() external {
        end.cage();
    }
}

contract BadSpell {
    DSPauseLike immutable pause;
    address     immutable action;
    bytes32     immutable tag;
    bytes                 fax;
    uint256     immutable eta;

    constructor(address _pause, address _action, bytes32 _tag, bytes memory _fax, uint256 _eta) {
        pause  = DSPauseLike(_pause);
        action = _action;
        tag    = _tag;
        fax    = _fax;
        eta    = _eta;
    }

    function cast() external {
        pause.drop(action, tag, fax, eta);
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

            assertTrue(!DSSpellTester(spell_).done());

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

    function testDeploy() external {
        address badSpell = address(new DssEndTestSpell(address(pause), address(end)));

        assertTrue(badSpell != address(0));
        assertTrue(!protego.planned(DSSpellLike(badSpell)));


    }





    // function vote() private {
    //     if (chief.hat() != address(spell)) {
    //         vm.store(
    //             address(gov),
    //             keccak256(abi.encode(address(this), uint256(1))),
    //             bytes32(uint256(999999999999 ether))
    //         );
    //         gov.approve(address(chief), uint256(-1));
    //         chief.lock(_sub(gov.balanceOf(address(this)), 1 ether));

    //         assertTrue(!spell.done());

    //         address[] memory yays = new address[](1);
    //         yays[0] = address(spell);

    //         chief.vote(yays);
    //         chief.lift(address(spell));
    //     }
    //     assertEq(chief.hat(), address(spell));
    // }

    // function testFail_call_from_unauthorized() public {
    //     address      usr = target;
    //     bytes32      tag = extcodehash(usr);
    //     bytes memory fax = abi.encodeWithSignature("get()");
    //     uint         eta = now + pause.delay();

    //     pause.plot(usr, tag, fax, eta);
    //     hevm.warp(eta);

    //     stranger.drop(pause, usr, tag, fax, eta);
    // }

    // function test_drop_plotted_plan() public {
    //     address      usr = target;
    //     bytes32      tag = extcodehash(usr);
    //     bytes memory fax = abi.encodeWithSignature("get()");
    //     uint         eta = now + pause.delay();

    //     pause.plot(usr, tag, fax, eta);

    //     hevm.warp(eta);
    //     pause.drop(usr, tag, fax, eta);

    //     bytes32 id = keccak256(abi.encode(usr, tag, fax, eta));
    //     assertTrue(!pause.plans(id));
    // }
}
