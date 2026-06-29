import type { Env } from '../types';

export const AI_SYSTEM = `You are an expert agronomist in Cambodia. Answer clearly using simple, conversational Khmer. Provide natural solutions, organic pest control methods readily available in Cambodian provinces, and advise on watering or fertilizer adjustments based on common Cambodian crop seasonal calendars. Keep answers practical and under 180 words.`;

// Heuristic Khmer fallback when Workers AI binding is unavailable (e.g. local dev).
export function offlineAdvice(text: string, crop?: string): string {
  const t = (text || '').toLowerCase();
  const parts: string[] = ['🌱 ការណែនាំពីគ្រូពេទ្យដំណាំ៖'];
  if (/(worm|ដង្កូវ|សត្វល្អិត|pest|insect|spot|ស្លែ|ស្នាម)/.test(t)) {
    parts.push('• សាកល្បងបាញ់ទឹកស្លឹកស្ដៅ ឬទឹកម្ទេស+ខ្ទឹមស នៅពេលល្ងាច ដើម្បីបណ្ដេញសត្វល្អិតតាមធម្មជាតិ។');
    parts.push('• បេះស្លឹក ឬផ្នែកដែលឆ្លងរោគចេញ កុំទុកឱ្យរាលដាល។');
  }
  if (/(water|ទឹក|dry|ស្ងួត|រាំងស្ងួត)/.test(t)) {
    parts.push('• ស្រោចទឹកនៅពេលព្រឹក ឬល្ងាច កុំស្រោចពេលថ្ងៃក្ដៅ ដើម្បីកាត់បន្ថយការហួតទឹក។');
  }
  if (/(fertil|ជី|yellow|លឿង|growth)/.test(t)) {
    parts.push('• ប្រើជីកំប៉ុស ឬលាមកសត្វផុំ ដើម្បីបន្ថែមសារធាតុចិញ្ចឹមឱ្យដី។');
  }
  if (parts.length === 1) {
    parts.push('• សូមពិពណ៌នាបញ្ហាបន្ថែម (ប្រភេទដំណាំ ស្លឹក/ផ្លែ និងរោគសញ្ញា) ដើម្បីឱ្យខ្ញុំជួយបានច្បាស់។');
  }
  parts.push('• ត្រួតពិនិត្យចម្ការរៀងរាល់ ៣ ថ្ងៃម្ដង ដើម្បីរកឃើញបញ្ហាទាន់ពេល។');
  if (crop) parts.push(`(បរិបទដំណាំ៖ ${crop})`);
  return parts.join('\n');
}

export async function runAdvisor(env: Env, transcript: string, crop_context?: string): Promise<{ answer: string; source: string }> {
  try {
    if (!env.AI) throw new Error('no_ai_binding');
    const res: any = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: AI_SYSTEM },
        { role: 'user', content: `${crop_context ? `[Crop: ${crop_context}] ` : ''}${transcript}` },
      ],
      max_tokens: 512,
    });
    const answer = (res?.response ?? '').trim();
    if (!answer) throw new Error('empty_ai_response');
    return { answer, source: 'workers-ai' };
  } catch {
    return { answer: offlineAdvice(transcript, crop_context), source: 'offline-fallback' };
  }
}
