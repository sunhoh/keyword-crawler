import { naverInstance } from '@/api/axios';

export type SerpItem = {
    rank: number;
    title: string;
    url: string;
    domain: string;
    snippet?: string;
  };
  
  export type SerpSnapshot = {
    keyword: string;
    engine: 'naver';
    source: 'blog' | 'web' | 'kin';
    fetchedAt: string;
    items: SerpItem[];
  };
  
  /** 공통 유틸 */
  function stripHtml(str: string) {
    return str.replace(/<[^>]+>/g, '');
  }
  
  function getDomain(url: string) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }
  
  /** 네이버 API 공통 호출 */
async function naverSearch(
  endpoint: 'blog' | 'webkr' | 'kin',
  keyword: string,
  display = 10,
) {
  try {
    const res = await naverInstance.get(`/${endpoint}.json`, {
      params: {
        query: keyword,
        display,
        sort: 'sim',
      },
    });

    return res.data;
  } catch (error: unknown) {
    throw new Error('Unexpected error while calling Naver API');
  }
}

  
  type NaverSearchResponse = {
    items: Array<{
      title?: string;
      link: string;
      description?: string;
    }>;
  };
  
  /** JSON → SerpItem[] 변환 */
  function toItems(json: NaverSearchResponse ): SerpItem[] {
    return (json.items ?? []).map((item, idx: number) => ({
      rank: idx + 1,
      title: stripHtml(item.title ?? ''),
      url: item.link,
      domain: getDomain(item.link),
      snippet: stripHtml(item.description ?? ''),
    }));
  }
  
  /** 블로그 검색 */
  export async function fetchNaverBlog(
    keyword: string,
  ): Promise<SerpSnapshot> {
    const json = await naverSearch('blog', keyword);
    return {
      keyword,
      engine: 'naver',
      source: 'blog',
      fetchedAt: new Date().toISOString(),
      items: toItems(json),
    };
  }
  
  /** 웹 검색 (병원/플랫폼) */
  export async function fetchNaverWeb(
    keyword: string,
  ): Promise<SerpSnapshot> {
    const json = await naverSearch('webkr', keyword);
    return {
      keyword,
      engine: 'naver',
      source: 'web',
      fetchedAt: new Date().toISOString(),
      items: toItems(json),
    };
  }
  
  /** 지식인 검색 (질문 패턴) */
  export async function fetchNaverKin(
    keyword: string,
  ): Promise<SerpSnapshot> {
    const json = await naverSearch('kin', keyword);
    return {
      keyword,
      engine: 'naver',
      source: 'kin',
      fetchedAt: new Date().toISOString(),
      items: toItems(json),
    };
  }
