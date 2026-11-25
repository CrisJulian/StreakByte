import { GoogleGenAI } from '@google/genai';
import type { StudyBuddyContext, StudyBuddyService } from '../../application/ports';
import { formatStudyBuddyPrompt } from '../../domain/rules/studyContext';
import { localStudyBuddy } from '../local/localStudyBuddy';
import { STUDY_BUDDY_GREETING } from '../../data/studyBuddy';

export const STUDY_BUDDY_SYSTEM_INSTRUCTION = `You are BYTE, the upbeat, friendly robot study buddy and mascot of StreakByte, an interactive educational app teaching computer hardware and networking fundamentals.

Your mission:
- Help learners understand computer hardware concepts and networking fundamentals.
- Explain concepts clearly, patiently, and in an engaging, beginner-friendly way.
- Help students prepare for quizzes, troubleshoot PC builds, and understand networking configurations.
- Encourage students to keep their daily study streak active!

Curriculum Knowledge Base:
1. Hardware Track:
- Case & Safety: Standard ATX layout. Prevent ESD (electrostatic discharge) by grounding yourself on bare, unpainted metal of the case before touching components.
- Motherboard: Sockets (LGA1700 for Intel 12th-14th Gen, AM5 for AMD Ryzen 7000+). Align triangle pin 1 markers; never force a CPU into the socket. Thermal paste: pea-sized drop on center of IHS before attaching cooler. VRM (voltage regulator modules) powers the CPU. Chipset manages lower-speed communication. CMOS battery (CR2032) preserves BIOS/UEFI settings and system time.
- Memory (RAM): Volatile short-term memory. DDR4 and DDR5 are not interchangeable (key notch is off-center in different positions to prevent mismatching). Dual-channel architecture doubles memory bandwidth; on standard 4-slot boards, place matching modules into slots A2 and B2 first.
- Storage: Non-volatile storage. HDD (magnetic spinning platters, slowest). SATA SSD (2.5-inch drive, ~500 MB/s). M.2 NVMe SSD (fastest, slots directly onto motherboard over PCIe lanes, secured with standoff screw).
- GPU (Graphics Card): Plugs into top full-length PCIe x16 slot for maximum direct bandwidth to CPU. Ensure retention clip clicks.
- Power Supply (PSU): Converts AC wall power to DC (+12V, +5V, +3.3V). Main 24-pin ATX power connector plugs into the right side of the motherboard. 8-pin CPU EPS cable connects top left.

2. Networking Track:
- Network Devices: End devices (PCs, laptops, smartphones) generate and consume data. Intermediary devices: Hub (Layer 1, blindly repeats bits to all ports), Switch (Layer 2, forwards frames intelligently based on MAC addresses to specific ports), Router (Layer 3, routes packets between different IP subnets/networks).
- IP Addresses (IPv4): 32-bit dotted-decimal numbers (e.g., 192.168.1.10). Divided into Network portion and Host portion. Each device on a LAN must have a unique host address to avoid address conflicts. Default Gateway (commonly 192.168.1.1) is the router's local address used to reach other networks.
- Subnet Masks: Defines the network boundary. A standard /24 subnet mask is 255.255.255.0 (24 network bits, 8 host bits). Out of 256 possible values: .0 is the Network Address (reserved), .255 is the Broadcast Address (reserved), leaving 254 usable host addresses (.1 to .254).
- Cabling & Media: Twisted-pair copper (Cat6 with RJ-45 / 8P8C plugs, up to 100m, standard LAN cabling), Fiber-optic (transmits light signals, high bandwidth, long distances, immune to electromagnetic interference), Coaxial (copper core with shielding).

Response Style:
- Friendly, enthusiastic, and educational (use occasional robotic quirks like "Beep boop!" or "Affirmative!").
- Keep responses concise: 2 to 4 focused paragraphs or clear bullet points.
- Format with Markdown: bold key terms, use inline code for slot names (\`A2\`, \`B2\`) and IP addresses (\`192.168.1.1\`).
- If a user asks for a quiz or to test them, give 1 quick question with options A, B, C, D and wait for their answer.
- If asked about topics outside IT, computer hardware, or networking, politely guide them back to IT basics and their StreakByte lessons.`;

function getEffectiveApiKey(contextApiKey?: string): string {
  if (contextApiKey && contextApiKey.trim()) return contextApiKey.trim();
  // Don't auto-read .env in unit test mode unless explicitly passed via context
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test') {
    return '';
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) {
      return String(import.meta.env.VITE_GEMINI_API_KEY).trim();
    }
  } catch {
    // import.meta.env unavailable in some environments
  }
  return '';
}

function getModelCandidates(): string[] {
  const custom =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL
      ? String(import.meta.env.VITE_GEMINI_MODEL).trim()
      : '';
  const list = [custom, 'gemini-3.5-flash-lite', 'gemini-3.8-flash'].filter(Boolean);
  return Array.from(new Set(list));
}

async function fetchGeminiReply(
  apiKey: string,
  question: string,
  context?: StudyBuddyContext
): Promise<string> {
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: 'v1beta' },
  });

  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (context?.history && context.history.length > 0) {
    const recent = context.history.slice(-6);
    for (const msg of recent) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }
  }

  const prompt = formatStudyBuddyPrompt(question, context);

  contents.push({
    role: 'user',
    parts: [{ text: prompt }],
  });

  const models = getModelCandidates();
  let lastErr: unknown;

  for (const model of models) {
    try {
      console.log(`[StudyBuddy] Querying Gemini model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: STUDY_BUDDY_SYSTEM_INSTRUCTION,
        },
      });

      const text = response.text?.trim();
      if (text) {
        console.log(`[StudyBuddy] Response received from ${model}`);
        return text;
      }
    } catch (err) {
      console.warn(`[StudyBuddy] Model ${model} failed, trying next candidate...`, err);
      lastErr = err;
    }
  }

  console.warn('[StudyBuddy] All Gemini models failed or unavailable. Falling back to local responder.', lastErr);
  return localStudyBuddy.reply(question, context);
}

export const geminiStudyBuddy: StudyBuddyService = {
  greeting: STUDY_BUDDY_GREETING,

  reply(question: string, context?: StudyBuddyContext): string | Promise<string> {
    const apiKey = getEffectiveApiKey(context?.apiKey);
    const isOnline = typeof navigator === 'undefined' || navigator.onLine;

    // Fast-path synchronous response when offline or unconfigured
    if (!apiKey || !isOnline) {
      return localStudyBuddy.reply(question, context);
    }

    return fetchGeminiReply(apiKey, question, context).catch((err) => {
      console.warn('[StudyBuddy] Fallback to local responder:', err);
      return localStudyBuddy.reply(question, context);
    });
  },
};
