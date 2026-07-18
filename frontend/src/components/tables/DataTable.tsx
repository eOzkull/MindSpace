import React from 'react';

export interface DataTableColumn<T = any> {
  key: string;
  header: string;
  width?: string;
  style?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  id?: string;
  showIndex?: boolean;
  indexHeader?: string;
  startIndex?: number;
  tableClass?: string;
  wrapperClass?: string;
  rowStyle?: (row: T, index: number) => React.CSSProperties;
  onRowClick?: (row: T, index: number) => void;
  theadStyle?: React.CSSProperties;
  tbodyStyle?: React.CSSProperties;
  wrapperStyle?: React.CSSProperties;
  selectable?: boolean;
  isRowSelected?: (row: T, index: number) => boolean;
  onRowSelectToggle?: (row: T, index: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  id,
  showIndex = false,
  indexHeader = '#',
  startIndex = 1,
  tableClass = '',
  wrapperClass = 'table-wrapper',
  rowStyle,
  onRowClick,
  theadStyle,
  tbodyStyle,
  wrapperStyle,
  selectable = false,
  isRowSelected,
  onRowSelectToggle,
}: DataTableProps<T>) {
  return (
    <div className={wrapperClass} style={{ border: 'none', borderRadius: 0, ...wrapperStyle }}>
      <table id={id} className={tableClass}>
        <thead style={theadStyle}>
          <tr>
            {selectable && <th style={{ width: '40px', textAlign: 'center' }} />}
            {showIndex && <th style={{ width: '50px' }}>{indexHeader}</th>}
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, ...col.headerStyle, ...col.style }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={tbodyStyle}>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                cursor: (onRowClick || selectable) ? 'pointer' : 'default',
                ...(rowStyle ? rowStyle(row, rowIndex) : {}),
              }}
              onClick={() => {
                if (onRowClick) {
                  onRowClick(row, rowIndex);
                } else if (selectable && onRowSelectToggle) {
                  onRowSelectToggle(row, rowIndex);
                }
              }}
            >
              {selectable && (
                <td style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isRowSelected ? isRowSelected(row, rowIndex) : false}
                    onChange={() => onRowSelectToggle?.(row, rowIndex)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              {showIndex && (
                <td className="row-num" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  {startIndex + rowIndex}
                </td>
              )}
              {columns.map((col) => {
                const val = (row as any)[col.key];
                return (
                  <td key={col.key} style={{ ...col.cellStyle, ...col.style }}>
                    {col.render ? col.render(val, row, rowIndex) : val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
