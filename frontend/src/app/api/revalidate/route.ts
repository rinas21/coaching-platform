import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    // Validate the revalidation secret
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    const body = await req.json();

    // Strapi webhook payload: event + model
    const model = body.model as string;

    if (!model) {
      return NextResponse.json({ message: 'No model in payload' }, { status: 400 });
    }

    if (model === 'blog-post') {
      revalidatePath('/blog');
      revalidatePath('/blog/[slug]', 'page');
    } else if (model === 'event') {
      revalidatePath('/events');
      revalidatePath('/events/[id]', 'page');
    } else if (model === 'service') {
      revalidatePath('/services');
    } else if (model === 'team-member') {
      revalidatePath('/team');
    } else if (model === 'testimonial') {
      revalidatePath('/testimonials');
    } else if (model === 'item-sale') {
      revalidatePath('/store');
    } else {
      // Revalidate everything for unknown models
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({ revalidated: true, model, now: Date.now() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ message: 'Error revalidating', error: message }, { status: 500 });
  }
}
