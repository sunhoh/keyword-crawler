import { ArrowRight } from 'lucide-react';

import { MainAsciiLoading } from '@/component/common/main-loading';
import { cn } from '@/libs/utils';

interface BaseHeadProps {
  value: string;
  setValue: (value: string) => void;
  activeTab: 'Scrape' | 'Search';
  setActiveTab: (tab: 'Scrape' | 'Search') => void;
  activePortalTab: 'G' | 'N';
  setActivePortalTab: (tab: 'G' | 'N') => void;
  loading: boolean;
  setErrorMsg: (msg: string | null) => void;
  onClickRun: () => void;
  errorMsg: string | null;
}

export default function BaseHead({
  value,
  setValue,
  activeTab,
  setActiveTab,
  activePortalTab,
  setActivePortalTab,
  loading,
  setErrorMsg,
  onClickRun,
  errorMsg,
}: BaseHeadProps) {
  const tabs = ['Scrape', 'Search'] as const;
  const portal = ['G', 'N'] as const;

  const handleTabChange = (tab: 'Scrape' | 'Search') => {
    setActiveTab(tab);
    setErrorMsg(null);
  };

  return (
    <>
      <MainAsciiLoading />
      <div className='flex w-full flex-col items-center gap-4 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white py-4 shadow-md'>
        {/* URL Input Section */}
        <div className='relative flex w-full items-center gap-2 border-b border-gray-300 px-6 py-3'>
          <div
            className={cn(
              'absolute top-1/2 left-6 -translate-y-1/2 transition-all duration-300 ease-out',
              activeTab !== 'Search'
                ? 'translate-x-0 opacity-100'
                : '-translate-x-full opacity-0',
            )}
          >
            <div className='flex items-center rounded-md border border-[#e5e7eb] px-2 py-1 text-xs font-medium text-green-700'>
              https://
            </div>
          </div>

          <input
            type='text'
            value={value}
            onChange={e => {
              const inputValue = e.target.value;
              const cleanValue = inputValue.replace(/^https?:\/\//, '');
              setValue(cleanValue);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                activePortalTab === 'G' ? alert('준비중입니다.') : onClickRun();
              }
            }}
            placeholder={
              activeTab !== 'Search' ? 'example.com' : 'Please enter a keyword'
            }
            className={cn(
              'flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 transition-all duration-300 ease-out outline-none',
              activeTab !== 'Search' ? 'ml-16' : 'ml-0',
            )}
          />

          {/* Portal Selector (only visible in Search mode) */}
          <div className='flex h-12 items-center'>
            {activeTab === 'Search' && (
              <div className='relative flex items-center rounded-2xl bg-gray-100 p-1'>
                <span
                  className='absolute top-1 bottom-1 rounded-xl bg-white shadow transition-all duration-300 ease-out'
                  style={{
                    width: '40px',
                    transform: `translateX(${portal.indexOf(activePortalTab) * 40}px)`,
                  }}
                />
                {portal.map(tab => (
                  <button
                    key={tab}
                    type='button'
                    onClick={() => setActivePortalTab(tab)}
                    className={cn(
                      'relative z-10 w-10 cursor-pointer px-3 py-2 text-sm text-gray-400 transition-colors duration-300',
                      activePortalTab === tab &&
                        (tab === 'G' ? 'text-blue-500' : 'text-green-500'),
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation and Action Button */}
        <div className='flex w-full items-center justify-between gap-4 px-6'>
          {/* Mode Tabs */}
          <div className='relative flex items-center rounded-2xl bg-gray-100 px-1 py-1'>
            <span
              className='absolute top-1 bottom-1 rounded-2xl bg-white shadow transition-all duration-300 ease-out'
              style={{
                width: '96px',
                transform: `translateX(${tabs.indexOf(activeTab) * 96}px)`,
              }}
            />
            {tabs.map(tab => (
              <button
                key={tab}
                type='button'
                onClick={() => handleTabChange(tab)}
                className={cn(
                  'relative z-10 w-24 cursor-pointer px-4 py-2 text-sm transition-colors duration-300',
                  activeTab === tab
                    ? 'font-bold text-gray-900'
                    : 'text-gray-400 hover:text-gray-700',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Execute Button */}
          <button
            type='button'
            onClick={() => {
              activePortalTab === 'G' ? alert('준비중입니다.') : onClickRun();
            }}
            disabled={loading}
            className={cn(
              'flex h-12 w-20 cursor-pointer items-center justify-center rounded-2xl transition-all duration-200',
              loading
                ? 'bg-gray-400'
                : 'bg-black hover:bg-gray-800 active:scale-95',
            )}
          >
            <ArrowRight
              className={cn('h-5 w-5 text-white', loading && 'animate-pulse')}
            />
          </button>
        </div>
      </div>
      {errorMsg && (
        <p className='mt-4 text-center text-sm text-red-500'>{errorMsg}</p>
      )}
    </>
  );
}
