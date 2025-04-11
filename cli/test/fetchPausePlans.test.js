import { jest, describe, it, expect, beforeAll } from "@jest/globals";
import { ethers } from "ethers";
import { fetchPausePlans } from "../fetchPausePlans.js";
import pauseABI from "../pause_abi.json" with { type: "json" };
import { mockEvents } from "./fixtures/events.js";

const PLOT_TOPIC =
  "0x46d2fbbb00000000000000000000000000000000000000000000000000000000";
const EXEC_TOPIC =
  "0x168ccd6700000000000000000000000000000000000000000000000000000000";
const DROP_TOPIC =
  "0x162c7de300000000000000000000000000000000000000000000000000000000";

let eventStats;
let processedEvents;

function decodeLogNote(log, contract) {
  const eventFragment = contract.interface.getEvent("LogNote");
  return contract.interface
    .decodeEventLog(eventFragment, log.data, log.topics)
    .toObject();
}

function decodeCallParams(sig, fax, contract) {
  const functionFragment = contract.interface.getFunction(sig);
  return contract.interface
    .decodeFunctionData(functionFragment, fax)
    .toObject();
}

function hash(params) {
  const abiCoder = new ethers.AbiCoder();
  const types = ["address", "bytes32", "bytes", "uint256"];
  const encoded = abiCoder.encode(types, [
    params.usr,
    params.tag,
    params.fax,
    params.eta,
  ]);
  return ethers.keccak256(encoded);
}

function processEvent(event, contract) {
  const decoded = decodeLogNote(event, contract);
  const decodedCall = decodeCallParams(
    event.topics[0].slice(0, 10),
    decoded.fax,
    contract,
  );
  return {
    ...event,
    decoded,
    decodedCall,
    planHash: hash(decodedCall),
  };
}

function analyzeEvents(events) {
  const plotEvents = events.filter((e) => e.topics[0] === PLOT_TOPIC);
  const execEvents = events.filter((e) => e.topics[0] === EXEC_TOPIC);
  const dropEvents = events.filter((e) => e.topics[0] === DROP_TOPIC);

  return {
    total: events.length,
    plotCount: plotEvents.length,
    execCount: execEvents.length,
    dropCount: dropEvents.length,
    pendingCount: plotEvents.length - (execEvents.length + dropEvents.length),
    events: {
      plot: plotEvents,
      exec: execEvents,
      drop: dropEvents,
    },
  };
}

describe("fetchPausePlans", () => {
  beforeAll(() => {
    const mockContract = {
      interface: new ethers.Interface(pauseABI),
    };
    processedEvents = mockEvents.map((event) =>
      processEvent(event, mockContract),
    );

    eventStats = analyzeEvents(mockEvents);
  });

  let mockContract;
  let mockEthers;

  beforeEach(() => {
    mockContract = {
      queryFilter: jest.fn().mockResolvedValue(mockEvents),
      interface: new ethers.Interface(pauseABI),
    };

    mockEthers = {
      Contract: jest.fn().mockReturnValue(mockContract),
      getDefaultProvider: jest.fn().mockReturnValue({}),
    };
  });

  it("should fetch all spells correctly", async () => {
    const result = await fetchPausePlans(mockEthers, "http://localhost:8545");
    expect(result).toHaveLength(eventStats.plotCount);

    result.forEach((spell) => {
      const plotEvent = processedEvents.find(
        (e) => e.planHash === spell.hash && e.topics[0] === PLOT_TOPIC,
      );
      expect(plotEvent).toBeTruthy();

      expect(spell).toMatchObject({
        hash: plotEvent.planHash,
        guy: plotEvent.decoded.guy,
        usr: plotEvent.decodedCall.usr,
        tag: plotEvent.decodedCall.tag,
        fax: plotEvent.decodedCall.fax.trim(),
        eta: plotEvent.decodedCall.eta,
      });
    });

    expect(mockEthers.Contract).toHaveBeenCalled();
    expect(mockContract.queryFilter).toHaveBeenCalled();
  });

  it("should fetch pending spells correctly", async () => {
    const result = await fetchPausePlans(mockEthers, "http://localhost:8545", {
      status: "PENDING",
    });
    expect(result).toHaveLength(eventStats.pendingCount);

    result.forEach((spell) => {
      const plotEvent = processedEvents.find(
        (e) => e.planHash === spell.hash && e.topics[0] === PLOT_TOPIC,
      );
      expect(plotEvent).toBeTruthy();

      const execEvent = processedEvents.find(
        (e) => e.planHash === spell.hash && e.topics[0] === EXEC_TOPIC,
      );
      const dropEvent = processedEvents.find(
        (e) => e.planHash === spell.hash && e.topics[0] === DROP_TOPIC,
      );
      expect(execEvent).toBeUndefined();
      expect(dropEvent).toBeUndefined();

      expect(spell).toMatchObject({
        hash: plotEvent.planHash,
        guy: plotEvent.decoded.guy,
        usr: plotEvent.decodedCall.usr,
        tag: plotEvent.decodedCall.tag,
        fax: plotEvent.decodedCall.fax.trim(),
        eta: plotEvent.decodedCall.eta,
        status: "PENDING",
      });
    });
  });

  it("should fetch executed spells correctly", async () => {
    const result = await fetchPausePlans(mockEthers, "http://localhost:8545", {
      status: "EXECUTED",
    });
    expect(result).toHaveLength(eventStats.execCount);

    result.forEach((spell) => {
      const plotEvent = processedEvents.find(
        (e) => e.planHash === spell.hash && e.topics[0] === PLOT_TOPIC,
      );
      const execEvent = processedEvents.find(
        (e) => e.planHash === spell.hash && e.topics[0] === EXEC_TOPIC,
      );

      expect(plotEvent).toBeTruthy();
      expect(execEvent).toBeTruthy();

      const dropEvent = processedEvents.find(
        (e) => e.planHash === spell.hash && e.topics[0] === DROP_TOPIC,
      );
      expect(dropEvent).toBeUndefined();

      expect(spell).toMatchObject({
        hash: plotEvent.planHash,
        guy: plotEvent.decoded.guy,
        usr: plotEvent.decodedCall.usr,
        tag: plotEvent.decodedCall.tag,
        fax: plotEvent.decodedCall.fax.trim(),
        eta: plotEvent.decodedCall.eta,
        status: "EXECUTED",
      });
    });
  });

  it("should fetch dropped spells correctly", async () => {
    const result = await fetchPausePlans(mockEthers, "http://localhost:8545", {
      status: "DROPPED",
    });
    expect(result).toHaveLength(eventStats.dropCount);

    result.forEach((spell) => {
      const plotEvent = processedEvents.find(
        (e) => e.planHash === spell.hash && e.topics[0] === PLOT_TOPIC,
      );
      const dropEvent = processedEvents.find(
        (e) => e.planHash === spell.hash && e.topics[0] === DROP_TOPIC,
      );

      expect(plotEvent).toBeTruthy();
      expect(dropEvent).toBeTruthy();

      const execEvent = processedEvents.find(
        (e) => e.planHash === spell.hash && e.topics[0] === EXEC_TOPIC,
      );
      expect(execEvent).toBeUndefined();

      expect(spell).toMatchObject({
        hash: plotEvent.planHash,
        guy: plotEvent.decoded.guy,
        usr: plotEvent.decodedCall.usr,
        tag: plotEvent.decodedCall.tag,
        fax: plotEvent.decodedCall.fax.trim(),
        eta: plotEvent.decodedCall.eta,
        status: "DROPPED",
      });
    });
  });
});
