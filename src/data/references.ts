import type { LabId, LessonReference } from '../types/streakbyte';

/** Shown at the bottom of every lesson. Keep entries to pages the lesson content is based on. */
export const LAB_REFERENCES: Record<LabId, LessonReference[]> = {
  pc: [
    { title: 'DDR4 SDRAM (Wikipedia)', url: 'https://en.wikipedia.org/wiki/DDR4_SDRAM' },
    { title: 'DDR5 SDRAM (Wikipedia)', url: 'https://en.wikipedia.org/wiki/DDR5_SDRAM' },
    {
      title: 'Multi-channel memory architecture (Wikipedia)',
      url: 'https://en.wikipedia.org/wiki/Multi-channel_memory_architecture',
    },
  ],
  net: [
    { title: 'Private network (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Private_network' },
    { title: 'Subnet (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Subnet' },
    { title: 'Default gateway (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Default_gateway' },
  ],
};
