import type { StudyBuddyContext } from '../application/ports';
import { looksLikeMultipleChoicePaste } from '../domain/rules/studyContext';

export const STARTER_PROMPTS = [
  'Explain the RAM key notch',
  'Quiz me on Lesson 3',
  'How do I keep my streak?',
] as const;

export const STUDY_BUDDY_GREETING =
  'Hi there! I’m your study buddy. Stuck on RAM or want a quick quiz? Ask away.';

export const ARENA_DUEL_ANTI_CHEAT_REPLIES = [
  'Nice try! 👀 No lifelines in a 1v1 Arena duel — win it with your own brainpower!',
  'Caught in 4K! 📸 Trying to phone a bot mid-duel? Finish your 1v1 first, then we’ll study.',
  'Whoa there, slick — BYTE-01 doesn’t help people cheat in 1v1s. Back to the Arena!',
  'Error 403: Anti-Cheat Engaged. 🚫 Earn that W yourself — I’ll be right here after the match.',
  'Bold move asking the study buddy during a live 1v1! Eyes on your own screen, champ. 😉',
] as const;

/** Rotating cheeky anti-cheat reply returned when a learner chats mid-1v1 duel. */
export function getArenaAntiCheatReply(attemptIndex: number): string {
  return ARENA_DUEL_ANTI_CHEAT_REPLIES[Math.abs(attemptIndex) % ARENA_DUEL_ANTI_CHEAT_REPLIES.length];
}

function getQuizCoachingReply(rawLower: string): string {
  if (
    rawLower.includes('ram') ||
    rawLower.includes('memory') ||
    rawLower.includes('dual') ||
    rawLower.includes('dimm') ||
    rawLower.includes('ddr') ||
    rawLower.includes('notch') ||
    rawLower.includes('a2') ||
    rawLower.includes('b2')
  ) {
    return [
      '**Quiz Coaching (No Spoilers):**',
      '- **Concept clue:** RAM holds active short-term data while power is on, and motherboards pair matching channels across alternating slots (using an off-centre notch to block the wrong generation or backwards insertion).',
      '- **How to spot it:** Rule out choices that describe permanent long-term storage or pairing adjacent slots side-by-side.',
      '- **Your turn:** Which choice matches alternating dual-channel slots or volatile working memory?',
    ].join('\n');
  }

  if (
    rawLower.includes('cpu') ||
    rawLower.includes('processor') ||
    rawLower.includes('cooler') ||
    rawLower.includes('thermal') ||
    rawLower.includes('socket') ||
    rawLower.includes('vrm') ||
    rawLower.includes('cmos')
  ) {
    return [
      '**Quiz Coaching (No Spoilers):**',
      '- **Concept clue:** The CPU aligns gently with the socket triangle before mounting the cooler + a pea-sized drop of thermal paste, while VRMs regulate power and the CMOS battery keeps BIOS settings.',
      '- **How to spot it:** Eliminate any choice that suggests forcing pins, installing a cooler before the CPU, or mixing cooling with permanent storage.',
      '- **Your turn:** Based on what sits directly under the cooler, which option fits best?',
    ].join('\n');
  }

  if (
    rawLower.includes('m.2') ||
    rawLower.includes('nvme') ||
    rawLower.includes('ssd') ||
    rawLower.includes('hdd') ||
    rawLower.includes('storage') ||
    rawLower.includes('drive')
  ) {
    return [
      '**Quiz Coaching (No Spoilers):**',
      '- **Concept clue:** Non-volatile drives keep files after shutdown: spinning HDDs are slowest, SATA SSDs top out around SATA bus speeds, and M.2 NVMe drives plug directly into PCIe lanes on the board.',
      '- **How to spot it:** Cross out volatile memory (RAM) or options requiring extra SATA cables when thinking about M.2 speed.',
      '- **Your turn:** Which option connects directly over PCIe lanes without extra cables?',
    ].join('\n');
  }

  if (
    rawLower.includes('gpu') ||
    rawLower.includes('graphics') ||
    rawLower.includes('pcie') ||
    rawLower.includes('psu') ||
    rawLower.includes('power') ||
    rawLower.includes('24-pin') ||
    rawLower.includes('esd') ||
    rawLower.includes('static')
  ) {
    return [
      '**Quiz Coaching (No Spoilers):**',
      '- **Concept clue:** Expansion graphics cards use the top full-length PCIe slot with a retention latch, the PSU delivers DC power via the wide 24-pin main latch, and grounding on bare metal prevents ESD.',
      '- **How to spot it:** Rule out low-bandwidth slots for GPUs, or options that skip static discharge before touching parts.',
      '- **Your turn:** Which choice matches the main power latch, fastest PCIe lane, or safe ESD step?',
    ].join('\n');
  }

  if (
    rawLower.includes('ip') ||
    rawLower.includes('subnet') ||
    rawLower.includes('mask') ||
    rawLower.includes('gateway') ||
    rawLower.includes('router') ||
    rawLower.includes('switch') ||
    rawLower.includes('hub') ||
    rawLower.includes('cable') ||
    rawLower.includes('fiber') ||
    rawLower.includes('ethernet') ||
    rawLower.includes('lan') ||
    rawLower.includes('wan')
  ) {
    return [
      '**Quiz Coaching (No Spoilers):**',
      '- **Concept clue:** Hubs broadcast to all ports, switches learn MAC addresses per LAN port, routers forward across networks (default gateway), `/24` masks lock the first three octets (`255.255.255.0`), and WAN uses ISP fiber/coax while LAN uses Cat6.',
      '- **How to spot it:** Rule out reserved addresses (`.0` network, `.255` broadcast, `.1` router) for client hosts, or fiber/coax for a short switch-to-PC patch.',
      '- **Your turn:** Check which option avoids conflicts and matches the exact device layer or port role!',
    ].join('\n');
  }

  return [
    '**Quiz Coaching (No Spoilers):**',
    '- **Concept clue:** I’ll help you reason through it, but I won’t give away the final quiz answer outright!',
    '- **How to spot it:** Break the question down by what each hardware part or network device actually does, and eliminate options that belong to a different layer or component.',
    '- **Your turn:** Ask me to explain one specific term from the choices, and I’ll walk you through how it works.',
  ].join('\n');
}

