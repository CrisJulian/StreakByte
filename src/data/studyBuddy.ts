export const STARTER_PROMPTS = [
  'Explain the RAM key notch',
  'Quiz me on Lesson 3',
  'How do I keep my streak?',
] as const;

export const STUDY_BUDDY_GREETING =
  'Hi Mika! I’m your study buddy. Stuck on RAM or want a quick quiz? Ask away.';

/**
 * Offline-first Study Buddy responder for StreakByte's Hardware & Networking curriculum.
 * Kept in its own module so a real LLM endpoint can be swapped in later without touching UI code.
 */
export function getStudyBuddyReply(rawInput: string): string {
  const q = rawInput.trim().toLowerCase();

  if (q.includes('notch') || q.includes('orientation') || q.includes('upside down')) {
    return 'The RAM key notch sits slightly off-centre on the gold pins, matching a ridge inside the DIMM slot. That makes it impossible to snap a stick in backwards—and stops DDR4 from fitting into a DDR5 slot. Line up the notch first, then press both ends evenly until the side clips click.';
  }

  if (q.includes('a2 and b2') || q === 'a2 b2' || q === 'a2, b2') {
    return 'Spot on! Slots A2 and B2 are the primary dual-channel pair on most four-slot boards. Want another question on DDR4 vs DDR5 or M.2 storage?';
  }

  if (q.includes('dual') || q.includes('a2') || q.includes('b2')) {
    return 'Putting two matching RAM sticks in slots A2 and B2 enables dual-channel mode. Think of it like opening a second highway lane so the CPU can read and write memory twice as fast. Check the motherboard manual or the #3 badge on the board to confirm the pair.';
  }

  if (q.includes('ddr4') || q.includes('ddr5')) {
    return 'DDR4 and DDR5 are not physically or electrically compatible—their key notches sit in different spots so you cannot mix them by accident. DDR5 starts at higher base speeds and has built-in power management on the module itself.';
  }

  if (q.includes('quiz')) {
    return 'Quick Lesson 3 check: if your motherboard has four RAM slots labeled A1, A2, B1, and B2, which two slots should you fill first for dual-channel mode? Reply with the slot pair!';
  }

  if (q.includes('streak')) {
    return 'Finish at least one short lesson or practice review each day to keep your 5-day streak alive. Even a 5-minute Guided session counts—and you are only 70 XP behind Joel Mendoza this week!';
  }

  if (q.includes('m.2') || q.includes('ssd') || q.includes('storage')) {
    return 'An M.2 NVMe SSD plugs flat into the M.2 slot right below the CPU, then gets secured with a tiny standoff screw. Because it talks directly over PCIe lanes, it boots your OS much faster than a SATA drive.';
  }

  if (q.includes('gpu') || q.includes('graphics') || q.includes('pcie')) {
    return 'The graphics card goes into the top full-length PCIe x16 slot—that slot has the fastest direct link to the CPU. Make sure the retention latch clicks shut once the card is seated.';
  }

  if (q.includes('psu') || q.includes('power') || q.includes('24-pin')) {
    return 'The wide 24-pin ATX connector on the right edge supplies main power to the motherboard. Always touch the bare metal case first to discharge static electricity before handling parts.';
  }

  if (q.includes('ip') || q.includes('subnet') || q.includes('gateway') || q.includes('router') || q.includes('network')) {
    return 'On this LAN, the router lives at 192.168.1.1, so set Gateway to 192.168.1.1 and Subnet mask to 255.255.255.0. Give each computer its own unique host address from 192.168.1.2 to 192.168.1.254—for example, .10 for the PC and .20 for the Laptop.';
  }

  if (q.includes('ram') || q.includes('memory')) {
    return 'RAM is your PC’s short-term workspace—it holds the apps and files you are using right now, and clears when power turns off. On the board, match the off-centre key notch and use slots A2 and B2 for dual-channel speed.';
  }

  return 'Good question! I’m running offline in StreakByte right now, so I’m best at Hardware Basics (RAM, dual-channel, M.2, PCIe, 24-pin power) and Networking Basics (IP addresses, subnet masks, gateways). Try asking about one of those or ask for a quick Lesson 3 quiz!';
}
