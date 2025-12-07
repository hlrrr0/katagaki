import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRight, getTitleById, updateTitle } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // イベントタイプに応じた処理
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { titleId, userId } = session.metadata || {};

  if (!titleId || !userId) {
    console.error('Missing metadata in session:', session.id);
    return;
  }

  try {
    // 肩書き情報を取得
    const title = await getTitleById(titleId);
    if (!title) {
      console.error('Title not found:', titleId);
      return;
    }

    // 有効期限を1年後に設定
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    // Rightを作成
    await createRight({
      user_id: userId,
      title_id: titleId,
      start_date: Timestamp.fromDate(startDate),
      end_date: Timestamp.fromDate(endDate),
      is_active: true,
      stripe_subscription_id: session.id,
    });

    // 購入数を更新
    await updateTitle(titleId, {
      purchased_count: title.purchased_count + 1,
      // 購入可能枠に達したら売り切れに
      status: title.purchased_count + 1 >= title.purchasable_limit ? 'sold_out' : title.status,
    });

    console.log('Successfully created right for user:', userId, 'title:', titleId);
  } catch (error) {
    console.error('Error handling checkout session:', error);
    throw error;
  }
}