/**
 * Offline-first Study Buddy responder for StreakByte's Hardware & Networking curriculum.
 * Kept in its own module so a real LLM endpoint can be swapped in later without touching UI code.
 */
export function getStudyBuddyReply(rawInput: string, context?: StudyBuddyContext): string {
  const rawLower = rawInput.trim().toLowerCase();
  if (context?.inActiveQuiz || looksLikeMultipleChoicePaste(rawInput)) {
    return getQuizCoachingReply(rawLower);
  }
  const isMistakeFollowUp =
    Boolean(context?.recentMistake) &&
    (rawLower.includes('mistake') ||
      rawLower.includes('missed') ||
      rawLower.includes('wrong') ||
      rawLower.includes('why') ||
      rawLower.includes('explain'));

  const q = isMistakeFollowUp ? `${rawLower} ${context?.recentMistake?.toLowerCase() ?? ''}` : rawLower;
  const prefix = isMistakeFollowUp && context?.recentMistake
    ? `Looking at that mistake (${context.recentMistake}): `
    : '';

  if (q.includes('notch') || q.includes('orientation') || q.includes('upside down')) {
    return `${prefix}The RAM key notch sits slightly off-centre on the gold pins, matching a ridge inside the DIMM slot. That makes it impossible to snap a stick in backwards—and stops DDR4 from fitting into a DDR5 slot. Line up the notch first, then press both ends evenly until the side clips click.`;
  }

  if (q.includes('a2 and b2') || q === 'a2 b2' || q === 'a2, b2') {
    return `${prefix}Spot on! Slots A2 and B2 are the primary dual-channel pair on most four-slot boards. Want another question on DDR4 vs DDR5 or M.2 storage?`;
  }

  if (q.includes('dual') || q.includes('a2') || q.includes('b2')) {
    return `${prefix}Putting two matching RAM sticks in slots A2 and B2 enables dual-channel mode. Think of it like opening a second highway lane so the CPU can read and write memory twice as fast. Check the motherboard manual or the #3 badge on the board to confirm the pair.`;
  }

  if (q.includes('ddr4') || q.includes('ddr5')) {
    return `${prefix}DDR4 and DDR5 are not physically or electrically compatible—their key notches sit in different spots so you cannot mix them by accident. DDR5 starts at higher base speeds and has built-in power management on the module itself.`;
  }

  if (q.includes('quiz')) {
    return `${prefix}Quick Lesson 3 check: if your motherboard has four RAM slots labeled A1, A2, B1, and B2, which two slots should you fill first for dual-channel mode? Reply with the slot pair!`;
  }

  if (q.includes('streak')) {
    return `${prefix}Finish at least one short lesson or practice review each day to keep your daily streak alive. If you miss 1–2 days, open your streak popover in the top bar to spend a Streak Restore!`;
  }

  if (q.includes('m.2') || q.includes('ssd') || q.includes('storage')) {
    return `${prefix}An M.2 NVMe SSD plugs flat into the M.2 slot right below the CPU, then gets secured with a tiny standoff screw. Because it talks directly over PCIe lanes, it boots your OS much faster than a SATA drive.`;
  }

  if (q.includes('gpu') || q.includes('graphics') || q.includes('pcie')) {
    return `${prefix}The graphics card goes into the top full-length PCIe x16 slot—that slot has the fastest direct link to the CPU. Make sure the retention latch clicks shut once the card is seated.`;
  }

  if (q.includes('psu') || q.includes('power') || q.includes('24-pin')) {
    return `${prefix}The wide 24-pin ATX connector on the right edge supplies main power to the motherboard. Always touch the bare metal case first to discharge static electricity before handling parts.`;
  }

  if (q.includes('ip') || q.includes('subnet') || q.includes('gateway') || q.includes('router') || q.includes('network') || q.includes('switch') || q.includes('hub')) {
    return `${prefix}On this LAN, the router lives at 192.168.1.1, so set Gateway to 192.168.1.1 and Subnet mask to 255.255.255.0. Give each computer its own unique host address from 192.168.1.2 to 192.168.1.254—for example, .10 for the PC and .20 for the Laptop.`;
  }

  if (q.includes('ram') || q.includes('memory')) {
    return `${prefix}RAM is your PC’s short-term workspace—it holds the apps and files you are using right now, and clears when power turns off. On the board, match the off-centre key notch and use slots A2 and B2 for dual-channel speed.`;
  }

  return `${prefix}Good question! I’m running offline in StreakByte right now, so I’m best at Hardware Basics (RAM, dual-channel, M.2, PCIe, 24-pin power) and Networking Basics (IP addresses, subnet masks, gateways). Try asking about one of those or ask for a quick Lesson 3 quiz!`;
}
