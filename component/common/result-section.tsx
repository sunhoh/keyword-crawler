import { AsciiLoading } from '@/component/common/loading';
import { JsonView } from '@/component/output/JsonView';
import { SearchView } from '@/component/output/SearchView';
import { Metadata } from '@/types/global';
import { SearchRankData } from '@/types/table.type';

interface SearchApiResponse {
  success: boolean;
  data: SearchRankData[];
  keyword: string;
}

interface ResultSectionProps {
  activeTab: 'Scrape' | 'Search';
  data:
    | SearchApiResponse
    | (Metadata & { requestUrl: string; scrapeId?: string })[]
    | undefined;
  loading: boolean;
}

export function ResultSection({
  activeTab,
  data,
  loading,
}: ResultSectionProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'Search': {
        const searchData = data as SearchApiResponse;
        if (!searchData?.data || searchData?.data.length === 0) {
          return null;
        }
        return <SearchView data={searchData} />;
      }

      case 'Scrape':
        return (
          data as (Metadata & { requestUrl: string; scrapeId?: string })[]
        ).map((item, index) => (
          <JsonView
            key={item.scrapeId || `scrape-${index}`}
            data={item}
            value={item.requestUrl}
          />
        ));

      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className='mt-8'>
        <AsciiLoading />
      </div>
    );

  return <div className='mt-8 flex w-full flex-col'>{renderContent()}</div>;
}
