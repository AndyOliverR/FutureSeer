/**
 * Resend Inbound Webhook
 * Receives emails sent to support@futureseer.app (or your configured inbound address).
 * - Verifies webhook signature (RESEND_WEBHOOK_SECRET)
 * - Stores inbound email in Firestore (inbound_emails)
 * - Optionally forwards a copy to SUPPORT_FORWARD_EMAIL so you get it in your inbox
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { devLog } from '@/lib/devLogger';
import { adminDb } from '@/lib/firebase-admin';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'notifications@futureseer.app';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      devLog.warn('RESEND_WEBHOOK_SECRET not set; skipping inbound webhook verification', 'resend-inbound');
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');
    if (!svixId || !svixTimestamp || !svixSignature) {
      devLog.warn('Resend webhook missing svix headers', 'resend-inbound');
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 });
    }

    let payload: { type: string; created_at?: string; data?: Record<string, unknown> };
    try {
      payload = resend.webhooks.verify({
        payload: rawBody,
        headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
        webhookSecret,
      }) as unknown as { type: string; created_at?: string; data?: Record<string, unknown> };
    } catch (err) {
      devLog.error('Resend webhook signature verification failed', err, 'resend-inbound');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (payload.type !== 'email.received' || !payload.data) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const data = payload.data as {
      email_id: string;
      from: string;
      to: string[];
      subject: string;
      created_at?: string;
    };

    let bodyText = '';
    let bodyHtml: string | null = null;
    if (process.env.RESEND_API_KEY && data.email_id) {
      try {
        const rec = await resend.emails.receiving.get(data.email_id);
        if (rec?.data && typeof rec.data === 'object') {
          const d = rec.data as { text?: string | null; html?: string | null };
          bodyText = d.text ?? '';
          bodyHtml = d.html ?? null;
        }
      } catch {
        // Leave body empty if we can't fetch (e.g. receiving API not enabled)
      }
    }

    const doc = {
      from: data.from,
      to: data.to || [],
      subject: data.subject || '',
      bodyText: bodyText.slice(0, 100000),
      bodyHtml: bodyHtml != null ? bodyHtml.slice(0, 200000) : null,
      emailId: data.email_id,
      receivedAt: new Date(),
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    };

    if (adminDb) {
      await adminDb.collection('inbound_emails').add(doc);
    }

    const forwardTo = process.env.SUPPORT_FORWARD_EMAIL?.trim();
    if (forwardTo && process.env.RESEND_API_KEY) {
      const subject = `[FutureSeer Support] ${data.subject}`;
      const html = `
        <p>An email was sent to support@futureseer.app:</p>
        <p><strong>From:</strong> ${data.from}</p>
        <p><strong>To:</strong> ${(data.to || []).join(', ')}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <hr/>
        ${bodyHtml ? `<div>${bodyHtml}</div>` : `<pre>${bodyText || '(no body)'}</pre>`}
      `;
      try {
        await resend.emails.send({
          from: fromEmail,
          to: [forwardTo],
          subject,
          html,
        });
      } catch (err) {
        devLog.error('Failed to forward support email', err, 'resend-inbound');
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    devLog.error('Resend inbound webhook error', err, 'resend-inbound');
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
