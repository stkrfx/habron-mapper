"use client";

import { useState, type KeyboardEvent } from "react";

const COLUMNS = [
  "Party BillNo",
  "Pary BillDate",
  "BarcodeNo",
  "ItemName",
  "Color",
  "ArticleNo",
  "ItemSize",
  "HsnCode",
  "Brand",
  "Quantity",
  "PurchaseRate",
  "Gst",
  "SaleRate",
] as const;

type Column = (typeof COLUMNS)[number];
type Row = Record<Column, string>;

const emptyRow = (): Row =>
  Object.fromEntries(COLUMNS.map((column) => [column, ""])) as Row;

const sampleRows: Row[] = [
  {
    ...emptyRow(),
    "Party BillNo": "JHCRS26/166",
    "Pary BillDate": "16-10-2026",
    BarcodeNo: "8901326038390",
    ItemName: "BIKINI",
    Color: "DKPTD",
    ArticleNo: "1410",
    ItemSize: "S",
    HsnCode: "61082100",
  },
  {
    ...emptyRow(),
    "Party BillNo": "JHCRS26/166",
    "Pary BillDate": "16-10-2026",
    BarcodeNo: "8901326038413",
    ItemName: "BIKINI",
    Color: "DKPTD",
    ArticleNo: "1410",
    ItemSize: "L",
    HsnCode: "61082100",
  },
];

export default function Home() {
  const [rows, setRows] = useState<Row[]>([
    ...sampleRows,
    ...Array.from({ length: 48 }, emptyRow),
  ]);

  const updateCell = (rowIndex: number, column: Column, value: string) => {
    setRows((current) =>
      current.map((row, index) =>
        index === rowIndex ? { ...row, [column]: value } : row,
      ),
    );
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    columnIndex: number,
  ) => {
    let nextRow = rowIndex;
    let nextColumn = columnIndex;

    if (event.key === "Enter" || event.key === "ArrowDown") nextRow += 1;
    else if (event.key === "ArrowUp") nextRow -= 1;
    else if (event.key === "Tab") nextColumn += event.shiftKey ? -1 : 1;
    else return;

    if (
      nextRow >= 0 &&
      nextRow < rows.length &&
      nextColumn >= 0 &&
      nextColumn < COLUMNS.length
    ) {
      event.preventDefault();
      document
        .querySelector<HTMLInputElement>(
          `[data-cell="${nextRow}-${nextColumn}"]`,
        )
        ?.focus();
    }
  };

  return (
    <main className="h-dvh w-full overflow-hidden bg-white text-black">
      <div className="h-full w-full overflow-auto">
        <table className="w-max min-w-full table-fixed border-separate border-spacing-0 font-serif text-[18px]">
          <colgroup>
            <col className="w-[68px]" />
            {COLUMNS.map((column) => (
              <col
                key={column}
                className={
                  column === "Party BillNo" || column === "Pary BillDate"
                    ? "w-[215px]"
                    : column === "BarcodeNo"
                      ? "w-[215px]"
                      : "w-[200px]"
                }
              />
            ))}
          </colgroup>
          <thead>
            <tr className="h-[38px]">
              <th className="sticky left-0 top-0 z-30 border-b border-r border-slate-400 bg-[#e8f3ec] text-center text-[14px] font-normal" scope="col">
                0
              </th>
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="sticky top-0 z-20 border-b border-r border-slate-400 bg-[#a9cbe8] px-2 text-center font-bold whitespace-nowrap"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="h-[32px]">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-b border-r border-[#b5c5bc] bg-[#e8f3ec] text-center font-sans text-[14px] font-normal"
                >
                  {rowIndex + 1}
                </th>
                {COLUMNS.map((column, columnIndex) => (
                  <td
                    key={column}
                    className="h-[32px] border-b border-r border-black bg-white p-0"
                  >
                    <input
                      data-cell={`${rowIndex}-${columnIndex}`}
                      aria-label={`Row ${rowIndex + 1}, ${column}`}
                      value={row[column]}
                      onChange={(event) =>
                        updateCell(rowIndex, column, event.target.value)
                      }
                      onKeyDown={(event) =>
                        handleKeyDown(event, rowIndex, columnIndex)
                      }
                      spellCheck={false}
                      className="block h-[31px] w-full min-w-0 border-0 bg-transparent px-2 text-[18px] leading-none outline-none focus:relative focus:z-10 focus:outline-2 focus:outline-[#2878e1] focus:outline-offset-[-2px]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
