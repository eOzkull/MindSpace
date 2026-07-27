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
  emptyState?: React.ReactNode;
  loading?: boolean;
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
  emptyState,
  loading = false,
}: DataTableProps<T>) {
  const isDefaultDatasetTable = id === 'dashboard-table';
  const finalTableClass = `${tableClass} ${isDefaultDatasetTable ? 'data-table-default' : ''}`.trim();

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <table id={id} className={finalTableClass}>
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
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                {selectable && <td style={{ textAlign: 'center' }}><div style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--input-bg)' }} /></td>}
                {showIndex && <td style={{ textAlign: 'center' }}>-</td>}
                {columns.map((col) => (
                  <td key={col.key}>
                    <div style={{ height: 16, borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', width: '70%' }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0) + (showIndex ? 1 : 0)} style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                {emptyState || 'No records found.'}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const selected = isRowSelected ? isRowSelected(row, rowIndex) : false;
              const selectedStyle: React.CSSProperties = selected ? {
                background: 'rgba(139, 92, 246, 0.08)',
                boxShadow: 'inset 3px 0 0 var(--brand-primary)',
              } : {};

              return (
                <tr
                  key={rowIndex}
                  style={{
                    cursor: (onRowClick || selectable) ? 'pointer' : 'default',
                    ...selectedStyle,
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
                        checked={selected}
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;

