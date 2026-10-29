"use client";

import { useCallback, useMemo, useRef, useState } from "react";

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

type GridRow = Record<(typeof COLUMNS)[number], string>;

const makeEmptyRow = (): GridRow =>
  Object.fromEntries(COLUMNS.map((column) => [column, ""])) as GridRow;

const initialRows: GridRow[] = [
  {
    ...makeEmptyRow(),
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
    ...makeEmptyRow(),
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

function FilterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="filter-icon">
      <path d="M2 3.5h12M4.5 7.5h7M6.5 11.5h3" />
      <path d="M11.5 3.5 14 6" />
    </svg>
  );
}

export default function Home() {
  const [rows, setRows] = useState<GridRow[]>(initialRows);
  const [selectedCell, setSelectedCell] = useState({ row: 0, column: 0 });
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showOnlyFilled, setShowOnlyFilled] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const updateCell = useCallback(
    (rowIndex: number, column: (typeof COLUMNS)[number], value: string) => {
      setRows((current) =>
        current.map((row, index) =>
          index === rowIndex ? { ...row, [column]: value } : row,
        ),
      );
    },
    [],
  );

  const visibleRows = useMemo(() => {
    return rows
      .map((row, rowIndex) => ({ row, rowIndex }))
      .filter(({ row }) => {
        const matchesSearch =
          !searchText ||
          COLUMNS.some((column) =>
            row[column].toLowerCase().includes(searchText.toLowerCase()),
          );
        const matchesFilter =
          !filterColumn ||
          !filterText ||
          row[filterColumn as (typeof COLUMNS)[number]]
            .toLowerCase()
            .includes(filterText.toLowerCase());
        const hasContent = COLUMNS.some((column) => row[column].trim());
        return matchesSearch && matchesFilter && (!showOnlyFilled || hasContent);
      });
  }, [rows, searchText, filterColumn, filterText, showOnlyFilled]);

  const addRows = (count = 1) => {
    setRows((current) => [...current, ...Array.from({ length: count }, makeEmptyRow)]);
    requestAnimationFrame(() => {
      const scroller = gridRef.current;
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    });
  };

  const clearRows = () => {
    if (window.confirm("Clear all cell values? This cannot be undone.")) {
      setRows([]);
      setSelectedCell({ row: 0, column: 0 });
    }
  };

  const downloadCsv = () => {
    const escapeCsv = (value: string) => {
      const safeValue = value.replace(/"/g, '""');
      return /[",\r\n]/.test(value) ? `"${safeValue}"` : safeValue;
    };
    const csv = [COLUMNS, ...rows.map((row) => COLUMNS.map((column) => row[column]))]
      .map((record) => record.map((value) => escapeCsv(String(value))).join(","))
      .join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "habron-mapper-sheet.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const moveSelection = (row: number, column: number) => {
    setSelectedCell({
      row: Math.max(0, Math.min(rows.length - 1, row)),
      column: Math.max(0, Math.min(COLUMNS.length - 1, column)),
    });
  };

  const handleCellKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    columnIndex: number,
  ) => {
    if (event.key === "Enter" || event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(rowIndex + 1, columnIndex);
      (document.querySelector<HTMLInputElement>(
        `[data-cell="${rowIndex + 1}-${columnIndex}"]`,
      ))?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(rowIndex - 1, columnIndex);
      (document.querySelector<HTMLInputElement>(
        `[data-cell="${rowIndex - 1}-${columnIndex}"]`,
      ))?.focus();
    } else if (event.key === "Tab") {
      const nextColumn = columnIndex + (event.shiftKey ? -1 : 1);
      if (nextColumn >= 0 && nextColumn < COLUMNS.length) {
        event.preventDefault();
        moveSelection(rowIndex, nextColumn);
        (document.querySelector<HTMLInputElement>(
          `[data-cell="${rowIndex}-${nextColumn}"]`,
        ))?.focus();
      }
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Habron Mapper home">
          <span className="brand-mark">H</span>
          <span className="brand-name">habron<span>mapper</span></span>
        </a>
        <div className="topbar-divider" />
        <div className="document-title">
          <span className="document-title-main">Purchase entry</span>
          <span className="saved-state"><span className="saved-dot" /> Local draft</span>
        </div>
        <div className="topbar-actions">
          <button className="button button-quiet" onClick={clearRows} type="button">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h12M8 6V4h4v2m-6 0 1 10h6l1-10M8 9v4m4-4v4" /></svg>
            Clear sheet
          </button>
          <button className="button button-primary" onClick={downloadCsv} type="button">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v9m-3-3 3 3 3-3M4 13v3h12v-3" /></svg>
            Export CSV
          </button>
        </div>
      </header>

      <section className="workspace">
        <div className="page-heading">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> DATA WORKSPACE</div>
            <h1>Purchase entry <span className="heading-pill">Spreadsheet</span></h1>
            <p className="page-description">Enter, review, and prepare item data for mapping.</p>
          </div>
          <div className="sheet-summary">
            <div className="summary-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="2" /><path d="M3.5 9h17M3.5 14.5h17M9 3.5v17M14.5 3.5v17" /></svg>
            </div>
            <div><strong>{rows.length.toLocaleString("en-IN")} rows</strong><span>{COLUMNS.length} columns</span></div>
          </div>
        </div>

        <div className="sheet-card">
          <div className="sheet-toolbar">
            <div className="sheet-tab">
              <span className="sheet-tab-icon"><svg viewBox="0 0 18 18" aria-hidden="true"><rect x="2" y="2" width="14" height="14" rx="2" /><path d="M2 6.5h14M6.5 2v14" /></svg></span>
              <span>Purchase data</span>
              <span className="tab-menu">⌄</span>
            </div>
            <div className="toolbar-controls">
              <label className="search-box">
                <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>
                <input
                  aria-label="Search all cells"
                  placeholder="Find in sheet…"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
                {searchText && <button type="button" aria-label="Clear search" onClick={() => setSearchText("")}>×</button>}
              </label>
              <button
                className={showOnlyFilled ? "toolbar-button active" : "toolbar-button"}
                type="button"
                onClick={() => setShowOnlyFilled((value) => !value)}
                title="Toggle rows containing data"
              >
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M5.5 10h9M8 15h4" /></svg>
                <span>Filter rows</span>
              </button>
              <button className="toolbar-button add-rows-button" type="button" onClick={() => addRows(10)}>
                <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
                <span>Add 10 rows</span>
              </button>
            </div>
          </div>

          <div className="grid-shell" ref={gridRef}>
            <table className="spreadsheet" aria-label="Editable purchase data spreadsheet">
              <colgroup>
                <col className="row-index-column" />
                {COLUMNS.map((column) => <col key={column} className={`data-column data-column-${column.replace(/[^a-z]/gi, "-").toLowerCase()}`} />)}
              </colgroup>
              <thead>
                <tr>
                  <th className="corner-cell" scope="col" aria-label="Row number"><span className="corner-mark" /></th>
                  {COLUMNS.map((column, index) => (
                    <th className={selectedCell.row === -1 && selectedCell.column === index ? "column-header selected-header" : "column-header"} key={column} scope="col">
                      <button
                        className="header-button"
                        type="button"
                        onClick={() => {
                          setFilterColumn(filterColumn === column ? null : column);
                          setFilterText("");
                        }}
                        title={`Filter by ${column}`}
                      >
                        <span>{column}</span>
                        <span className={filterColumn === column ? "filter-control filter-active" : "filter-control"}><FilterIcon /></span>
                      </button>
                      {filterColumn === column && (
                        <div className="column-filter-popover">
                          <label>Filter {column}</label>
                          <input
                            autoFocus
                            placeholder="Contains…"
                            value={filterText}
                            onChange={(event) => setFilterText(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Escape") {
                                setFilterColumn(null);
                                setFilterText("");
                              }
                            }}
                          />
                          <button type="button" onClick={() => { setFilterColumn(null); setFilterText(""); }}>Done</button>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map(({ row, rowIndex }) => (
                  <tr key={rowIndex} className={rowIndex === selectedCell.row ? "data-row selected-row" : "data-row"}>
                    <th className="row-index" scope="row">{rowIndex + 1}</th>
                    {COLUMNS.map((column, columnIndex) => {
                      const isSelected = selectedCell.row === rowIndex && selectedCell.column === columnIndex;
                      return (
                        <td className={isSelected ? "data-cell selected-cell" : "data-cell"} key={column}>
                          <input
                            data-cell={`${rowIndex}-${columnIndex}`}
                            aria-label={`Row ${rowIndex + 1}, ${column}`}
                            value={row[column]}
                            onChange={(event) => updateCell(rowIndex, column, event.target.value)}
                            onFocus={() => setSelectedCell({ row: rowIndex, column: columnIndex })}
                            onKeyDown={(event) => handleCellKeyDown(event, rowIndex, columnIndex)}
                            spellCheck={false}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 18 - visibleRows.length) }, (_, index) => (
                  <tr className="empty-row" key={`empty-${index}`}>
                    <th className="row-index" scope="row">{rows.length + index + 1}</th>
                    {COLUMNS.map((column) => <td className="empty-cell" key={column} />)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="sheet-footer">
            <div className="footer-left">
              <span className="status-indicator" />
              <span>Ready to edit</span>
              <span className="footer-divider" />
              <span>Cell <strong>{selectedCell.row >= 0 ? `${selectedCell.row + 1} : ${COLUMNS[selectedCell.column] ?? COLUMNS[0]}` : "—"}</strong></span>
            </div>
            <div className="footer-right">
              <span>{visibleRows.length} of {rows.length} rows shown</span>
              <span className="footer-divider" />
              <button type="button" onClick={() => addRows(1)} className="footer-add">+ Add row</button>
            </div>
          </footer>
        </div>

        <div className="bottom-note">
          <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.25" /><path d="M10 9v4m0-7h.01" /></svg>
          <span>Changes are held in this browser session. Export CSV to save a copy of your sheet.</span>
          <span className="keyboard-hint"><kbd>Enter</kbd> next row <kbd>Tab</kbd> next column</span>
        </div>
      </section>
    </main>
  );
}
