import { table } from 'table';

const tableConfig = {
    columns: {
        0: { width: 21, wrapWord: true },
        1: { width: 33, wrapWord: true },
        2: { width: 21, wrapWord: true },
        3: { width: 33, wrapWord: true },
        4: { width: 10, wrapWord: true },
        5: { width: 10, wrapWord: true },
        6: { width: 10, wrapWord: true }
    }
};

export function createTable(events) {

    let tableData = events.map(event => [
        event.guy,
        event.hash,
        event.usr,
        event.tag,
        event.fax,
        event.eta,
        event.status
    ]);

    tableData.sort((a, b) => {
        const etaA = BigInt(a[5]);
        const etaB = BigInt(b[5]);
        return etaB > etaA ? 1 : etaB < etaA ? -1 : 0;
    });

    if (tableData.length === 0) {
        return "No records to display.";
    }

    tableData.unshift(["SPELL", "HASH", "USR", "TAG", "FAX", "ETA", "STATUS"]);

    return table(tableData, tableConfig);
}
