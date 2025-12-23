import React from 'react';

import { cn } from '@/libs/utils';
import { TableColumn } from '@/types/table.type';

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  emptyMessage?: string;
  highlightCondition?: (row: T) => boolean;
  highlightClassName?: string;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  expandableRows?: boolean;
  expandedRows?: Set<string | number>;
  onToggleRow?: (rowId: string | number) => void;
  renderExpandedContent?: (row: T, index: number) => React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  emptyMessage = 'No data found.',
  highlightCondition,
  highlightClassName = 'animate-rainbow-glow relative z-10 !border-transparent transition-all duration-500 font-bold bg-white',
  className,
  onRowClick,
  expandableRows = false,
  expandedRows = new Set(),
  onToggleRow,
  renderExpandedContent,
}: DataTableProps<T>) {
  const renderCell = (
    column: TableColumn<T>,
    value: unknown,
    row: T,
  ): React.ReactNode => {
    const safeValue = value ?? '';

    switch (column.key) {
      case 'rank':
        return (
          <div className='flex items-center gap-2'>
            <span className='font-medium text-zinc-600'>
              {safeValue as string}
            </span>
            {/* {'isAd' in row && row.isAd && (
              <span className='rounded bg-gray-200 px-1 text-[10px] text-gray-600'>
                AD
              </span>
            )} */}
          </div>
        );

      case 'reviewCount':
        return (
          <span>
            {typeof safeValue === 'number'
              ? (safeValue as number).toLocaleString()
              : String(safeValue)}
          </span>
        );

      case 'category':
        return (
          <span>
            {Array.isArray(safeValue)
              ? (safeValue as string[]).join(', ')
              : String(safeValue)}
          </span>
        );

      case 'pcMapUrl':
        return (
          <a
            href={String(safeValue)}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-block rounded bg-zinc-800 px-2 py-1 text-white transition hover:bg-black'
          >
            Map
          </a>
        );

      default:
        return <span>{String(safeValue || '')}</span>;
    }
  };

  return (
    <div
      className={cn(
        'w-full overflow-visible border border-[#e5e7eb] bg-white',
        className,
      )}
    >
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-sm'>
          <thead className='bg-zinc-100 text-zinc-700'>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={String(column.key) || index}
                  className={cn('text-left font-semibold', column.width)}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => {
                const rowId =
                  'id' in row ? (row.id as string | number) : rowIndex;
                const isExpanded = expandableRows && expandedRows.has(rowId);

                return (
                  <React.Fragment
                    key={'id' in row ? String(row.id) : String(rowIndex)}
                  >
                    <tr
                      className={cn(
                        'cursor-pointer border-t border-zinc-200 transition hover:bg-zinc-50',
                        'isAd' in row && Boolean(row.isAd)
                          ? 'bg-amber-50/50'
                          : '',
                        highlightCondition?.(row) && highlightClassName,
                      )}
                      onClick={() => {
                        if (expandableRows && onToggleRow) {
                          onToggleRow(rowId);
                        } else {
                          onRowClick?.(row, rowIndex);
                        }
                      }}
                    >
                      {columns.map((column, colIndex) => {
                        const value = row[column.key as keyof T];
                        const renderedValue = renderCell(column, value, row);

                        return (
                          <td
                            key={String(column.key) || colIndex}
                            className={cn(column.width, column.className)}
                          >
                            {renderedValue}
                          </td>
                        );
                      })}
                    </tr>
                    {/* json */}
                    <tr key={`expanded-${rowId}`}>
                      <td colSpan={columns.length}>
                        <div
                          className={cn(
                            'w-full overflow-hidden transition-all duration-300 ease-in-out',
                            isExpanded
                              ? 'max-h-120 opacity-100'
                              : 'max-h-0 opacity-0',
                          )}
                        >
                          <div className='w-190 p-4'>
                            {renderExpandedContent &&
                              renderExpandedContent(row, rowIndex)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-4 py-10 text-center text-gray-400'
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
