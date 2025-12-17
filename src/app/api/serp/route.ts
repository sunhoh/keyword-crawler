import { NextResponse } from 'next/server';
import { fetchNaverBlog, fetchNaverWeb, fetchNaverKin } from '@/libs/serp/naver';

type SerpRequest = {
  keyword: string;
  engine: 'google' | 'naver';
};

export async function POST(req: Request) {
  const body = (await req.json()) as SerpRequest;

  if (!body.keyword) {
    return NextResponse.json(
      { error: 'keyword is required' },
      { status: 400 },
    );
  }

  const engine = body.engine ?? 'naver';

  // 👉 MVP: 네이버면 blog/web/kin 3종을 한 번에 돌린다
  if (engine === 'naver') {
    try {
      const data = await naverPromise(body.keyword);
      return NextResponse.json(data);
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { error: 'Naver SERP fetch failed' },
        { status: 500 },
      );
    }
  }

  // 👉 Google은 다음 단계
  return NextResponse.json(
    { error: 'Google not implemented yet' },
    { status: 501 },
  );
}


export async function naverPromise(keyword: string) {
  const [blog, web, kin] = await Promise.all([
    fetchNaverBlog(keyword),
    fetchNaverWeb(keyword),
    fetchNaverKin(keyword),
  ]);

  return {
    keyword,
    engine: 'naver',
    fetchedAt: new Date().toISOString(),
    results: {
      blog,
      web,
      kin,
    },
  };
}