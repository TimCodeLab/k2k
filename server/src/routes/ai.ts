import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { runAdvisor, offlineAdvice, AI_SYSTEM } from '../lib/ai';
import { uid } from '../lib/helpers';

const ai = new Hono<AppEnv>();

// POST /api/ai/diagnose — Feature 1: diagnose plant damage from a photo (+optional text).
// multipart: image (File), transcript_khmer?, crop_context?, user_id?
ai.post('/api/ai/diagnose', async (c) => {
  try {
    const form = await c.req.formData();
    const image = form.get('image') as unknown as File | null;
    const transcript = form.get('transcript_khmer')?.toString() ?? '';
    const crop_context = form.get('crop_context')?.toString();
    const user_id = form.get('user_id')?.toString();
    if (!image || typeof image.arrayBuffer !== 'function') return c.json({ error: 'no_image' }, 400);

    const bytes = new Uint8Array(await image.arrayBuffer());
    let image_url: string | null = null;
    if (c.env.BUCKET) {
      const key = `diagnose/${uid('d')}.jpg`;
      await c.env.BUCKET.put(key, bytes, { httpMetadata: { contentType: image.type || 'image/jpeg' } });
      image_url = `/media/${key}`;
    }

    let answer = '';
    let source = 'offline-fallback';
    if (c.env.AI) {
      try {
        const res: any = await c.env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
          messages: [
            { role: 'system', content: AI_SYSTEM },
            { role: 'user', content: `${crop_context ? `[Crop: ${crop_context}] ` : ''}${transcript || 'Diagnose the plant disease or pest damage in this photo and advise organic treatment in Khmer.'}` },
          ],
          image: [...bytes],
          max_tokens: 512,
        });
        answer = (res?.response ?? '').trim();
        if (answer) source = 'workers-ai-vision';
      } catch { /* fall through to offline */ }
    }
    if (!answer) answer = offlineAdvice(transcript || 'រូបភាពស្លឹក/ផ្លែ មានស្នាម', crop_context);

    if (user_id) {
      await c.env.DB.prepare(
        `INSERT INTO ai_advisory_logs (user_id, audio_url, transcript_khmer, ai_response_khmer, crop_context)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(user_id, image_url, transcript || '[image]', answer, crop_context ?? null).run().catch(() => {});
    }
    return c.json({ answer, source, image_url });
  } catch (e: any) {
    return c.json({ error: 'diagnose_failed', detail: String(e?.message ?? e) }, 500);
  }
});

// POST /api/ai/ask  { user_id, transcript_khmer, crop_context }
ai.post('/api/ai/ask', async (c) => {
  try {
    const { user_id, transcript_khmer, crop_context } = await c.req.json();
    if (!transcript_khmer) return c.json({ error: 'missing_transcript' }, 400);

    const { answer, source } = await runAdvisor(c.env, transcript_khmer, crop_context);

    if (user_id) {
      await c.env.DB.prepare(
        `INSERT INTO ai_advisory_logs (user_id, transcript_khmer, ai_response_khmer, crop_context)
         VALUES (?, ?, ?, ?)`
      ).bind(user_id, transcript_khmer, answer, crop_context ?? null).run().catch(() => {});
    }
    return c.json({ answer, source });
  } catch (e: any) {
    return c.json({ error: 'ai_failed', detail: String(e?.message ?? e) }, 500);
  }
});

// POST /api/ai/voice-advisor — accepts an audio file (multipart) or JSON transcript.
ai.post('/api/ai/voice-advisor', async (c) => {
  try {
    const ct = c.req.header('content-type') ?? '';
    let transcript = '';
    let user_id: string | undefined;
    let crop_context: string | undefined;
    let audio_url: string | null = null;

    if (ct.includes('multipart/form-data')) {
      const form = await c.req.formData();
      user_id = form.get('user_id')?.toString();
      crop_context = form.get('crop_context')?.toString();
      transcript = form.get('transcript_khmer')?.toString() ?? '';
      const audio = form.get('audio') as unknown as File | null;
      if (audio && typeof audio.arrayBuffer === 'function' && c.env.BUCKET) {
        const key = `audio/${uid('a')}.webm`;
        await c.env.BUCKET.put(key, await audio.arrayBuffer());
        audio_url = `/media/${key}`;
        if (!transcript && c.env.AI) {
          try {
            const stt: any = await c.env.AI.run('@cf/openai/whisper', {
              audio: [...new Uint8Array(await audio.arrayBuffer())],
            });
            transcript = stt?.text ?? '';
          } catch { /* keep transcript empty */ }
        }
      }
    } else {
      const body = await c.req.json();
      transcript = body.transcript_khmer ?? '';
      user_id = body.user_id;
      crop_context = body.crop_context;
    }

    if (!transcript) return c.json({ error: 'no_transcript', hint: 'Send transcript_khmer text or audio.' }, 400);

    const { answer, source } = await runAdvisor(c.env, transcript, crop_context);
    if (user_id) {
      await c.env.DB.prepare(
        `INSERT INTO ai_advisory_logs (user_id, audio_url, transcript_khmer, ai_response_khmer, crop_context)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(user_id, audio_url, transcript, answer, crop_context ?? null).run().catch(() => {});
    }
    return c.json({ transcript, answer, source, audio_url });
  } catch (e: any) {
    return c.json({ error: 'voice_advisor_failed', detail: String(e?.message ?? e) }, 500);
  }
});

export default ai;
