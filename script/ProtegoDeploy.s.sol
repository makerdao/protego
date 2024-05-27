// SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>
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

import {Script} from "forge-std/Script.sol";
import {MCD, DssInstance} from "dss-test/MCD.sol";
import {ScriptTools} from "dss-test/ScriptTools.sol";
import {ProtegoDeploy, ProtegoDeployParams} from "./dependencies/ProtegoDeploy.sol";
import {ProtegoInstance} from "./dependencies/ProtegoInstance.sol";

contract ProtegoDeployScript is Script {
    using ScriptTools for string;

    string constant NAME = "protego";

    address constant CHAINLOG = 0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F;
    DssInstance dss = MCD.loadFromChainlog(CHAINLOG);
    address pause = dss.chainlog.getAddress("MCD_PAUSE");
    ProtegoInstance inst;

    function run() external {
        vm.startBroadcast();

        inst = ProtegoDeploy.deploy(ProtegoDeployParams({pause: pause}));

        vm.stopBroadcast();

        ScriptTools.exportContract(NAME, "protego", inst.protego);
    }
}
