import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, engine, limit = 30 } = body;

    if (!keyword || !engine) {
      return NextResponse.json(
        { error: 'keyword and engine are required in request body' },
        { status: 400 },
      );
    }

    switch (engine) {
      case 'naver':
        return await handleNaverMap(keyword, limit);
      default:
        return NextResponse.json(
          { error: 'unsupported engine' },
          { status: 400 },
        );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleNaverMap(keyword: string, limit: number) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // 2. 검색 데이터 저장용 변수
    let searchData: Record<string, unknown>[] = [];

    // [중요] page.goto 이전에 리스너를 먼저 등록해야 첫 응답을 안 놓칩니다.
    page.on('response', async response => {
      const url = response.url();
      // 네이버 통합검색 API 주소 패턴 확인
      if (url.includes('api/search/allSearch')) {
        try {
          const json = await response.json();
          // 데이터 구조에 맞춰 추출 (네이버 API 구조는 깊으므로 안전하게 접근)
          const list = json?.result?.place?.list || json?.result?.site?.list;
          if (list && list.length > 0) {
            searchData = list;
          }
        } catch {
          // JSON 파싱 에러 무시
        }
      }
    });

    // 3. URL 생성 시 keyword가 순수한 검색어인지 확인 필요
    // 만약 전달받은 keyword에 http가 포함되어 있다면 단어만 추출하는 로직이 필요함
    const cleanKeyword = keyword.includes('http')
      ? decodeURIComponent(keyword).split('search/')[1]?.split('?')[0]
      : keyword;

    const targetUrl = `https://map.naver.com/p/search/${encodeURIComponent(cleanKeyword || keyword)}`;
    console.log('targetUrltargetUrl', targetUrl);

    // 4. 페이지 이동 및 대기
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // 5. 만약 API 응답을 못 잡았다면, 강제로 화면 리스트를 다시 불러오기 위해 스크롤 수행
    if (searchData.length === 0) {
      // iframe 내부 요소를 건드려 API 호출을 유도
      const frameHandle = await page.waitForSelector('#searchIframe', {
        timeout: 10000,
      });
      const frame = await frameHandle.contentFrame();
      if (frame) {
        // 강제 스크롤을 위해 페이지 하단으로 스크롤
        await frame.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(2000); // API 응답 대기
      }
    }

    if (searchData.length === 0) {
      throw new Error('API 데이터를 가로채지 못했습니다. 검색어를 확인하세요.');
    }

    // 6. 결과 가공 (순위 분석 척도 포함)
    const result = searchData.slice(0, limit).map(item => ({
      rank: item.rank,
      id: item.id,
      name: item.name,
      isAd: !!item.isAd,
      category: item.category,
      reviewCount: item.reviewCount,
      blogReviewCount: item.blogReviewCount,
      rating: item.starPoint,
      address: item.address,
      pcMapUrl: `https://pcmap.place.naver.com/hospital/${item.id}/home`,
    }));

    await browser.close();
    return NextResponse.json({ success: true, data: result, keyword });
  } catch (error) {
    if (browser) await browser.close();
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
