import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getStrapiBaseUrl } from '@/lib/strapi';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const width = searchParams.get('w');
  const quality = parseInt(searchParams.get('q') || '80', 10);
  
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // If it's a relative URL, prepend Strapi URL
    let fetchUrl = url;
    if (url.startsWith('/')) {
      fetchUrl = `${getStrapiBaseUrl()}${url}`;
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    
    let sharpInstance = sharp(Buffer.from(buffer));
    
    if (width) {
       sharpInstance = sharpInstance.resize({ width: parseInt(width) });
    }

    // Convert to webp
    const optimizedBuffer = await sharpInstance
      .webp({ quality })
      .toBuffer();

    return new NextResponse(new Uint8Array(optimizedBuffer), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
