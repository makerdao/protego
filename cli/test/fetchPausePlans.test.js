import { jest, describe, it, expect, beforeAll } from "@jest/globals";
import { ethers } from "ethers";
import { fetchPausePlans, decodeLogNote, decodeCallParams, hash, processEvent } from "../fetchPausePlans.js";
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

  let mockContractInstance;

  beforeEach(() => {
    mockContractInstance = {
      queryFilter: jest.fn().mockImplementation((topics, fromBlock) => {
        // Filter events based on fromBlock and topics
        const filteredEvents = mockEvents.filter(event => {
          const matchesBlock = event.blockNumber >= fromBlock;
          const matchesTopic = topics[0].includes(event.topics[0]);
          return matchesBlock && matchesTopic;
        });
        return Promise.resolve(filteredEvents);
      }),
      interface: new ethers.Interface(pauseABI)
    };
  });

  it("should fetch all spells correctly", async () => {
    const result = await fetchPausePlans(mockContractInstance);
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

    expect(mockContractInstance.queryFilter).toHaveBeenCalled();
  });

  it("should fetch pending spells correctly", async () => {
    const result = await fetchPausePlans(mockContractInstance, {
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
    const result = await fetchPausePlans(mockContractInstance, {
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
    const result = await fetchPausePlans(mockContractInstance, {
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

  it("should fetch spells from specified block number", async () => {
    const fromBlock = 16700000; // intentionally broke down one of the events (plot before this block, exec after)
    const result = await fetchPausePlans(mockContractInstance, { fromBlock });

    expect(mockContractInstance.queryFilter).toHaveBeenCalledWith(
      [[PLOT_TOPIC, EXEC_TOPIC, DROP_TOPIC]],
      fromBlock
    );

    const expectedEvents = mockEvents.filter(e => {
      const matchesBlock = e.blockNumber >= fromBlock;
      const matchesTopic = [PLOT_TOPIC, EXEC_TOPIC, DROP_TOPIC].includes(e.topics[0]);
      return matchesBlock && matchesTopic;
    });

    const allEventsByHash = new Map();
    processedEvents.forEach(event => {
      if (!allEventsByHash.has(event.planHash)) {
        allEventsByHash.set(event.planHash, []);
      }
      allEventsByHash.get(event.planHash).push(event);
    });

    const expectedSpells = new Set();
    expectedEvents.forEach(event => {
      const decodedCall = decodeCallParams(
        event.topics[0].slice(0, 10),
        decodeLogNote(event, mockContractInstance).fax,
        mockContractInstance
      );
      const planHash = hash(decodedCall);
      const spellEvents = allEventsByHash.get(planHash) || [];
      
      // A spell should be included if:
      // 1. Its PLOT event is after fromBlock, or
      // 2. Its EXEC/DROP event is after fromBlock and determines its final status
      const plotEvent = spellEvents.find(e => e.topics[0] === PLOT_TOPIC);
      const execEvent = spellEvents.find(e => e.topics[0] === EXEC_TOPIC);
      const dropEvent = spellEvents.find(e => e.topics[0] === DROP_TOPIC);
      
      if (plotEvent && plotEvent.blockNumber >= fromBlock) {
        expectedSpells.add(planHash);
      } else if (execEvent && execEvent.blockNumber >= fromBlock) {
        expectedSpells.add(planHash);
      } else if (dropEvent && dropEvent.blockNumber >= fromBlock) {
        expectedSpells.add(planHash);
      }
    });

    expect(result).toHaveLength(expectedSpells.size);

    result.forEach(spell => {
      const spellEvents = allEventsByHash.get(spell.hash) || [];
      const plotEvent = spellEvents.find(e => e.topics[0] === PLOT_TOPIC);
      const execEvent = spellEvents.find(e => e.topics[0] === EXEC_TOPIC);
      const dropEvent = spellEvents.find(e => e.topics[0] === DROP_TOPIC);

      expect(plotEvent).toBeTruthy();

      if (spell.status === 'EXECUTED' && execEvent && execEvent.blockNumber >= fromBlock) {
        expect(execEvent.blockNumber).toBeGreaterThanOrEqual(fromBlock);
      }
      if (spell.status === 'DROPPED' && dropEvent && dropEvent.blockNumber >= fromBlock) {
        expect(dropEvent.blockNumber).toBeGreaterThanOrEqual(fromBlock);
      }
    });
  });
});
