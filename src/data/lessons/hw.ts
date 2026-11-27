import type { LessonContent } from './types';
import { img } from './helpers';

/**
 * Hardware Basics lesson content, taken from StreakByte_Hardware_Lessons.docx.
 * To change a lesson, edit it here. `verify` marks claims the document flags VERIFY / NOT FOUND.
 * Pictures: see public/lessons/hw/ and LESSON_TODO.md.
 */

const PDF_CREDIT = 'Source: StreakByte Hardware Basics reference guide (hardware.pdf)';
const ASSET_CREDIT = 'Source: StreakByte Hardware Basics lesson asset';
const pdfImg = (file: string, alt: string, caption: string) =>
  img(file, alt, caption, { available: true, credit: PDF_CREDIT });

// Pictures that are reused on more than one page.
const m2Slot = pdfImg(
  'hw2-m2-slot.jpg',
  'Close-up of an M.2 slot on a motherboard.',
  'An M.2 slot on a motherboard.',
);
const dimmSlots = pdfImg(
  'hw2-dimm-slots.jpg',
  'Desktop DIMM slots with RAM sticks and locking clips visible.',
  'DIMM slots on a desktop board with clips visible.',
);
const ramStick = pdfImg(
  'hw3-ram-stick.jpg',
  'Desktop RAM sticks with memory chips and gold contacts.',
  'Desktop RAM sticks (DIMMs).',
);
const m2Ssd = pdfImg(
  'hw4-m2-ssd.jpg',
  'An NVMe M.2 2280 SSD: a short stick with memory chips.',
  'An NVMe M.2 2280 SSD.',
);
const plug24 = pdfImg(
  'hw5-24pin.jpg',
  'A wide two-row 24-pin (20+4) ATX power connector.',
  'The 24-pin (20+4) ATX power connector.',
);
const thermalPaste = pdfImg(
  'hw1-thermal-paste.jpg',
  'A syringe of thermal paste.',
  'A syringe of thermal paste.',
);
const cpuCooler = pdfImg(
  'hw1-cpu-cooler.jpg',
  'A tower air CPU cooler with metal fins and fans.',
  'A tower air CPU cooler.',
);
const cpu = pdfImg(
  'hw1-cpu.jpg',
  'A desktop CPU seated in its motherboard socket.',
  'A desktop CPU in its socket.',
);

