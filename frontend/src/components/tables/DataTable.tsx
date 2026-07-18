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
}: DataTableProps<T>) {
  return (
    <div className={wrapperClass} style={{ border: 'none', borderRadius: 0, ...wrapperStyle }}>
      <table id={id} className={tableClass}>
        <thead style={theadStyle}>
          <tr>
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
              style={rowStyle ? rowStyle(row, rowIndex) : undefined}
              onClick={() => onRowClick?.(row, rowIndex)}
            >
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
