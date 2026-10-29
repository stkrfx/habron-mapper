"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

const COLUMNS = [
  "BillNo",
  "BillDate",
  "Barcode",
  "Name",
  "Color",
  "Article",
  "Size",
  "Hsn",
  "Brand",
  "Quantity",
  "Rate",
  "Gst",
  "SaleRate",
] as const;

type Column = (typeof COLUMNS)[number];
type Row = Record<Column, string>;
type Cell = { row: number; column: number };

const emptyRow = (): Row =>
  Object.fromEntries(COLUMNS.map((column) => [column, ""])) as Row;

const sampleRows: Row[] = [
  {
    ...emptyRow(),
    BillNo: "JHCRS26/166",
    BillDate: "16-10-2026",
    Barcode: "8901326038390",
    Name: "BIKINI",
    Color: "DKPTD",
    Article: "1410",
    Size: "S",
    Hsn: "61082100",
  },
  {
    ...emptyRow(),
    BillNo: "JHCRS26/166",
    BillDate: "16-10-2026",
    Barcode: "8901326038413",
    Name: "BIKINI",
    Color: "DKPTD",
    Article: "1410",
    Size: "L",
    Hsn: "61082100",
  },
];

const sameCell = (a: Cell | null, b: Cell) =>
  a?.row === b.row && a.column === b.column;

export default function Home() {
  const [rows, setRows] = useState<Row[]>([
    ...sampleRows,
    ...Array.from({ length: 48 }, emptyRow),
  ]);
  const [selected, setSelected] = useState<Cell>({ row: 0, column: 0 });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const editRef = useRef<HTMLInputElement>(null);
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (editing) {
      editRef.current?.focus();
      editRef.current?.select();
    }
  }, [editing]);

  const cellKey = (cell: Cell) => `${cell.row}-${cell.column}`;

  const focusCell = (cell: Cell) => {
    const bounded = {
      row: Math.max(0, Math.min(rows.length - 1, cell.row)),
      column: Math.max(0, Math.min(COLUMNS.length - 1, cell.column)),
    };
    setEditing(false);
    setSelected(bounded);
    requestAnimationFrame(() => cellRefs.current.get(cellKey(bounded))?.focus());
  };

  const updateCell = (cell: Cell, value: string) => {
    setRows((current) =>
      current.map((row, index) =>
        index === cell.row
          ? { ...row, [COLUMNS[cell.column]]: value }
          : row,
      ),
    );
  };

  const beginEdit = (cell: Cell, initialValue?: string) => {
    setSelected(cell);
    setDraft(initialValue ?? rows[cell.row][COLUMNS[cell.column]]);
    setEditing(true);
  };

  const finishEdit = () => {
    updateCell(selected, draft);
    setEditing(false);
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>, cell: Cell) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusCell({ ...cell, row: cell.row - 1 });
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      focusCell({ ...cell, row: cell.row + 1 });
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusCell({ ...cell, column: cell.column - 1 });
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusCell({ ...cell, column: cell.column + 1 });
    } else if (event.key === "Enter" || event.key === "F2") {
      event.preventDefault();
      beginEdit(cell);
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      beginEdit(cell, "");
    } else if (event.key === "Tab") {
      event.preventDefault();
      focusCell({
        row: cell.row + (event.shiftKey && cell.column === 0 ? -1 : !event.shiftKey && cell.column === COLUMNS.length - 1 ? 1 : 0),
        column: cell.column + (event.shiftKey ? -1 : 1),
      });
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      beginEdit(cell, event.key);
    }
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setEditing(false);
    } else if (event.key === "Enter") {
      event.preventDefault();
      finishEdit();
      focusCell({ ...selected, row: selected.row + 1 });
    } else if (event.key === "Tab") {
      event.preventDefault();
      finishEdit();
      focusCell({
        row: selected.row + (event.shiftKey && selected.column === 0 ? -1 : !event.shiftKey && selected.column === COLUMNS.length - 1 ? 1 : 0),
        column: selected.column + (event.shiftKey ? -1 : 1),
      });
    } else if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight"
    ) {
      const input = event.currentTarget;
      const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
      const atEnd =
        input.selectionStart === input.value.length &&
        input.selectionEnd === input.value.length;
      const shouldMove =
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        (event.key === "ArrowLeft" && atStart) ||
        (event.key === "ArrowRight" && atEnd);
      if (shouldMove) {
        event.preventDefault();
        finishEdit();
        if (event.key === "ArrowUp") focusCell({ ...selected, row: selected.row - 1 });
        if (event.key === "ArrowDown") focusCell({ ...selected, row: selected.row + 1 });
        if (event.key === "ArrowLeft") focusCell({ ...selected, column: selected.column - 1 });
        if (event.key === "ArrowRight") focusCell({ ...selected, column: selected.column + 1 });
      }
    }
  };

  return (
    <main className="h-dvh w-full overflow-hidden bg-white text-black">
      <div className="h-full w-full overflow-auto">
        <table className="w-max min-w-full table-fixed border-separate border-spacing-0 text-[18px]">
          <colgroup>
            <col className="w-[68px]" />
            {COLUMNS.map((column) => (
              <col
                key={column}
                className={
                  column === "BillNo" || column === "BillDate" || column === "Barcode"
                    ? "w-[215px]"
                    : "w-[200px]"
                }
              />
            ))}
          </colgroup>
          <thead>
            <tr className="h-[38px]">
              <th
                className="sticky left-0 top-0 z-30 border-b border-r border-slate-400 bg-[#e8f3ec] text-center text-[14px] font-normal"
                scope="col"
              >
                0
              </th>
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="sticky top-0 z-20 whitespace-nowrap border-b border-r border-slate-400 bg-[#a9cbe8] px-2 text-center font-bold"
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
                  className="sticky left-0 z-10 border-b border-r border-[#b5c5bc] bg-[#e8f3ec] text-center text-[14px] font-normal"
                >
                  {rowIndex + 1}
                </th>
                {COLUMNS.map((column, columnIndex) => {
                  const cell = { row: rowIndex, column: columnIndex };
                  const isSelected = sameCell(selected, cell);
                  const isEditing = isSelected && editing;
                  return (
                    <td
                      key={column}
                      className="h-[32px] border-b border-r border-black bg-white p-0"
                    >
                      <div
                        ref={(node) => {
                          if (node) cellRefs.current.set(cellKey(cell), node);
                          else cellRefs.current.delete(cellKey(cell));
                        }}
                        data-cell={cellKey(cell)}
                        role="gridcell"
                        aria-selected={isSelected}
                        tabIndex={isSelected && !editing ? 0 : -1}
                        onClick={() => {
                          if (isEditing) return;
                          setSelected(cell);
                          setEditing(false);
                        }}
                        onDoubleClick={() => beginEdit(cell)}
                        onKeyDown={(event) => handleGridKeyDown(event, cell)}
                        className={`relative h-[31px] w-full cursor-default select-none overflow-hidden whitespace-nowrap px-2 leading-[31px] outline-none ${isSelected && !isEditing ? "z-10 outline-2 outline-[#2878e1] outline-offset-[-2px]" : ""}`}
                      >
                        {isEditing ? (
                          <input
                            ref={editRef}
                            aria-label={`Edit row ${rowIndex + 1}, ${column}`}
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onBlur={finishEdit}
                            onKeyDown={handleEditKeyDown}
                            spellCheck={false}
                            className="absolute inset-0 z-20 h-full w-full cursor-text border-0 bg-white px-2 leading-[31px] outline-none"
                          />
                        ) : (
                          row[column]
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