export const HW_LESSONS: Record<string, LessonContent> = {
  'hw-1': {
    key: 'hw-1',
    goal: 'Name the main parts inside a desktop PC, explain what each one does, and check physical compatibility.',
    definitions: [
      {
        term: 'PC case',
        text: 'Also called the chassis, it is the box that holds and protects the parts of a PC while controlling airflow, cable routing, and how many drives, fans, and radiators can fit.',
      },
      {
        term: 'Motherboard',
        text: 'The main circuit board of the PC. The CPU, memory, storage, and expansion cards plug into it, and its chipset passes messages between the CPU and the other devices.',
      },
      {
        term: 'CPU (processor)',
        text: 'The “brain” of the computer. It runs program instructions and performs calculations using cores, threads, clock speed (GHz), and fast built-in cache.',
      },
      {
        term: 'CPU cooler',
        text: 'Pulls heat away from the CPU so it stays at a safe temperature instead of slowing itself down. Air coolers use a metal heatsink and fans; AIO liquid coolers use a pump block, tubes, and a radiator (120 to 420 mm).',
      },
      {
        term: 'Thermal paste',
        text: 'A thermally conductive paste placed between the CPU and cooler to fill microscopic air gaps so heat passes across more easily.',
      },
    ],
    parts: [
      {
        name: 'Case',
        does: 'Protects components, manages airflow, and sets physical limits for motherboard form factor, GPU length (some cards exceed 32 cm / 13 in), cooler height, radiator size (up to 420 mm), and PSU size (ATX vs. SFX/SFX-L).',
        looksLike: 'A tower box ranging from SFF (8–12 in, Mini-ITX/Micro-ATX) and Mini tower to Mid tower (18–20 in, ATX/Micro-ATX/Mini-ITX, best for beginners) and Full tower (20 in+, up to E-ATX), with front I/O, drive bays, dust filters, cable space behind the tray, and a PSU shroud.',
        images: [
          pdfImg(
            'hw1-case.jpg',
            'A computer case with the side panel open and parts inside.',
            'A PC case with parts inside.',
          ),
          pdfImg(
            'hw1-case-sizes.jpg',
            'Comparison of PC case sizes from small form factor to full tower.',
            'PC case form factors compared by size.',
          ),
        ],
      },
      {
        name: 'Motherboard',
        does: 'Connects every other part so they can work together and determines how many memory slots, expansion slots, and ports the PC can have.',
        looksLike: 'A flat board covered in slots, sockets, and connectors. Standard sizes are E-ATX (up to 345 × 330 mm, 7+ slots), ATX (305 × 244 mm, up to 7 slots), Micro-ATX (244 × 244 mm, up to 4 slots), and Mini-ITX (170 × 170 mm, 1 slot).',
        images: [
          pdfImg(
            'hw1-motherboard.jpg',
            'A modern ATX motherboard.',
            'A modern ATX motherboard.',
          ),
          pdfImg(
            'hw1-motherboard-sizes.jpg',
            'Comparison of ATX, Micro-ATX, and Mini-ITX motherboard sizes.',
            'Motherboard form factors: ATX, Micro-ATX, and Mini-ITX.',
          ),
        ],
      },
      {
        name: 'CPU',
        does: 'Runs program instructions. Cores handle parallel tasks, threads keep cores busy, cache keeps frequent data nearby, and some CPUs include integrated graphics so a monitor works without a separate graphics card.',
        looksLike:
          'A small square chip made by Intel or AMD with metal contacts on one side that must match the motherboard socket (some include a boxed cooler, others do not).',
        images: [cpu],
      },
      {
        name: 'CPU cooler',
        does: 'Removes heat so the CPU runs at full speed without thermal throttling. Air coolers are simpler, cheaper, and have no liquid to leak; AIO liquid coolers cool hot CPUs cleanly but cost more and have a pump that ages.',
        looksLike:
          'A block of thin metal fins with one or more fans (air), or a pump block with tubes running to a case-mounted radiator (AIO).',
        images: [
          cpuCooler,
          pdfImg(
            'hw1-aio-cooler.jpg',
            'An all-in-one (AIO) liquid CPU cooler with pump block, tubes, and radiator fans.',
            'An AIO liquid CPU cooler.',
          ),
        ],
      },
      {
        name: 'Thermal paste',
        does: 'Replaces trapped air in microscopic gaps between the CPU and cooler so heat transfers efficiently.',
        looksLike: 'A grey or white non-conductive paste sold in a syringe or tube (some coolers ship with paste pre-applied).',
        images: [
          thermalPaste,
          pdfImg(
            'hw1-thermal-paste-clean.jpg',
            'Cleaning old thermal paste off a cooler base with a cloth.',
            'Wiping off old thermal paste before applying new paste.',
          ),
        ],
      },
    ],
    notes: [
      {
        title: 'Case & motherboard form factors',
        text: 'The compatibility rule is directional: a smaller board fits in a larger case (for example Micro-ATX in an ATX mid tower), never the reverse. Mini-ITX boards often cost more than Micro-ATX despite having fewer slots. Always check mesh vs. solid front airflow and GPU length limits separately from board size.',
      },
      {
        title: 'Air cooler vs. AIO liquid cooler',
        text: 'Clock speed (GHz) is only a fair comparison between similar CPUs, because newer architectures do more work per cycle. Match cooler capacity to the CPU, and confirm tower cooler height (and RAM clearance) or radiator mount size against the case spec sheet.',
      },
      {
        title: 'Thermal paste best practices',
        text: 'A pea-sized or rice-grain-sized dot is enough—excess paste creates an extra barrier and raises temperatures. Clean old paste off completely with isopropyl alcohol and a lint-free cloth first, never add extra paste on top of pre-applied paste, and stick to non-conductive paste (liquid metal can short-circuit parts).',
      },
    ],
    keyPoints: [
      'The case holds and protects everything while setting size and airflow limits; a mid tower is best for most first builds.',
      'The motherboard connects every part; a smaller board fits in a larger case, never the reverse.',
      'The CPU runs instructions and makes heat; check socket match, integrated graphics, and whether a cooler is included.',
      'A CPU cooler prevents thermal throttling; check air cooler height or AIO radiator mount fit.',
      'Use a small pea-sized dot of non-conductive thermal paste to fill microscopic gaps.',
    ],
    commonMistakes: [
      'Using too much thermal paste or adding more on top of pre-applied paste, which hurts cooling performance.',
      'Buying a case that supports the motherboard size but is too short for the graphics card or too narrow for the cooler.',
      'Comparing CPUs by GHz alone or assuming every CPU comes with a cooler and integrated graphics.',
    ],
    references: [
      { title: 'What Is a PC Case? Sizes, Layouts, and Beginner Basics (MSI)', url: 'https://www.msi.com/blog/what-is-a-pc-case' },
      { title: 'PC Cases 101: Sizes and Layouts (Corsair)', url: 'https://www.corsair.com/us/en/explorer/diy-builder/cases/pc-cases-101-sizes-and-layouts/' },
      { title: 'Computer Case Sizes Explained (Micro Center)', url: 'https://www.microcenter.com/site/mc-news/article/computer-case-sizes-explained.aspx' },
      { title: 'PC Case Sizes Explained (TechRadar)', url: 'https://www.techradar.com/computing/computing-components/pc-case-sizes-explained-all-form-factors-available-in-year' },
      { title: 'Gaming Motherboard Buying Guide (Intel)', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html' },
      { title: 'What Is RAM vs. Processor? (Intel)', url: 'https://www.intel.com/content/www/us/en/learn/what-is-ram-vs-processor.html' },
      { title: 'Air Cooler vs AIO Cooler (Corsair)', url: 'https://www.corsair.com/us/en/explorer/diy-builder/cpu-coolers/air-cooler-vs-aio-cooler-which-should-you-buy/' },
      { title: 'What CPU Cooler Should I Get? (Corsair)', url: 'https://www.corsair.com/uk/en/explorer/diy-builder/cpu-coolers/what-cpu-cooler-should-i-get/' },
      { title: 'What is Thermal Paste? (Corsair)', url: 'https://www.corsair.com/us/en/explorer/glossary/what-is-thermal-paste/' },
      { title: 'How should I apply NT-H1 or NT-H2 thermal paste? (Noctua)', url: 'https://www.noctua.at/en/support/faqs/how-should-i-apply-the-nt-h1-or-nt-h2-thermal-paste-on-the-cpu-and-how-can-i-remove-it' },
    ],
  },

  'hw-2': {
    key: 'hw-2',
    goal: 'Find and explain the main sockets, slots, power connectors, headers, and rear I/O ports on a motherboard.',
    definitions: [
      {
        term: 'CPU socket',
        text: 'Where the CPU sits on the board. A CPU fits only the socket it was made for (such as AMD AM5 for DDR5, AMD AM4 for DDR4, or Intel LGA 1700 for 12th–14th Gen). Always check the board’s supported CPU list.',
      },
      {
        term: 'LGA vs. PGA',
        text: 'In LGA (Land Grid Array), the fragile pins sit inside the socket and the CPU has flat contacts. In PGA (Pin Grid Array, such as AM4), the pins are on the CPU itself.',
      },
      {
        term: 'Chipset',
        text: 'A chip that works with specific CPU generations and determines how many USB ports, SATA ports, PCIe lanes, and storage slots the board offers, plus features like overclocking. Two boards with the same socket can have different chipsets.',
      },
      {
        term: 'DIMM slot',
        text: 'A slot for a memory stick (RAM). Full-size ATX boards usually have four and Mini-ITX boards usually two. A board supports either DDR4 or DDR5, never both.',
      },
      {
        term: 'PCIe x16 slot',
        text: 'Usually the longest PCIe slot, most often used for a graphics card. PCIe comes in x1, x4, x8, and x16 lane widths and generations (3.0, 4.0, 5.0); newer cards work in older slots at the older speed.',
      },
      {
        term: 'M.2 slot',
        text: 'A small slot for NVMe SSDs and Wi-Fi cards that plug straight into the board without cables. Usually has a screw post at the far end and sometimes a heatshield.',
      },
      {
        term: 'SATA ports',
        text: 'Small L-shaped connectors for 2.5-inch and 3.5-inch drives, running at up to 6 Gbit/s in SATA 3.',
      },
      {
        term: '24-pin & CPU power connectors',
        text: 'The 24-pin ATX connector brings main power to the board, while the 4-pin or 8-pin CPU power connector near the top-left gives the CPU extra power (the PC will not start without it).',
      },
      {
        term: 'VRM',
        text: 'Voltage regulator module: transistors, chokes (coils), and capacitors around the CPU socket that lower and steady PSU power into the small, stable voltage the CPU needs. VRMs warm up under load and often carry heatsinks.',
      },
      {
        term: 'Headers & BIOS / UEFI',
        text: 'Small edge headers connect case fans (CPU_FAN), front power/reset buttons, USB, RGB, and front audio. The BIOS (UEFI) is the built-in setup firmware (Delete or F2 at startup) used to check parts, set boot order, and enable RAM speed profiles.',
      },
      {
        term: 'Rear I/O panel',
        text: 'The ports at the back of the board (USB Type-A/C, video outputs for integrated graphics, audio jacks, Ethernet, and Wi-Fi antennas) covered by a metal shield.',
      },
      {
        term: 'CMOS battery',
        text: 'A silver coin-shaped battery in a round holder that keeps BIOS settings and the system clock running when the PC is off.',
      },
    ],
    parts: [
      {
        name: 'CPU socket',
        does: 'Holds the CPU; only a matching CPU fits (example: AM5 for current AMD DDR5, AM4 for older AMD DDR4, LGA 1700 for Intel 12th–14th Gen).',
        looksLike: 'A square frame, with pins either inside the socket (LGA) or on the CPU (PGA).',
        images: [
          pdfImg('hw2-socket-am5.jpg', 'An AMD AM5 CPU socket.', 'An AM5 socket (AMD LGA).'),
          pdfImg('hw2-socket-am4.jpg', 'An AMD AM4 CPU socket.', 'An AM4 socket (AMD PGA).'),
          pdfImg('hw2-socket-lga1700.jpg', 'An Intel LGA 1700 CPU socket.', 'An LGA 1700 socket (Intel LGA).'),
        ],
      },
      {
        name: 'DIMM slots',
        does: 'Hold the RAM sticks.',
        looksLike: 'Long thin slots next to the CPU with a clip at one or both ends.',
        images: [dimmSlots],
      },
      {
        name: 'PCIe x16 slot',
        does: 'Holds a graphics card. Smaller cards (x1, x4) also fit in longer x16 slots, so check the manual for how each slot is wired.',
        looksLike: 'The longest expansion slot, often with a release latch.',
        images: [
          pdfImg('hw2-pcie-x16.jpg', 'PCIe x16 expansion slots on a motherboard.', 'PCIe x16 slots on a motherboard.'),
        ],
      },
      {
        name: 'M.2 slot',
        does: 'Holds an M.2 SSD or Wi-Fi card with no cables.',
        looksLike: 'A small edge-connector slot with a screw post at the far end.',
        images: [m2Slot],
      },
      {
        name: 'SATA ports',
        does: 'Connect 2.5-inch and 3.5-inch SATA drives with cables.',
        looksLike: 'Small L-shaped connectors in a row along the board edge.',
        images: [
          pdfImg('hw2-sata-ports.jpg', 'A row of SATA ports along the edge of a motherboard.', 'SATA ports on a motherboard.'),
        ],
      },
      {
        name: '24-pin power connector',
        does: 'Brings main power from the PSU to the motherboard (paired with the 4-pin or 8-pin CPU power plug near the top-left).',
        looksLike: 'The largest plug-in block on the board, near the edge.',
        images: [plug24],
      },
      {
        name: 'Chipset, VRM and rear I/O panel',
        does: 'Chipset manages I/O tiers and lanes; VRM converts PSU power into steady CPU voltage; rear I/O connects external peripherals.',
        looksLike:
          'Chipset: a chip under a heatsink. VRM: transistors, coils, and capacitors around the CPU socket. Rear I/O: a metal plate of ports.',
        images: [
          pdfImg('hw2-chipset.jpg', 'A motherboard chipset chip.', 'The chipset.'),
          pdfImg('hw2-vrm.jpg', 'Voltage regulator components including coil and capacitors.', 'Voltage regulator module (VRM) components.'),
          pdfImg('hw2-rear-io.jpg', 'The metal rear I/O plate with USB, video, audio and network ports.', 'The rear I/O panel.'),
        ],
      },
      {
        name: 'CMOS battery',
        does: 'Keeps BIOS settings and the system clock when the PC is switched off.',
        looksLike: 'A silver coin cell in a round holder.',
        images: [
          pdfImg('hw2-cmos-battery.jpg', 'A silver coin cell battery in its round holder on a motherboard.', 'A CMOS battery in its holder.'),
        ],
      },
    ],
    notes: [
      {
        title: 'LGA vs. PGA pin safety',
        text: 'With LGA (AM5, LGA 1700), never touch inside the socket and lower the CPU straight down. With PGA (AM4), hold the CPU by its edges so you do not bend its pins. Never force a CPU into place.',
      },
      {
        title: 'Headers & BIOS / UEFI',
        text: 'Small edge headers look similar, so keep the motherboard manual open when plugging in CPU_FAN, front-panel power/reset pins, USB, RGB, and audio. On first boot, press Delete or F2 to open UEFI, confirm parts are detected, and check if a BIOS update is needed for a newer CPU.',
      },
      {
        title: 'Monitor port: motherboard vs. graphics card',
        text: 'The video ports (HDMI / DisplayPort) on the rear I/O panel belong to integrated CPU graphics. When you install a separate graphics card, plug your monitor into the graphics card—not the motherboard—or you will get a blank screen.',
      },
    ],
    keyPoints: [
      'A CPU only fits its matching socket (AM5, AM4, LGA 1700), while the chipset decides ports, lanes, and tuning tiers.',
      'RAM goes in DIMM slots (DDR4 or DDR5 only); graphics cards go in the PCIe x16 slot.',
      'Both the 24-pin ATX connector and the top-left 4/8-pin CPU power cable must be plugged in.',
      'The VRM regulates CPU voltage; the CMOS battery preserves BIOS settings and the clock.',
      'When a dedicated graphics card is installed, plug the monitor into the card rather than the rear I/O panel.',
    ],
    commonMistakes: [
      'Buying a CPU without checking both the socket and chipset/BIOS support list.',
      'Forgetting the 4-pin or 8-pin CPU power cable near the top-left corner, leaving the PC unable to start.',
      'Plugging the monitor into the motherboard rear I/O port instead of the dedicated graphics card.',
    ],
    references: [
      { title: 'Gaming Motherboard Buying Guide (Intel)', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html' },
      { title: 'What is a CMOS Battery and How do you Replace It? (Corsair)', url: 'https://www.corsair.com/us/en/explorer/gamer/gaming-pcs/what-is-a-cmos-battery-and-how-do-you-replace-it/' },
      { title: 'How to Install CPU on Motherboard (ASUS)', url: 'https://zentalk.asus.com/t5/faq/motherboard-how-to-install-cpu-on-motherboard/ta-p/408641' },
      { title: 'LGA vs PGA: Is One CPU Socket Type Better? (Corsair)', url: 'https://www.corsair.com/jp/zh/explorer/diy-builder/blogs/lga-vs-pga-is-one-cpu-socket-type-better-than-the-other/' },
      { title: 'What Are VRMs on a Motherboard? (Corsair)', url: 'https://www.corsair.com/zh/en/explorer/glossary/what-are-vrms-on-a-motherboard/' },
      { title: 'What Is a VRM? (Tom’s Hardware)', url: 'https://www.tomshardware.com/reviews/vrm-voltage-regulator-module-definition,5771.html' },
    ],
  },

  'hw-3': {
    key: 'hw-3',
    goal: 'Explain what RAM does, tell DDR4 from DDR5, choose the right capacity, and install sticks correctly.',
    definitions: [
      {
        term: 'RAM',
        text: 'Random access memory: short-term working memory where active programs and data sit so the CPU can reach them quickly. Unlike storage (a filing cabinet), RAM is the desk—and its contents are lost when the PC powers down.',
      },
      {
        term: 'DDR4 and DDR5',
        text: 'Two Double Data Rate generations with different pin layouts and key notch positions, so they are not interchangeable. DDR4 runs at 1.2 V (~2,666–3,600 MT/s) with board power control; DDR5 runs at 1.1 V (4,800+ MT/s) with on-stick power management and warmer operation.',
      },
      {
        term: 'Dual-channel',
        text: 'Using matched sticks (bought as a single kit such as 2 × 16 GB) in separate channels so the CPU can move data across two memory channels at once.',
      },
      {
        term: 'Speed & timings',
        text: 'Speed (MT/s or MHz, e.g. DDR5-6000) sets how much data moves per second, while timings (e.g. 36-36-36-76, led by CAS latency) set response delay—lower timings mean faster response at the same speed.',
      },
      {
        term: 'XMP and EXPO',
        text: 'Rated speed profiles stored on memory kits (XMP for Intel, EXPO for AMD). Without enabling them in the BIOS, RAM runs at a slower default speed.',
      },
    ],
    parts: [
      {
        name: 'RAM stick',
        does: 'Holds active data and instructions the CPU is working on.',
        looksLike: 'A narrow board (desktop DIMM) with memory chips, optional heat spreaders (especially on DDR5), and gold contacts.',
        images: [ramStick],
      },
      {
        name: 'Key notch',
        does: 'Makes sure only the right memory type fits and faces the right way. DDR4 and DDR5 notches sit in different positions.',
        looksLike: 'A small cut in the gold contact edge.',
        images: [
          pdfImg(
            'hw3-key-notch.jpg',
            'DDR4 RAM sticks showing the key notch along the gold contact edge.',
            'DDR4 RAM sticks showing the key notch on the gold contact edge.',
          ),
        ],
      },
      {
        name: 'DIMM slot with clips',
        does: 'Holds the stick. The clips at each end lock it in place.',
        looksLike: 'A long slot with a ridge that matches the notch and plastic clips at the ends.',
        images: [dimmSlots],
      },
    ],
    steps: [
      { text: 'Find the memory slots near the CPU and check the slot numbers in the motherboard manual.' },
      { text: 'Push the clips at the ends of the slot outward.' },
      { text: 'Line up the notch on the stick with the ridge in the slot.' },
      { text: 'Press straight down on both ends with firm, even pressure until the clips snap shut with a click.' },
      { text: 'Check that both clips are closed and the stick sits straight and level.' },
    ],
    notes: [
      {
        title: 'How much RAM is needed?',
        text: '8 GB is for basic browsing/office work and often too little today; 16 GB suits everyday use and most gaming; 32 GB fits heavy multitasking and video editing; 64 GB+ is for 3D work and virtual machines. Capacity matters more than speed on a budget: 16 GB of DDR4 beats 8 GB of DDR5.',
      },
      {
        title: 'Enable XMP or EXPO in BIOS',
        text: 'RAM kits ship at a safe default speed until you turn on XMP (Intel) or EXPO (AMD) during your first BIOS visit.',
      },
      {
        title: 'Check your board’s manual',
        text: 'Most four-slot boards (A1, A2, B1, B2) use slots A2 and B2 (the second and fourth) for two sticks, but boards vary—always confirm in the manual and avoid mixing brands or speeds.',
      },
      {
        title: 'If the PC does not start',
        text: 'Re-seat the sticks and listen for clicks on both sides, try one stick at a time to isolate a faulty module, verify the slot order, and be patient on first boot while the system trains memory.',
      },
    ],
    keyPoints: [
      'RAM is fast, short-term working memory and clears when power is off.',
      'DDR4 and DDR5 notches differ and cannot be mixed; the motherboard sets which type fits.',
      'Buy a matched kit in A2 and B2 (check your manual) for dual-channel bandwidth.',
      'Press both ends evenly until both clips click shut, then enable XMP or EXPO in BIOS.',
      'Capacity usually matters more than speed when choosing between 16 GB DDR4 and 8 GB DDR5.',
    ],
    commonMistakes: [
      'Forcing a DDR5 stick into a DDR4 slot (or the reverse), which can break the stick or slot.',
      'Putting two sticks next to each other on the same channel or mixing mismatched speeds.',
      'Pressing only one end so a clip stays half-open—the #1 reason a new build fails to post.',
    ],
    references: [
      { title: 'What Is RAM vs. Processor? (Intel)', url: 'https://www.intel.com/content/www/us/en/learn/what-is-ram-vs-processor.html' },
      { title: 'What is a CMOS Battery…? (Corsair)', url: 'https://www.corsair.com/us/en/explorer/gamer/gaming-pcs/what-is-a-cmos-battery-and-how-do-you-replace-it/' },
      { title: 'Is DDR5 Backwards Compatible? (Corsair)', url: 'https://www.corsair.com/explorer/diy-builder/memory/is-ddr5-backwards-compatible/' },
      { title: 'Gaming Motherboard Buying Guide (Intel)', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html' },
      { title: 'Which RAM slots should I use? (Corsair)', url: 'https://www.corsair.com/uk/en/explorer/diy-builder/memory/which-ram-slots-should-i-use/' },
      { title: 'How to Upgrade & Install RAM in your PC (Corsair)', url: 'https://www.corsair.com/explorer/diy-builder/memory/how-to-upgrade-ram-in-your-pc/' },
      { title: 'DDR5 vs DDR4: Is It Time to Upgrade Your RAM? (Tom’s Hardware)', url: 'https://www.tomshardware.com/features/ddr5-vs-ddr4-is-it-time-to-upgrade-your-ram' },
      { title: 'DDR4 vs DDR5: Should You Upgrade? (MakeUseOf)', url: 'https://www.makeuseof.com/ddr4-vs-ddr5-should-you-upgrade/' },
      { title: 'Is DDR5 Better Than DDR4? (Corsair)', url: 'https://www.corsair.com/ww/hu/explorer/diy-builder/memory/is-ddr5-better-than-ddr4/' },
    ],
  },

  'hw-4': {
    key: 'hw-4',
    goal: 'Tell HDDs, SATA SSDs, and NVMe M.2 SSDs apart, choose the right setup, and install each type properly.',
    definitions: [
      {
        term: 'Non-volatile storage',
        text: 'Permanent storage for files, apps, and the operating system—unlike RAM, it keeps everything saved when power is turned off.',
      },
      {
        term: 'HDD',
        text: 'A hard disk drive that stores data magnetically on spinning platters with a moving read-write arm. Cheapest per gigabyte for bulk storage, but slowest and sensitive to bumps.',
      },
      {
        term: 'SATA SSD',
        text: 'A solid-state drive using flash memory chips with no moving parts, connected via SATA data and power cables. Silent, durable, and far faster than an HDD, capped around 6 Gbit/s by SATA.',
      },
      {
        term: 'NVMe M.2 SSD',
        text: 'An SSD that talks over PCIe using the NVMe protocol and plugs straight into an M.2 slot with no cables. M.2 is only a shape (sized by width × length in mm, e.g. 2230, 2242, 2260, 2280, 22110), so an M.2 drive can be SATA or NVMe.',
      },
    ],
    parts: [
      {
        name: 'HDD',
        does: 'Lowest-cost bulk storage for videos and backups. Slower because a mechanical head must move across spinning platters.',
        looksLike: 'A 3.5-inch (or 2.5-inch) metal box containing shiny magnetic platters and a moving head arm.',
        images: [
          pdfImg('hw4-hdd-closed.jpg', 'A closed 3.5-inch hard disk drive.', 'A 3.5-inch hard disk drive (HDD).'),
          pdfImg('hw4-hdd.jpg', 'An open 3.5-inch hard drive showing the platters and the head arm.', 'An open 3.5-inch HDD showing platters and heads.'),
        ],
      },
      {
        name: 'SATA SSD',
        does: 'Quiet, shock-resistant flash storage that is a major upgrade over an HDD when no M.2 slot is free, connected with separate SATA data and power cables.',
        looksLike: 'A thin 2.5-inch case with L-shaped SATA data and power connectors.',
        images: [
          pdfImg('hw4-sata-ssd.jpg', 'A thin 2.5-inch SATA SSD in its case.', 'A 2.5-inch SATA SSD.'),
        ],
      },
      {
        name: 'M.2 SSD',
        does: 'Fastest everyday storage for the OS, games, and apps. PCIe 3.0 x4 NVMe drives run 6–7× faster than SATA SSDs, and PCIe 4.0/5.0 drives are faster still on boards that support them.',
        looksLike: 'A short stick about 22 mm wide; the common desktop 2280 size is 80 mm long.',
        images: [m2Ssd],
      },
      {
        name: 'M.2 slot',
        does: 'Holds the M.2 SSD directly on the motherboard with no cables.',
        looksLike: 'A small keyed edge slot with a standoff screw post (or latch) and sometimes a heatshield.',
        images: [m2Slot],
      },
    ],
    steps: [
      { text: 'Find the M.2 slot in the motherboard manual and remove its heatshield if it has one.' },
      { text: 'Check that the standoff post sits at the right length position for your drive (usually 2280).' },
      { text: 'Insert the M.2 SSD into the keyed slot at an angle (never force it), then gently lay it flat onto the standoff.' },
      { text: 'Secure it with the tiny M.2 screw or board latch without overtightening.' },
      { text: 'Put the heatshield back if the slot had one and the SSD does not already carry its own heatsink.' },
    ],
    notes: [
      {
        title: 'Comparing HDD, SATA SSD, and NVMe M.2 SSD',
        text: 'One maker notes entry SSDs are roughly 10× faster than spinning HDDs, and PCIe 3.0 x4 NVMe drives run 6–7× faster than SATA SSDs. Cost per gigabyte rises alongside speed from HDD to SATA SSD to NVMe.',
      },
      {
        title: 'Choosing a storage setup & backups',
        text: 'Simple build: one NVMe SSD for everything. Large library: an NVMe SSD for the OS and games plus an HDD for bulk files. Budget: a SATA SSD if no M.2 slot is available. Always keep backups on another drive or in the cloud, because any drive can fail.',
      },
      {
        title: 'How to install a SATA drive',
        text: 'Mount the 2.5-inch or 3.5-inch drive in a case bay or bracket to prevent vibration, then plug an L-shaped SATA data cable to the motherboard and an L-shaped SATA power cable from the PSU. Both are required.',
      },
    ],
    keyPoints: [
      'Storage keeps files permanently when power is off; RAM forgets at power-off.',
      'HDD: spinning platters and moving arm—slowest, but cheapest per GB for bulk files.',
      'SATA SSD: flash memory with no moving parts, limited to ~6 Gbit/s and using data + power cables.',
      'NVMe M.2 SSD: plugs into an M.2 slot over PCIe with no cables and runs far faster than SATA.',
      'M.2 is a shape (typically 2280), not a speed—confirm NVMe support, length fit, and keep backups.',
    ],
    commonMistakes: [
      'Assuming every M.2 drive is NVMe, or forgetting to verify length (such as 2280) and PCIe generation support.',
      'Installing a SATA drive with only a data cable or only a power cable—both are needed for it to appear.',
      'Treating RAM and storage as interchangeable, or skipping backups of important files.',
    ],
    references: [
      { title: 'Hard Drives and SSDs (Seagate)', url: 'https://www.seagate.com/innovation/hard-drives-and-ssds/' },
      { title: 'HDD vs. SSD: How Do They Store Data? (Seagate)', url: 'https://www.seagate.com/blog/how-do-hdds-and-ssds-store-data/' },
      { title: 'SSD vs HDD (SanDisk)', url: 'https://shop.sandisk.com/solutions/ssd-vs-hdd' },
      { title: 'SSD vs HDD Differences (Kingston)', url: 'https://kingston.com/en/blog/personal-storage/ssd-vs-hdd-differences' },
      { title: 'NVMe vs SATA SSDs (SanDisk)', url: 'https://www.sandisk.com/topics/nvme-vs-sata-ssds' },
      { title: 'What is NVMe SSD technology? (Samsung Semiconductor Insights)', url: 'https://insights.samsung.com/2024/01/26/what-is-nvme-ssd-technology' },
      { title: 'SSD vs HDD Tested (Tom’s Hardware)', url: 'https://www.tomshardware.com/uk/features/ssd-vs-hdd-hard-drive-difference' },
      { title: 'HDD vs SSD: Which Storage Solution Is Best? (ITPro)', url: 'https://www.itpro.com/uk/hardware/360050/hdd-vs-ssd-which-storage-solution-is-best-for-you' },
      { title: 'How to Install a Corsair M.2 SSD (Corsair)', url: 'https://www.corsair.com/uk/bp/explorer/diy-builder/storage/how-to-install-a-corsair-m2-solid-state-drive/' },
      { title: 'M.2 SSD Quick Start Guide (Corsair)', url: 'https://corsair.com/explorer/diy-builder/storage/m2-ssd' },
      { title: 'Gaming Motherboard Buying Guide (Intel)', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html' },
    ],
  },

  'hw-5': {
    key: 'hw-5',
    goal: 'Explain what a PSU does, how to size one, and how to handle parts safely.',
    definitions: [
      {
        term: 'Power supply unit (PSU)',
        text: 'The part that turns AC power from the wall outlet into the DC power the components use, while keeping it clean and stable. Some energy is lost as heat.',
      },
      {
        term: 'Wattage rating',
        text: 'The most power the PSU can supply. To size one, add the power draw of the graphics card and CPU, about 150 W for the rest, and another 150 W of headroom.',
      },
      {
        term: '24-pin ATX connector',
        text: 'The main power cable that plugs into the motherboard.',
      },
    ],
    parts: [
      {
        name: 'PSU',
        does: 'Powers the whole PC. Most builds use the ATX size; small cases may use SFX or SFX-L.',
        looksLike: 'A metal box with a fan, a power-cord socket and a bundle of cables.',
        images: [
          img(
            'hw5-psu.jpg',
            'A black ATX power supply unit showing its cooling fan, power switch, and AC power socket.',
            'An ATX power supply unit.',
            { available: true, credit: ASSET_CREDIT },
          ),
        ],
      },
      {
        name: '24-pin connector',
        does: 'Main board power. On many units the last four pins can detach as a 4-pin plug, so the plug also fits older 20-pin boards.',
        looksLike: 'A wide two-row plug.',
        images: [plug24],
      },
      {
        name: 'Other power cables',
        does: 'Commonly an 8-pin CPU plug, PCIe plugs for graphics cards, SATA power and Molex.',
        looksLike: 'Bundles of colored wires ending in plugs of different shapes.',
        verify: 'Corsair’s article does not list these cables; the source is a Commons photo description.',
        images: [
          pdfImg(
            'hw5-other-cables.jpg',
            'PSU power cables with CPU and PCIe connectors.',
            'PSU power cables (CPU and PCIe connectors).',
          ),
        ],
      },
    ],
    notes: [
      {
        title: 'Cable styles',
        text: 'Fully modular PSUs have no fixed cables. Semi-modular ones keep the main motherboard and CPU cables fixed. Non-modular ones have every cable attached.',
      },
      {
        title: 'Static safety',
        text: 'Touch the bare metal case before handling parts. Corsair says grounding is not strictly necessary because modern parts resist static, and that dropping or forcing parts is the bigger risk. If you want to be careful, touch a grounded metal object now and then, for example the PSU while it is plugged in but switched off. There is no downside to doing so. The safe habit is to touch bare metal, and to handle parts gently.',
      },
    ],
    keyPoints: [
      'A PSU converts wall AC into low-voltage DC.',
      'Size it: GPU + CPU + about 150 W + 150 W headroom.',
      'The 24-pin connector powers the motherboard.',
      'Modular PSUs let you plug in only the cables you need.',
      'Touch bare metal before handling parts, and handle them gently.',
    ],
    commonMistakes: [
      'Ignoring the wattage estimate and buying a PSU that is too small.',
      'Mixing up cables because plugs look similar, instead of matching shapes.',
      'Dropping or forcing parts, which Corsair names as a real cause of damage.',
    ],
    references: [
      { title: 'How to Pick a Power Supply (Corsair)', url: 'https://www.corsair.com/explorer/diy-builder/power-supply-units/how-to-pick-a-power-supply/' },
      { title: 'Gaming Motherboard Buying Guide (Intel)', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html' },
      { title: 'Do you really need to ground yourself before touching PC components? (Corsair)', url: 'https://www.corsair.com/explorer/diy-builder/how-tos/do-you-really-need-to-ground-yourself-before-touching-pc-components/' },
      { title: 'Commons file description: 24-pin ATX power plug (connector names only)', url: 'https://commons.wikimedia.org/wiki/File:24-pin_ATX_power_plug_from_a_Seasonic_PSU_20131105.jpg', note: 'Not a trusted-list source (VERIFY).' },
      { title: 'Commons file description: PC power supply connectors (connector names only)', url: 'https://commons.wikimedia.org/wiki/File:PC-Netzteilanschluesse_ATX2_numbered_IMGP2167_smial_wp.jpg', note: 'Not a trusted-list source (VERIFY).' },
    ],
  },

  'hw-6': {
    key: 'hw-6',
    goal: 'Put the parts together in order, safely. No new theory.',
    definitions: [],
    definitionsNote: 'No new terms. Use the definitions from Lessons 1 to 5.',
    parts: [
      {
        name: 'CPU and cooler',
        does: 'The CPU goes in its matching socket. The cooler and thermal paste take the heat away.',
        images: [cpu, cpuCooler, thermalPaste],
      },
      {
        name: 'RAM',
        does: 'Goes in the DIMM slots, A2 and B2 for two sticks unless the manual says otherwise.',
        images: [ramStick],
      },
      {
        name: 'M.2 SSD',
        does: 'Goes in the M.2 slot.',
        images: [m2Ssd],
      },
      {
        name: 'Graphics card',
        does: 'Goes in the PCIe x16 slot.',
        images: [
          img(
            'hw6-graphics-card.jpg',
            'A triple-fan graphics card showing its PCIe x16 edge connector and rear display outputs.',
            'A triple-fan graphics card.',
            { available: true, credit: ASSET_CREDIT },
          ),
        ],
      },
      {
        name: 'Power cables',
        does: 'The 24-pin connector goes to the motherboard, plus the CPU and graphics-card power cables your parts need.',
        images: [plug24],
      },
    ],
    steps: [
      { text: 'Safety first. Work gently and touch bare metal now and then; Corsair calls this optional but harmless. Do not force any part.' },
      {
        text: 'Install the CPU in its matching socket. Never push the CPU down into the socket by force.',
        verify: 'Add an Intel or AMD install page (CPU socket install steps are NOT FOUND).',
      },
      { text: 'Mount the cooler. Clean off old paste, apply a small amount of new paste as the cooler maker’s manual shows, fit the mounting parts, tighten gently, and plug the fan into the CPU fan header.' },
      { text: 'Insert the RAM. Open the clips, line up the notch, press until both clips click. Use A2 and B2 for two sticks unless your manual says otherwise.' },
      {
        text: 'Install the M.2 SSD in the M.2 slot.',
        verify: 'Add the screw step from a board manual.',
      },
      { text: 'Install the graphics card in the PCIe x16 slot.' },
      { text: 'Connect the power cables: the 24-pin connector to the motherboard, plus the CPU and graphics-card power cables your parts need.' },
    ],
    keyPoints: [
      'CPU first, then cooler, RAM, SSD, graphics card, then power cables.',
      'Match notches and shapes. If it does not fit easily, check again.',
      'Use little thermal paste.',
      'Press RAM until the clips click.',
      'Handle parts gently; touch bare metal as a habit.',
    ],
    commonMistakes: [
      'Using too much thermal paste or leaving old paste on.',
      'Not seating RAM fully, so one clip stays open.',
      'Forgetting a power cable, such as the CPU power plug.',
    ],
    references: [
      { title: 'Do you really need to ground yourself…? (Corsair)', url: 'https://www.corsair.com/explorer/diy-builder/how-tos/do-you-really-need-to-ground-yourself-before-touching-pc-components/' },
      { title: 'Noctua NH-U12A installation manual', url: 'https://noctua.at/pub/media/blfa_files/manual/noctua_nh_u12a_manual_en_web_4.pdf', note: 'Search excerpt only.' },
      { title: 'Noctua NH-L9x65 installation manual', url: 'https://noctua.at/pub/media/blfa_files/manual/noctua_nh_l9x65_manual_en_web_2.pdf', note: 'Search excerpt only.' },
      { title: 'How to Upgrade & Install RAM in your PC (Corsair)', url: 'https://www.corsair.com/explorer/diy-builder/memory/how-to-upgrade-ram-in-your-pc/' },
      { title: 'What is NVMe SSD technology? (Samsung)', url: 'https://insights.samsung.com/2024/01/26/what-is-nvme-ssd-technology' },
      { title: 'Gaming Motherboard Buying Guide (Intel)', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html' },
      { title: 'How to Pick a Power Supply (Corsair)', url: 'https://www.corsair.com/explorer/diy-builder/power-supply-units/how-to-pick-a-power-supply/' },
    ],
  },
};
