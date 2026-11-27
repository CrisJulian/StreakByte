import type { QuizQuestion } from '../entities/quiz';
import type { DuelTrack } from './duel';
import { pickRandom, shuffleChoices, shuffleItems, type Rng } from './quiz';

export { shuffleChoices } from './quiz';

export interface ArenaScenario extends QuizQuestion {
  track: 'hw' | 'net';
}

export type ArenaQuestionKind = 'generated' | 'scenario' | 'quiz';

export interface ArenaResolvedQuestion extends QuizQuestion {
  kind: ArenaQuestionKind;
}

export const ARENA_GENERATOR_KEYS = {
  hw: [
    'hw-psu-wattage',
    'hw-ram-kit',
    'hw-storage-transfer',
    'hw-socket-match',
  ] as const,
  net: [
    'net-invalid-ip',
    'net-same-subnet',
    'net-valid-host',
    'net-gateway-fix',
  ] as const,
};

/** Deterministic 32-bit PRNG (Mulberry32) so both players resolve identical questions/options. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, maxInclusive: number): number {
  const span = maxInclusive - min + 1;
  return min + (Math.floor(rng() * span) % span);
}

function pickOne<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

function makeSeed(rng: Rng): number {
  return randInt(rng, 10_000, 99_999);
}

function generateQuestionByKey(key: string, seed: number): QuizQuestion | undefined {
  const rng = mulberry32(seed);

  if (key === 'hw-psu-wattage') {
    const cpuW = pickOne(rng, [65, 95, 105, 125, 170] as const);
    const gpuW = pickOne(rng, [150, 200, 220, 260, 320] as const);
    const needed = cpuW + gpuW + 150 + 150;
    const raw: QuizQuestion = {
      id: `gen:${key}:${seed}`,
      topic: 'PSU Sizing',
      prompt: `A build pairs a ${cpuW} W CPU and a ${gpuW} W GPU. Adding 150 W for system parts and 150 W headroom, what minimum PSU rating fits?`,
      choices: [
        `${needed} W`,
        `${needed - 200} W`,
        `${needed - 100} W`,
        `${needed + 150} W`,
      ],
      correctIndex: 0,
      explanation: `${cpuW} + ${gpuW} + 150 + 150 = ${needed} W minimum.`,
    };
    return shuffleChoices(raw, rng);
  }

  if (key === 'hw-ram-kit') {
    const perStick = pickOne(rng, [8, 16, 32] as const);
    const ddr = pickOne(rng, ['DDR4', 'DDR5'] as const);
    const total = perStick * 2;
    const raw: QuizQuestion = {
      id: `gen:${key}:${seed}`,
      topic: 'Dual-Channel RAM',
      prompt: `You install two matching ${perStick} GB ${ddr} sticks on a 4-slot board. What gives full dual-channel memory?`,
      choices: [
        `${total} GB in slots A2 and B2`,
        `${total} GB in slots A1 and A2`,
        `${perStick} GB in slots A2 and B2`,
        `${total * 2} GB in slots B1 and B2`,
      ],
      correctIndex: 0,
      explanation: `Two ${perStick} GB sticks equal ${total} GB total, and slots A2 + B2 activate dual-channel first.`,
    };
    return shuffleChoices(raw, rng);
  }

  if (key === 'hw-storage-transfer') {
    const sizeGb = pickOne(rng, [25, 45, 70, 95] as const);
    const raw: QuizQuestion = {
      id: `gen:${key}:${seed}`,
      topic: 'Storage Speed',
      prompt: `You need to copy a ${sizeGb} GB video project quickly and keep it saved after shutdown. Which drive is best?`,
      choices: [
        'NVMe M.2 SSD',
        'SATA 2.5" SSD',
        'Mechanical HDD',
        'DDR5 RAM stick',
      ],
      correctIndex: 0,
      explanation: 'NVMe M.2 SSDs use PCIe lanes for top speed and keep files saved when power turns off.',
    };
    return shuffleChoices(raw, rng);
  }

  if (key === 'hw-socket-match') {
    const pairs = [
      ['AMD Ryzen 7000', 'AM5 socket', 'LGA 1700 socket'],
      ['Intel Alder or Raptor Lake', 'LGA 1700 socket', 'AM5 socket'],
    ] as const;
    const [cpuName, rightSocket, otherSocket] = pickOne(rng, pairs);
    const raw: QuizQuestion = {
      id: `gen:${key}:${seed}`,
      topic: 'CPU Sockets',
      prompt: `Which motherboard socket is built for an ${cpuName} processor?`,
      choices: [rightSocket, otherSocket, 'PCIe x16 slot', 'DIMM slot'],
      correctIndex: 0,
      explanation: `${cpuName} processors require a matching ${rightSocket}.`,
    };
    return shuffleChoices(raw, rng);
  }

  if (key === 'net-invalid-ip') {
    const prefix = pickOne(rng, ['192.168', '10.12', '172.16'] as const);
    const t1 = randInt(rng, 1, 8);
    const t2 = t1 + randInt(rng, 1, 6);
    const t3 = t2 + randInt(rng, 1, 6);
    const h1 = randInt(rng, 10, 70);
    const h2 = randInt(rng, 80, 150);
    const h3 = randInt(rng, 160, 240);
    const badOctet = randInt(rng, 256, 299);
    const badInThird = rng() < 0.5;
    const badIp = badInThird ? `${prefix}.${badOctet}.${h1}` : `${prefix}.${t3}.${badOctet}`;
    const raw: QuizQuestion = {
      id: `gen:${key}:${seed}`,
      topic: 'IPv4 Validation',
      prompt: 'Which IPv4 address is INVALID?',
      choices: [
        badIp,
        `${prefix}.${t1}.${h1}`,
        `${prefix}.${t2}.${h2}`,
        `192.168.${t3}.${h3}`,
      ],
      correctIndex: 0,
      explanation: `Every IPv4 octet must be 0–255; ${badOctet} exceeds 255.`,
    };
    return shuffleChoices(raw, rng);
  }

  if (key === 'net-same-subnet') {
    const subA = randInt(rng, 1, 20);
    const same = rng() < 0.5;
    const subB = same ? subA : subA + randInt(rng, 1, 6);
    const h1 = randInt(rng, 10, 80);
    const h2 = randInt(rng, 100, 210);
    const ipA = `192.168.${subA}.${h1}`;
    const ipB = `192.168.${subB}.${h2}`;

    const raw: QuizQuestion = same
      ? {
          id: `gen:${key}:${seed}`,
          topic: 'Subnetting (/24)',
          prompt: `Do ${ipA} and ${ipB} (mask 255.255.255.0) sit on the same LAN?`,
          choices: [
            `Yes — the first three octets (192.168.${subA}) match under 255.255.255.0`,
            `No — their fourth octets differ (.${h1} vs .${h2}), so a router is required`,
            'No — 255.255.255.0 reserves addresses above .100 for routers',
            'Yes — any two private IPv4 addresses share one LAN regardless of mask',
          ],
          correctIndex: 0,
          explanation: `With mask 255.255.255.0, the first three octets identify the network. Both share 192.168.${subA}.`,
        }
      : {
          id: `gen:${key}:${seed}`,
          topic: 'Subnetting (/24)',
          prompt: `Do ${ipA} and ${ipB} (mask 255.255.255.0) sit on the same LAN?`,
          choices: [
            `No — the third octet differs (${subA} vs ${subB}), so a router is needed`,
            'Yes — both start with 192.168 so they share one /24 LAN',
            'Yes — any two addresses below .254 talk directly without a router',
            'No — only addresses ending in .10 can share a subnet',
          ],
          correctIndex: 0,
          explanation: `Under 255.255.255.0, 192.168.${subA}.0 and 192.168.${subB}.0 are separate networks.`,
        };
    return shuffleChoices(raw, rng);
  }

  if (key === 'net-valid-host') {
    const third = randInt(rng, 1, 30);
    const taken = randInt(rng, 5, 40);
    const free = taken + randInt(rng, 5, 35);
    const prefix = `192.168.${third}`;
    const raw: QuizQuestion = {
      id: `gen:${key}:${seed}`,
      topic: 'Host Assignment',
      prompt: `On ${prefix}.0/24, the router is ${prefix}.1 and a PC already uses ${prefix}.${taken}. Which IP works for a Laptop?`,
      choices: [
        `${prefix}.${free}`,
        `${prefix}.${taken}`,
        `${prefix}.0`,
        `${prefix}.255`,
      ],
      correctIndex: 0,
      explanation: `${prefix}.0 is the network address, .255 is broadcast, and .${taken} is already taken.`,
    };
    return shuffleChoices(raw, rng);
  }

  if (key === 'net-gateway-fix') {
    const third = randInt(rng, 2, 40);
    const badThird = third + randInt(rng, 1, 6);
    const host = randInt(rng, 10, 60);
    const raw: QuizQuestion = {
      id: `gen:${key}:${seed}`,
      topic: 'Gateway Troubleshooting',
      prompt: `A PC has IP 192.168.${third}.${host}, mask 255.255.255.0, and gateway 192.168.${badThird}.1. It cannot reach the internet. What gateway fixes it?`,
      choices: [
        `192.168.${third}.1`,
        `192.168.${third}.${host}`,
        `192.168.${third}.255`,
        '255.255.255.0',
      ],
      correctIndex: 0,
      explanation: `The default gateway must be the router address on the same subnet: 192.168.${third}.1.`,
    };
    return shuffleChoices(raw, rng);
  }

  return undefined;
}

function pushSeededTokens<T>(
  tokens: string[],
  items: readonly T[],
  amount: number,
  prefix: 'gen' | 'arena' | 'quiz',
  getId: (item: T) => string,
  rng: Rng,
  usedIds?: Set<string>,
): void {
  for (const item of pickRandom(items, amount, rng)) {
    const id = getId(item);
    usedIds?.add(id);
    tokens.push(`${prefix}:${id}:${makeSeed(rng)}`);
  }
}

export function generateArenaDuelTokens(
  track: DuelTrack,
  scenarioPool: readonly Pick<ArenaScenario, 'id' | 'track'>[],
  count: number = 8,
  rng: Rng = Math.random,
  quizIds: readonly string[] = [],
): string[] {
  const hwScenarios = scenarioPool.filter((s) => s.track === 'hw');
  const netScenarios = scenarioPool.filter((s) => s.track === 'net');
  const hwQuizIds = quizIds.filter((id) => id.startsWith('hw-'));
  const netQuizIds = quizIds.filter((id) => id.startsWith('net-'));

  const tokens: string[] = [];
  const usedScenarioIds = new Set<string>();
  const usedQuizIds = new Set<string>();

  if (quizIds.length === 0) {
    if (track === 'hw') {
      pushSeededTokens(tokens, ARENA_GENERATOR_KEYS.hw, 4, 'gen', (g) => g, rng);
      pushSeededTokens(tokens, hwScenarios, 4, 'arena', (s) => s.id, rng, usedScenarioIds);
    } else if (track === 'net') {
      pushSeededTokens(tokens, ARENA_GENERATOR_KEYS.net, 4, 'gen', (g) => g, rng);
      pushSeededTokens(tokens, netScenarios, 4, 'arena', (s) => s.id, rng, usedScenarioIds);
    } else {
      pushSeededTokens(tokens, ARENA_GENERATOR_KEYS.hw, 2, 'gen', (g) => g, rng);
      pushSeededTokens(tokens, ARENA_GENERATOR_KEYS.net, 2, 'gen', (g) => g, rng);
      pushSeededTokens(tokens, hwScenarios, 2, 'arena', (s) => s.id, rng, usedScenarioIds);
      pushSeededTokens(tokens, netScenarios, 2, 'arena', (s) => s.id, rng, usedScenarioIds);
    }
    return shuffleItems(tokens, rng).slice(0, count);
  }

  const quizSlots = Math.max(0, count - 4);
  if (track === 'hw') {
    pushSeededTokens(tokens, ARENA_GENERATOR_KEYS.hw, 2, 'gen', (g) => g, rng);
    pushSeededTokens(tokens, hwScenarios, 2, 'arena', (s) => s.id, rng, usedScenarioIds);
    pushSeededTokens(tokens, hwQuizIds, quizSlots, 'quiz', (id) => id, rng, usedQuizIds);
  } else if (track === 'net') {
    pushSeededTokens(tokens, ARENA_GENERATOR_KEYS.net, 2, 'gen', (g) => g, rng);
    pushSeededTokens(tokens, netScenarios, 2, 'arena', (s) => s.id, rng, usedScenarioIds);
    pushSeededTokens(tokens, netQuizIds, quizSlots, 'quiz', (id) => id, rng, usedQuizIds);
  } else {
    pushSeededTokens(tokens, ARENA_GENERATOR_KEYS.hw, 1, 'gen', (g) => g, rng);
    pushSeededTokens(tokens, ARENA_GENERATOR_KEYS.net, 1, 'gen', (g) => g, rng);
    pushSeededTokens(tokens, hwScenarios, 1, 'arena', (s) => s.id, rng, usedScenarioIds);
    pushSeededTokens(tokens, netScenarios, 1, 'arena', (s) => s.id, rng, usedScenarioIds);
    const hwQuizCount = Math.ceil(quizSlots / 2);
    const netQuizCount = Math.floor(quizSlots / 2);
    pushSeededTokens(tokens, hwQuizIds, hwQuizCount, 'quiz', (id) => id, rng, usedQuizIds);
    pushSeededTokens(tokens, netQuizIds, netQuizCount, 'quiz', (id) => id, rng, usedQuizIds);
  }

  if (tokens.length < count) {
    const trackQuizzes = track === 'hw' ? hwQuizIds : track === 'net' ? netQuizIds : quizIds;
    const trackScenarios = track === 'hw' ? hwScenarios : track === 'net' ? netScenarios : scenarioPool;
    const spareQuiz = trackQuizzes
      .filter((id) => !usedQuizIds.has(id))
      .map((id) => `quiz:${id}:${makeSeed(rng)}`);
    const spareScenarios = trackScenarios
      .filter((s) => !usedScenarioIds.has(s.id))
      .map((s) => `arena:${s.id}:${makeSeed(rng)}`);
    tokens.push(...pickRandom([...spareQuiz, ...spareScenarios], count - tokens.length, rng));
  }

  return shuffleItems(tokens, rng).slice(0, count);
}

function resolveSeededQuestion(
  question: QuizQuestion | undefined,
  seedRaw: string | undefined,
  kind: ArenaQuestionKind,
): ArenaResolvedQuestion | undefined {
  if (!question) return undefined;
  const seed = Number(seedRaw);
  const shuffled = Number.isFinite(seed) ? shuffleChoices(question, mulberry32(seed)) : question;
  return { ...shuffled, kind };
}

export function resolveArenaQuestion(
  token: string,
  scenarioById: Readonly<Record<string, ArenaScenario>>,
  fallbackById?: (id: string) => QuizQuestion | undefined,
): ArenaResolvedQuestion | undefined {
  if (token.startsWith('gen:')) {
    const [, key, seedRaw] = token.split(':');
    const seed = Number(seedRaw);
    if (!key || !Number.isFinite(seed)) return undefined;
    const generated = generateQuestionByKey(key, seed);
    return generated ? { ...generated, kind: 'generated' } : undefined;
  }

  if (token.startsWith('arena:')) {
    const [, scenarioId, seedRaw] = token.split(':');
    return resolveSeededQuestion(scenarioId ? scenarioById[scenarioId] : undefined, seedRaw, 'scenario');
  }

  if (token.startsWith('quiz:')) {
    const [, quizId, seedRaw] = token.split(':');
    return resolveSeededQuestion(quizId ? fallbackById?.(quizId) : undefined, seedRaw, 'quiz');
  }

  const fallback = fallbackById?.(token);
  return fallback ? { ...fallback, kind: 'quiz' } : undefined;
}
