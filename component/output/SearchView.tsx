'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { fetchScrapeData } from '@/api/query';
import { DataTable } from '@/component/common/data-table';
import { JsonView } from '@/component/output/JsonView';
import { DOMAIN } from '@/configs';
import { HOSPITAL_COLUMNS } from '@/constants/search.constants';
import { cn } from '@/libs/utils';
import { Metadata } from '@/types/global';
import { SearchRankData } from '@/types/table.type';

interface SearchApiResponse {
  success: boolean;
  data: SearchRankData[];
  keyword: string;
}

export function SearchView({ data }: { data: SearchApiResponse }) {
  const searchResults = data?.data || [];

  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(
    new Set(),
  );
  const [scrapeDataMap, setScrapeDataMap] = useState<
    Map<string | number, Metadata>
  >(new Map());
  const [loadingRows, setLoadingRows] = useState<Set<string | number>>(
    new Set(),
  );

  const target = () => {
    return searchResults.find(item => {
      const itemName = String(item.name || '').replace(/\s/g, '');

      return Object.values(DOMAIN).some(domainValue =>
        itemName.includes(domainValue.replace(/\s/g, '')),
      );
    });
  };

  const handleToggleRow = async (rowId: string | number) => {
    const newExpandedRows = new Set(expandedRows);

    if (expandedRows.has(rowId)) {
      // 접기
      newExpandedRows.delete(rowId);
      setExpandedRows(newExpandedRows);
    } else {
      // 펼치기 - 데이터가 없으면 스크래핑
      newExpandedRows.add(rowId);
      setExpandedRows(newExpandedRows);

      if (!scrapeDataMap.has(rowId)) {
        const row = searchResults.find(
          (r, idx) => ('id' in r ? r.id : idx) === rowId,
        );
        if (row?.pcMapUrl) {
          setLoadingRows(prev => new Set(prev).add(rowId));
          try {
            const scrapeResult = await fetchScrapeData(row.pcMapUrl);
            setScrapeDataMap(prev => new Map(prev).set(rowId, scrapeResult));
          } catch (error) {
            console.error('Scrape failed:', error);
          } finally {
            setLoadingRows(prev => {
              const newSet = new Set(prev);
              newSet.delete(rowId);
              return newSet;
            });
          }
        }
      }
    }
  };

  const renderExpandedContent = (row: SearchRankData, index: number) => {
    const rowId = 'id' in row ? row.id : index;
    const scrapeData = scrapeDataMap.get(rowId);
    const isLoading = loadingRows.has(rowId);

    return (
      <div>
        {isLoading ? (
          <div className='flex w-full flex-col items-center justify-center py-10'>
            <Loader2 className='h-6 w-6 animate-spin text-blue-500' />
          </div>
        ) : scrapeData ? (
          <JsonView
            data={scrapeData}
            value={scrapeData.metadata.title || row.name || '스크래핑 결과'}
          />
        ) : (
          <div className='py-4 text-center'>
            <AlertCircle className='h-6 w-6' />
            <p className='text-red-500'>스크래핑 실패</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='flex flex-col gap-6'>
      {searchResults && (
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-[1.5rem] font-bold text-[#04c95b]'>NAVER</h1>
            <div className='flex w-full items-center gap-4 text-gray-500'>
              <p>
                Keyword:
                <span className='font-medium'>{data?.keyword}</span>
              </p>
            </div>
          </div>
          {target() && (
            <div className='font-bold'>
              {target()?.name} {target()?.rank}위
            </div>
          )}
        </div>
      )}

      <DataTable
        data={searchResults}
        columns={HOSPITAL_COLUMNS}
        highlightCondition={row => {
          const rowName = String(row.name || '').replace(/\s/g, '');
          return Object.values(DOMAIN).some(domainValue =>
            rowName.includes(domainValue.replace(/\s/g, '')),
          );
        }}
        emptyMessage='No search results found.'
        expandableRows={true}
        expandedRows={expandedRows}
        onToggleRow={handleToggleRow}
        renderExpandedContent={renderExpandedContent}
      />
    </div>
  );
}
