'use client';

import { Globe, ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/libs/utils';

type Engine = 'google' | 'naver';

type SerpRequest = {
  keyword: string;
  engine: Engine;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'Scrape' | 'Search'>('Scrape');
  const [activePortalTab, setActivePortalTab] = useState<'G' | 'N'>('G');
  const [value, setValue] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultJson, setResultJson] = useState<string>('');

  const tabs = ['Scrape', 'Search'] as const;
  const portal = ['G', 'N'] as const;

  const engine: Engine = useMemo(
    () => (activePortalTab === 'N' ? 'naver' : 'google'),
    [activePortalTab],
  );
  console.log('engineengineengine',engine)

  const placeholder = useMemo(
    () => (activeTab === 'Scrape' ? 'keyword' : 'https://example.com'),
    [activeTab],
  );

  async function onClickRun() {
    setErrorMsg(null);
    setResultJson('');

    const trimmed = value.trim();
    if (!trimmed) {
      setErrorMsg(activeTab === 'Scrape' ? 'keyword를 입력하세요.' : 'URL을 입력하세요.');
      return;
    }

    // MVP: Search 탭만 SERP 호출
    if (activeTab !== 'Scrape') {
      setErrorMsg('Scrape는 다음 단계에서 붙입니다. (현재는 Search만 동작)');
      return;
    }

    setLoading(true);
    try {
      const payload: SerpRequest = {
        keyword: trimmed,
        engine,
      };

      const res = await fetch('/api/serp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        // API가 {error: "..."} 형태로 주는 걸 가정
        const msg =
          typeof data === 'object' && data !== null && 'error' in data
            ? String((data as { error: unknown }).error)
            : `Request failed: ${res.status}`;
        setErrorMsg(msg);
        return;
      }

      setResultJson(JSON.stringify(data, null, 2));
    } catch (e: unknown) {
      setErrorMsg('네트워크 또는 서버 오류가 발생했습니다.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-between py-32 px-16 border border-gray-300 sm:items-start">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col w-full items-center gap-4 rounded-2xl bg-white shadow-md py-4 border-gray-300 border">
            {/* INPUT - FULL WIDTH */}
            <div className="flex w-full items-center gap-2 py-3 border-gray-300 border-b px-6">
              <Globe className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />

              <div className='h-12'>
                {activeTab === 'Scrape' && 
                  <div className="relative flex items-center bg-gray-100 rounded-2xl p-1">
                    {/* ACTIVE INDICATOR */}
                    <span
                      className="absolute top-1 bottom-1 rounded-xl bg-white shadow transition-all duration-300 ease-out"
                      style={{
                        width: '40px',
                        transform: `translateX(${portal.indexOf(activePortalTab) * 40}px)`,
                      }}
                    />

                    {portal.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActivePortalTab(tab)}
                        className={cn(
                          'relative z-10 w-10 px-3 py-2 text-sm transition-colors duration-300 text-gray-400 cursor-pointer',
                          activePortalTab === tab && {
                            'text-blue-500 hover:text-blue-800': tab === 'G',
                            'text-green-500 hover:text-green-500': tab === 'N',
                          },
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                }
              </div>
              
            </div>

            <div className="flex gap-4 items-center justify-between w-full px-6">
              {/* TAB GROUP */}
              <div className="relative flex items-center bg-gray-100 rounded-2xl px-1 py-1">
                {/* ACTIVE INDICATOR */}
                <span
                  className="absolute top-1 bottom-1 rounded-2xl bg-white shadow transition-all duration-300 ease-out"
                  style={{
                    width: '96px',
                    transform: `translateX(${tabs.indexOf(activeTab) * 96}px)`,
                  }}
                />

                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative z-10 w-24 px-4 py-2 text-sm transition-colors duration-300 cursor-pointer ${
                      activeTab === tab
                        ? 'text-gray-900'
                        : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* ACTION BUTTON */}
              <button
                type="button"
                onClick={onClickRun}
                disabled={loading}
                className={cn(
                  'flex items-center justify-center w-20 h-12 rounded-2xl transition-colors duration-200 cursor-pointer',
                  loading ? 'bg-orange-300' : 'bg-orange-500 hover:bg-orange-600',
                )}
                title={activeTab === 'Search' ? 'Search 실행' : 'Scrape 실행'}
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* DEBUG OUTPUT (MVP) */}
            <div className="w-full px-6 pb-4">
              {errorMsg && (
                <div className="mt-3 text-sm text-red-600 whitespace-pre-wrap">
                  {errorMsg}
                </div>
              )}

              {resultJson && (
                <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-zinc-950 text-zinc-100 p-4 text-xs">
                  {resultJson}
                </pre>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
