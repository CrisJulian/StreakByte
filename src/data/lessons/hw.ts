import type { LessonContent } from './types';
import { img } from './helpers';

/**
 * Hardware Basics lesson content, structured by section from ads/hardware.pdf (Lessons 1-4)
 * plus StreakByte's existing Lessons 5-6.
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
const otherCables = pdfImg(
  'hw5-other-cables.jpg',
  'PSU power cables with CPU and PCIe connectors.',
  'PSU power cables (CPU and PCIe connectors).',
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
    sections: [
      {
        number: '1.1',
        title: 'The PC case',
        blocks: [
          {
            paragraphs: [
              'The PC case, also called the chassis, is the box that holds and protects the parts of a PC. It also controls how air flows over the parts, how cables are routed, and how many drives, fans and radiators can be fitted. Case sizes are called form factors. They do not always match motherboard sizes exactly, so the motherboards a case supports must always be checked.',
            ],
            table: {
              headers: ['Case type', 'Rough height', 'Motherboards supported', 'Best for'],
              rows: [
                ['Small form factor (SFF)', '8–12 in (20–30 cm)', 'Mini-ITX; some also Micro-ATX', 'Small desks, compact builds'],
                ['Mini tower', 'Between SFF and mid tower', 'Micro-ATX, Mini-ITX', 'Budget builds, easier than SFF'],
                ['Mid tower', '18–20 in (46–51 cm)', 'ATX, Micro-ATX, Mini-ITX', 'Most builders and beginners'],
                ['Full tower', '20 in (51 cm) and taller', 'E-ATX, ATX, Micro-ATX, Mini-ITX', 'Custom water cooling, many drives'],
              ],
            },
            images: [
              pdfImg(
                'hw1-case.jpg',
                'A computer case with the side panel open and parts inside.',
                'A PC case with parts inside.',
              ),
            ],
            imageSide: 'right',
          },
          {
            bullets: [
              'SFF cases are the smallest option. Some use a sandwich layout, with the graphics card behind the motherboard on a riser cable. Space is tight, airflow is limited and dust collects faster, so they are usually recommended for experienced builders.',
              'Mini towers fit larger graphics cards, coolers, fans and normal-size power supplies more easily than SFF cases, but have less room than a mid tower.',
              'Mid towers are the most popular size, with room for graphics cards, coolers, radiators and several drives, and easy cable routing.',
              'Full towers are large and heavy and are becoming rarer. They suit custom cooling loops, many drives or an E-ATX board.',
              'Sizes vary by brand, so the figures are a guide only.',
            ],
            paragraphs: [
              'Main parts of a case: the front I/O panel (power button, USB ports, headphone jack); fan and radiator mounts (radiators up to 420 mm in some models); drive bays for 2.5-inch and 3.5-inch drives; dust filters; cable management space behind the motherboard tray; and a PSU shroud.',
              'Before buying a case, check the supported motherboard size, graphics card length (some cards exceed 32 cm or 13 in), CPU cooler height and radiator size, power supply size (small cases may take only SFX or SFX-L), airflow (mesh fronts admit more air than solid panels), and the desk space available.',
            ],
            images: [
              pdfImg(
                'hw1-case-sizes.jpg',
                'Comparison of PC case sizes from small form factor to full tower.',
                'PC case form factors compared by size.',
              ),
            ],
            imageSide: 'left',
          },
          {
            heading: 'Explanation',
            paragraphs: [
              'A case does three jobs at once: it protects the components, it manages airflow, and it sets the physical limits of the whole build. Every other part must fit inside the space the case provides, which is why the case is often chosen early and why its specification sheet deserves careful reading.',
              'The table shows a simple trade-off between size and freedom. Smaller cases save desk space but restrict which motherboards, coolers and power supplies fit, and they leave little room for working by hand. Larger cases are more forgiving. This is why the mid tower is recommended for a first build: it gives enough room to install parts, route cables and recover from a wrong choice without forcing anything into place.',
              "The buying checklist is best read as a set of separate fit questions. Motherboard support, graphics card length, cooler height, radiator size and power supply size are independent limits, and a case can satisfy one while failing another. A case that accepts an ATX board, for example, may still be too short for a very long graphics card. Comparing each part's dimensions with the case's published limits before purchase prevents most compatibility problems. Airflow deserves the same attention as appearance: a solid glass front looks clean but restricts the air that cools the parts, while a mesh front admits more.",
            ],
          },
        ],
      },
      {
        number: '1.2',
        title: 'The motherboard',
        blocks: [
          {
            paragraphs: [
              'The motherboard is the main circuit board of the PC. The CPU, memory, storage and expansion cards all plug into it, and its chipset passes messages between the CPU and the other devices. Motherboard size is one of the biggest factors in choosing a case. Bigger boards have more slots and ports but need a bigger case.',
            ],
            table: {
              headers: ['Form factor', 'Size (in)', 'Size (mm)', 'Expansion slots', 'Fits in'],
              rows: [
                ['E-ATX', 'Up to 13.6 × 13', 'Up to 345 × 330', '7 or more', 'Full towers (some large mid towers)'],
                ['ATX', '12 × 9.6', '305 × 244', 'Up to 7', 'Mid and full towers'],
                ['Micro-ATX', '9.6 × 9.6', '244 × 244', 'Up to 4', 'Mini, mid and full towers'],
                ['Mini-ITX', '6.7 × 6.7', '170 × 170', '1', 'Any case, including SFF'],
              ],
            },
            images: [
              pdfImg(
                'hw1-motherboard.jpg',
                'A modern ATX motherboard.',
                'A modern ATX motherboard.',
              ),
            ],
            imageSide: 'right',
          },
          {
            paragraphs: [
              'A smaller board can go in a larger case, but a larger board will not fit a smaller case. Mini-ITX boards often cost more than Micro-ATX boards and have fewer memory slots and ports.',
              'The motherboard is the part that connects everything else, so its size determines how much the PC can grow. A larger board offers more memory slots, more expansion slots and more ports. A smaller board gives up some of that in exchange for fitting in a smaller case.',
              'The compatibility rule is directional: a board can always go into a case designed for a larger size, never the reverse. In practice, the builder picks a board for the features needed and then chooses a case that supports its size. Mini-ITX is the exception to the idea that smaller means cheaper. Fitting a full set of features onto a very small board is difficult, and that engineering cost is reflected in the price, while the learner also gives up memory slots and ports.',
            ],
            images: [
              pdfImg(
                'hw1-motherboard-sizes.jpg',
                'Comparison of ATX, Micro-ATX, and Mini-ITX motherboard sizes.',
                'Motherboard form factors: ATX, Micro-ATX, and Mini-ITX.',
              ),
            ],
            imageSide: 'left',
          },
        ],
      },
      {
        number: '1.3',
        title: 'The CPU',
        blocks: [
          {
            paragraphs: [
              'The CPU (central processing unit, or processor) is the brain of the computer. It runs the instructions of programs and does the calculations. It is a small square chip with metal contacts on one side, and it produces heat because it works hard.',
            ],
            bullets: [
              { label: 'Cores and threads', text: 'each core can work on its own task, so more cores help with multitasking and heavy work such as video editing. Threads let one core handle more than one stream of instructions.' },
              { label: 'Clock speed', text: 'measured in gigahertz (GHz), it shows cycles per second. A higher number usually means faster work, but only when comparing similar CPUs.' },
              { label: 'Cache', text: 'a small amount of very fast memory inside the CPU that holds frequently used data.' },
              { label: 'Integrated graphics', text: 'some CPUs include a small graphics unit, so a monitor works without a separate graphics card.' },
              { label: 'Socket', text: 'the CPU must match the motherboard socket (see Lesson 2).' },
              { label: 'Makers', text: 'the two main desktop CPU makers are Intel and AMD.' },
              'Some CPUs include a cooler in the box and some do not.',
            ],
            images: [cpu],
            imageSide: 'right',
          },
          {
            paragraphs: [
              'The CPU is where program instructions are carried out, so its design affects almost everything the PC does. Cores set how many tasks can run side by side. Threads let each core make better use of its time. Clock speed sets how quickly each core works. Cache reduces waiting by keeping the most-used data close at hand.',
              "No single figure tells the whole story. Clock speed is only a fair comparison between similar CPUs, because a newer design can complete more work per cycle than an older one running at a higher frequency. A sound choice therefore weighs core count, generation and the intended use together. Two practical points complete the picture: the CPU must match the board's socket, and a CPU without integrated graphics needs a separate graphics card before the PC can show an image. Checking whether a cooler is included avoids an unplanned extra purchase.",
            ],
          },
        ],
      },
      {
        number: '1.4',
        title: 'The CPU cooler',
        blocks: [
          {
            paragraphs: [
              'A CPU cooler pulls heat away from the CPU so it stays at a safe temperature. A CPU that gets too hot slows itself down to protect itself, and stronger CPUs need stronger cooling.',
              'Air coolers use a metal heatsink (a block of thin fins) with one or more fans. Heat moves from the CPU into the heatsink and the fan blows air through the fins. Advantages: simple, reliable, no liquid to leak, usually cheaper. Disadvantage: large tower coolers can block RAM slots or not fit a smaller case.',
            ],
            images: [cpuCooler],
            imageSide: 'right',
          },
          {
            paragraphs: [
              'AIO (all-in-one) liquid coolers have a pump block on the CPU, tubes carrying liquid, and a radiator with fans mounted on the case. Liquid carries heat better than air, and the radiator can push hot air out of the case. Radiator sizes are 120, 240, 280, 360 and 420 mm; a larger radiator cools more but needs room. Advantages: strong cooling for hot CPUs and a tidy look. Disadvantages: higher cost and a pump that can fail over time.',
            ],
            images: [
              pdfImg(
                'hw1-aio-cooler.jpg',
                'An all-in-one (AIO) liquid CPU cooler with pump block, tubes, and radiator fans.',
                'An AIO liquid CPU cooler.',
              ),
            ],
            imageSide: 'left',
          },
          {
            table: {
              headers: ['Feature', 'Air cooler', 'AIO liquid cooler'],
              rows: [
                ['Main parts', 'Heatsink and fans', 'Pump block, tubes, radiator and fans'],
                ['Cooling power', 'Good to very good', 'Good to excellent'],
                ['Price', 'Usually lower', 'Usually higher'],
                ['Upkeep', 'Dust cleaning', 'Dust cleaning; pump may age'],
                ['Case needs', 'Enough height for the cooler', 'A radiator mount of the right size'],
              ],
            },
            paragraphs: [
              'A CPU converts electrical power into work and heat. If the heat is not removed, the CPU lowers its own speed to protect itself, so a weak cooler directly reduces performance. The purpose of the cooler is to keep the processor within a safe temperature range while it runs at full speed.',
              "Both designs follow the same principle of moving heat away from the CPU, but they do it differently. An air cooler transfers heat into metal fins and lets moving air carry it off. An AIO moves heat through liquid to a radiator at the edge of the case, which can remove it more effectively and keeps the area around the CPU uncluttered. Neither is better in every case. The right choice depends on how much heat the CPU produces, how much space the case offers, and the budget. An air cooler is the dependable, lower-cost option; an AIO suits hot CPUs and builders who want its appearance, at a higher price and with a pump that eventually ages. In both cases, physical fit has to be confirmed: tower height against the case, and radiator size against the case's mounts.",
            ],
          },
        ],
      },
      {
        number: '1.5',
        title: 'Thermal paste',
        blocks: [
          {
            paragraphs: [
              'Thermal paste is placed between the CPU and the cooler. The two metal surfaces look flat but contain tiny gaps filled with air, which conducts heat poorly. The paste fills those gaps so heat passes across more easily.',
            ],
            bullets: [
              { label: 'Amount', text: 'a pea-sized or rice-grain-sized amount is enough. Too much lowers cooling performance.' },
              { label: 'Pre-applied paste', text: 'many coolers come with paste on the base; if so, do not add more.' },
              { label: 'Old paste', text: 'clean it off with isopropyl alcohol and a lint-free cloth before applying new paste.' },
              { label: 'Types', text: 'most pastes are non-conductive and safe for beginners. Metal-based pastes such as liquid metal conduct electricity and can damage parts, so they are for experts only.' },
            ],
            images: [thermalPaste],
            imageSide: 'right',
          },
          {
            paragraphs: [
              'The purpose of thermal paste is to replace trapped air with a material that conducts heat far better. It is not a layer to build up. The metal surfaces should still make direct contact, with the paste only filling the microscopic gaps, which is why a small amount performs better than a large one. An excess layer acts as an extra barrier and raises temperatures.',
              'Three habits follow from this. Check whether the cooler already carries paste before applying any. Clean away old paste fully before reapplying. And choose a non-conductive paste, because a conductive one can short-circuit nearby parts if it spreads. Applying thermal paste correctly is a small step with a measurable effect on how cool the CPU runs.',
            ],
            images: [
              pdfImg(
                'hw1-thermal-paste-clean.jpg',
                'Cleaning old thermal paste off a cooler base with a cloth.',
                'Wiping off old thermal paste before applying new paste.',
              ),
            ],
            imageSide: 'left',
          },
        ],
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
    sections: [
      {
        number: '2.1',
        title: 'The CPU socket',
        blocks: [
          {
            paragraphs: [
              "The CPU socket is where the CPU sits on the board. A CPU fits only the socket it was made for, and installing it in an unsupported socket can damage it. The motherboard's supported CPU list must be checked before buying.",
            ],
            table: {
              headers: ['Socket', 'Maker', 'Design', 'Notes'],
              rows: [
                ['AM5', 'AMD', 'LGA', 'Current AMD desktop socket, uses DDR5'],
                ['AM4', 'AMD', 'PGA', 'Older AMD socket, uses DDR4'],
                ['LGA 1700', 'Intel', 'LGA', 'Intel 12th to 14th Gen desktop CPUs'],
              ],
            },
            images: [
              pdfImg(
                'hw2-cpu-socket.jpg',
                'An open LGA CPU socket on a motherboard showing the contact pins inside.',
                'A CPU socket on a motherboard.',
              ),
            ],
            imageSide: 'right',
          },
          {
            paragraphs: [
              "Socket names change as new CPU generations arrive, so the maker's website should be checked for the newest list. Two designs exist. In LGA (Land Grid Array) the CPU has flat contacts and the pins sit inside the socket, so bent pins are a risk on the board. In PGA (Pin Grid Array) the pins are on the CPU itself, so bent pins are a risk on the CPU.",
              'The socket is the first compatibility gate in any build. Each CPU generation is designed for a specific socket, so the CPU and the board must be chosen as a pair. Buying one without checking the other is the most common way to end up with parts that cannot be used together.',
              "The LGA and PGA designs differ in where the fragile pins are located, and that determines where care is needed. With LGA, the pins are in the socket, so the board must not be touched inside the socket and the CPU must be lowered straight down. With PGA, the pins are on the CPU, so it must be held by its edges and set gently into the socket. In both cases the guidance is the same: align carefully, never force, and check the maker's list because socket names change over time.",
            ],
            images: [
              pdfImg('hw2-socket-am5.jpg', 'An AMD AM5 CPU socket.', 'An AM5 socket (AMD LGA).'),
              pdfImg('hw2-socket-am4.jpg', 'An AMD AM4 CPU socket.', 'An AM4 socket (AMD PGA).'),
              pdfImg('hw2-socket-lga1700.jpg', 'An Intel LGA 1700 CPU socket.', 'An LGA 1700 socket (Intel LGA).'),
            ],
            imageSide: 'left',
          },
        ],
      },
      {
        number: '2.2',
        title: 'The chipset',
        blocks: [
          {
            paragraphs: [
              'The chipset is a chip on the motherboard that works with specific CPU generations. It decides how many extra USB ports, SATA ports, PCIe lanes and storage slots the board offers, and whether features such as overclocking are allowed. Chipsets come in tiers from budget to high end, and a more expensive chipset usually means more features. Two boards with the same socket can have different chipsets.',
              'The socket decides which CPU fits, but the chipset decides what the board can do with it. Two boards with an identical socket can differ widely in the number of ports, storage slots and tuning options, simply because their chipsets sit in different tiers. A useful comparison is two cars with the same engine, one with basic equipment and one with the full package.',
              'The practical lesson is to compare specifications, not only sockets. A budget-tier chipset is a sensible choice for a straightforward build, while a higher tier is justified when many drives, many USB devices or overclocking are planned. Paying for features that will never be used is as much a mistake as buying a board that lacks a feature that is needed.',
            ],
            images: [
              pdfImg('hw2-chipset.jpg', 'A motherboard chipset chip.', 'The chipset.'),
            ],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '2.3',
        title: 'Memory, graphics and storage connections',
        blocks: [
          {
            heading: 'DIMM slots',
            paragraphs: [
              'DIMM slots hold memory sticks (RAM). They are long, thin slots next to the CPU with a clip at one or both ends. Full-size ATX boards usually have four and Mini-ITX boards usually have two. A board supports either DDR4 or DDR5, never both.',
            ],
            images: [dimmSlots],
            imageSide: 'right',
          },
          {
            heading: 'PCIe slots',
            paragraphs: [
              'PCIe slots connect expansion cards. Sizes are x1, x4, x8 and x16, showing how many data lanes they have. The x16 slot is usually the longest and is most often used for a graphics card. Smaller cards fit in larger slots, so check which slot is wired for what.',
            ],
            images: [
              pdfImg('hw2-pcie-x16.jpg', 'PCIe x16 expansion slots on a motherboard.', 'PCIe x16 slots on a motherboard.'),
            ],
            imageSide: 'left',
          },
          {
            heading: 'M.2 slot',
            paragraphs: [
              'M.2 slot: a small slot for NVMe SSDs and Wi-Fi cards that plug straight into the board with no cable. It usually has a screw post at the far end and may have a heatshield.',
            ],
            images: [m2Slot],
            imageSide: 'right',
          },
          {
            heading: 'SATA ports & PCIe generations',
            bullets: [
              { label: 'SATA ports', text: 'small L-shaped connectors for 2.5-inch and 3.5-inch drives. SATA 3 runs at up to 6 Gbit/s.' },
              { label: 'PCIe generations', text: 'PCIe comes in generations (3.0, 4.0, 5.0), and each new one roughly doubles the speed per lane. A card from a newer generation still works in an older slot, at the older, slower speed.' },
            ],
            images: [
              pdfImg('hw2-sata-ports.jpg', 'A row of SATA ports along the edge of a motherboard.', 'SATA ports on a motherboard.'),
            ],
            imageSide: 'left',
          },
          {
            paragraphs: [
              'Each type of component has its own connection on the board, and recognising them is the foundation of reading a motherboard. Memory goes in the DIMM slots, expansion cards go in the PCIe slots, compact SSDs go directly into M.2, and traditional drives connect by cable to SATA ports.',
              'PCIe is easiest to understand as a road. The number after the x is the number of lanes, which is the width of the road, and the generation is its speed limit. A longer slot is not automatically wired for full width, so the manual should be checked for how each slot is connected. Because newer cards work in older slots at the older speed, compatibility is rarely a problem, but speed can be lost when a fast card is placed in a slower slot. The memory type is fixed by the board, so DDR4 and DDR5 cannot be exchanged.',
            ],
          },
        ],
      },
      {
        number: '2.4',
        title: 'Power-related parts',
        blocks: [
          {
            heading: '24-pin power connector',
            paragraphs: [
              'The largest plug-in block, near the edge of the board. The power supply cable plugs in here and brings main power to the board.',
            ],
            images: [plug24],
            imageSide: 'right',
          },
          {
            heading: 'CPU power connector (4-pin or 8-pin)',
            paragraphs: [
              'Near the top-left corner. It gives the CPU extra power. Many boards have one 8-pin and some high-end boards have two.',
            ],
            images: [otherCables],
            imageSide: 'left',
          },
          {
            heading: 'VRM (voltage regulator module)',
            paragraphs: [
              "Transistors, chokes (coils) and capacitors around the CPU socket. It lowers and steadies the PSU's power into the small, stable voltage the CPU needs. Better VRMs matter most for overclocking. VRMs get hot, so boards often fit heatsinks over them.",
            ],
            images: [
              pdfImg('hw2-vrm.jpg', 'Voltage regulator components including coil and capacitors.', 'Voltage regulator module (VRM) components.'),
            ],
            imageSide: 'right',
          },
          {
            heading: 'CMOS battery',
            paragraphs: [
              'A silver coin-shaped battery in a round holder. It keeps BIOS settings and the clock running when the PC is off.',
            ],
            images: [
              pdfImg('hw2-cmos-battery.jpg', 'A silver coin cell battery in its round holder on a motherboard.', 'A CMOS battery in its holder.'),
            ],
            imageSide: 'left',
          },
          {
            paragraphs: [
              'The power supply delivers power at voltages that are not suitable for the CPU directly. The board therefore has to distribute and convert it. The 24-pin connector brings in the main supply, the CPU connector provides the extra power the processor needs, and the VRM converts that supply into the small, steady voltage the CPU requires. A good analogy is a pressure regulator on a water line: it takes a strong, variable flow and delivers a controlled one.',
              'Because the VRM works constantly and warms up, its quality matters most when the CPU is pushed hard, which is why overclocking boards carry stronger VRMs and heatsinks. The CMOS battery is a small but useful part: it keeps the clock and BIOS settings stored while the PC is switched off. A frequent beginner error is leaving out the CPU power cable, and the PC will not start without it.',
            ],
          },
        ],
      },
      {
        number: '2.5',
        title: 'Headers and other small connectors',
        blocks: [
          {
            paragraphs: [
              "Along the edges of the board are small connectors called headers: fan headers (the CPU fan header is usually labelled CPU_FAN), the front panel header (power button, reset button and LEDs), USB headers (front USB ports), RGB headers (lighting strips and lit fans), and the audio header (headphone and microphone jack). The board's manual has a diagram of every header.",
              "Headers are how the case's own features connect to the board. Without them, the power button, front USB ports and fans would have nothing to plug into. Because the pins are small and similar in appearance, their positions and orientation must be confirmed from the manual rather than guessed. Keeping the manual open during the build is a simple habit that prevents most header mistakes, such as plugging a fan into the wrong header or reversing a connector.",
            ],
            images: [
              pdfImg(
                'hw2-headers.jpg',
                'Close-up of a 4-pin chassis fan header next to a motherboard edge connector.',
                'A 4-pin fan header along the edge of a motherboard.',
              ),
            ],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '2.6',
        title: 'The BIOS / UEFI',
        blocks: [
          {
            paragraphs: [
              'The BIOS, today usually called UEFI, is the small program stored on the board that starts the PC and lets the user change basic settings such as boot order and memory speed. It is opened by pressing a key such as Delete or F2 as the PC starts. It may need an update to support newer CPUs.',
              "The UEFI is the first software that runs when the PC is powered on. It checks the hardware, starts the system, and provides a menu for the most basic settings. For a builder it has three main uses: confirming that the CPU, memory and drives are detected, enabling the memory's rated speed profile, and setting which drive the PC boots from. It is also the place to look first when a part does not appear to work. If a new CPU is not recognised, an update to the UEFI may be required.",
            ],
          },
        ],
      },
      {
        number: '2.7',
        title: 'The rear I/O panel',
        blocks: [
          {
            paragraphs: [
              "The rear I/O panel is the group of ports at the back of the board, covered by a metal shield. Common ports are USB (Type-A and Type-C), video outputs (HDMI or DisplayPort, used when the CPU has integrated graphics), audio jacks, an Ethernet port, and Wi-Fi antenna connectors on boards with built-in Wi-Fi. When a separate graphics card is used, the monitor plugs into the card, not the board's video port.",
              "The rear I/O panel is where external devices connect. The video outputs on the board belong to the CPU's integrated graphics, so they are active only when that is what the PC uses. Once a graphics card is installed, it takes over the display and the monitor must be connected to the card. Plugging the monitor into the wrong port is one of the most common reasons for a blank screen on a first start, and checking it costs nothing.",
            ],
            images: [
              pdfImg('hw2-rear-io.jpg', 'The metal rear I/O plate with USB, video, audio and network ports.', 'The rear I/O panel.'),
            ],
            imageSide: 'left',
          },
        ],
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
    sections: [
      {
        number: '3.1',
        title: 'What RAM is',
        blocks: [
          {
            paragraphs: [
              "RAM (random access memory) is the computer's short-term working memory. The CPU takes program instructions and data from it while it works. RAM is much faster than storage, but its contents are lost when the PC powers down. A RAM stick, called a DIMM in desktops, is a narrow board with memory chips and a row of gold contacts.",
              'One way to picture it: storage is a filing cabinet, and RAM is the desk where the papers being worked on are spread out. A bigger desk lets more work happen at once.',
              'The distinction between memory and storage is central to understanding a computer. Storage keeps files permanently, but it is too slow to feed the CPU directly. RAM sits between them: the system loads the programs and data currently in use into RAM, where the CPU can reach them quickly. When the PC is switched off, RAM is cleared, and the files remain safe in storage.',
              'This explains why adding RAM helps with multitasking. More capacity lets more programs and data stay ready at once, so the system waits less on slower storage. It also explains why RAM capacity and storage capacity are different specifications that serve different purposes and cannot substitute for each other.',
            ],
            images: [ramStick],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '3.2',
        title: 'DDR4 and DDR5',
        blocks: [
          {
            paragraphs: [
              'DDR4 and DDR5 are two generations of memory; DDR stands for double data rate. They use different pin layouts, and the key notch in the contact edge sits in a different place on each. The notch matches a ridge in the slot, so only the correct type fits, and a stick must never be forced into a slot that does not match.',
            ],
            table: {
              headers: ['Feature', 'DDR4', 'DDR5'],
              rows: [
                ['Standard voltage', '1.2 V', '1.1 V'],
                ['Starting speed', 'Common kits about 2,666 to 3,600 MT/s', '4,800 MT/s and up'],
                ['Power management', 'Handled by the motherboard', 'Built into the memory stick'],
                ['Heat', 'Cooler', 'Runs warmer, so heat spreaders matter'],
                ['Price', 'Usually cheaper', 'Usually more expensive'],
                ['Slot fit', 'DDR4 slots only', 'DDR5 slots only'],
              ],
            },
            images: [
              pdfImg(
                'hw3-key-notch.jpg',
                'DDR4 RAM sticks showing the key notch along the gold contact edge.',
                'DDR4 RAM sticks showing the key notch on the gold contact edge.',
              ),
              pdfImg(
                'hw3-ddr5-sticks.jpg',
                'DDR5 memory sticks showing their pin layout and key notch position.',
                'DDR5 memory sticks.',
              ),
            ],
            imageSide: 'left',
          },
          {
            paragraphs: [
              'The memory type is set by the motherboard. Some chipsets come in both a DDR4 and a DDR5 version, so the exact model must be checked. Capacity usually matters more than speed: 16 GB of DDR4 is a better choice than 8 GB of DDR5.',
              'DDR5 is the newer generation, with higher starting speeds and power management moved onto the stick itself. These changes come with higher prices and more heat, which is why DDR5 sticks often carry heat spreaders. The two generations are physically incompatible by design, so a notch in a different position protects the builder from installing the wrong type.',
              'The key decision is made by the motherboard, not the memory. A board built for DDR5 accepts only DDR5, and the same applies to DDR4, so the board must be chosen first and the memory matched to it. When budget is limited, the guidance on capacity is worth following: a larger amount of slower memory usually serves a user better than a small amount of very fast memory, because running out of capacity has a larger effect than a modest difference in speed.',
            ],
          },
        ],
      },
      {
        number: '3.3',
        title: 'How much RAM is needed',
        blocks: [
          {
            table: {
              headers: ['Capacity', 'Good for'],
              rows: [
                ['8 GB', 'Basic web browsing and office work; often too little today'],
                ['16 GB', 'Everyday use and most gaming'],
                ['32 GB', 'Gaming with many apps open, video editing, heavy multitasking'],
                ['64 GB or more', 'Professional editing, 3D work, virtual machines'],
              ],
            },
            paragraphs: [
              "Games do not usually need 64 GB. The motherboard's maximum supported capacity should be checked before buying large kits.",
              "The right amount of RAM depends on the work the PC will do, not on a fixed number. A system with too little memory slows down noticeably once programs exceed what RAM can hold, while a system with far more than it uses gains nothing from the surplus. For most users 16 GB is a sound starting point, and 32 GB is worthwhile for heavy multitasking or content creation. Very large amounts, such as 64 GB, are for specialised work. It is also prudent to confirm the board's maximum capacity before buying a large kit, since the limit varies by model.",
            ],
            images: [
              pdfImg(
                'hw3-ram-capacity.jpg',
                'Recommended RAM capacities (8 GB, 16 GB, 32 GB, 64 GB) by workload and gaming resolution.',
                'Recommended RAM capacity guide by workload.',
              ),
            ],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '3.4',
        title: 'Speed, timings and profiles',
        blocks: [
          {
            bullets: [
              { label: 'Speed', text: 'is shown in MT/s (megatransfers per second), often also written as MHz, for example DDR5-6000.' },
              { label: 'Timings', text: 'are a set of numbers such as 36-36-36-76. The first is the CAS latency. Lower numbers mean a faster response at the same speed.' },
              { label: 'XMP and EXPO', text: "memory kits are often sold at a faster speed than the board's default. Turning on the kit's profile in the BIOS (XMP for Intel boards, EXPO for AMD boards) makes the RAM run at the rated speed. Without it, the RAM runs at a slower default speed." },
            ],
            paragraphs: [
              'Speed describes how much data the memory can move per second, while timings describe how quickly it responds to a request. Both contribute to performance, so two kits at the same speed can differ if their timings differ. The labels on a kit are only a rating, however, and the actual speed depends on a setting in the BIOS. Memory installed without enabling its profile runs at a safe default, so the speed that was paid for is not achieved. Turning on XMP or EXPO during the first visit to the BIOS is therefore an essential step in every build.',
            ],
            images: [
              pdfImg(
                'hw3-task-manager-ram.jpg',
                'Windows Task Manager Memory tab displaying capacity, speed in MT/s, and slots used.',
                'Memory capacity and speed shown in Windows Task Manager.',
              ),
            ],
            imageSide: 'left',
          },
        ],
      },
      {
        number: '3.5',
        title: 'Dual-channel memory',
        blocks: [
          {
            paragraphs: [
              "Dual-channel means using matching sticks together so the CPU can use two memory channels at once, giving more bandwidth than a single stick. Most consumer boards have four slots, often labelled A1, A2, B1 and B2, where the letter shows the channel. With two sticks, slots A2 and B2 (the second and fourth) are used, but boards differ, so the manual's recommended order applies.",
            ],
            bullets: [
              'Buy a kit (for example 2 × 16 GB) rather than two separate sticks so the sticks are guaranteed to match.',
              'Do not mix DDR4 and DDR5.',
              'Mixing different brands or speeds can cause problems or force the RAM to run at the slowest speed.',
            ],
            images: [
              pdfImg(
                'hw3-dual-channel.jpg',
                'Two matching RAM sticks installed into alternating color-coded dual-channel DIMM slots.',
                'Matched RAM sticks installed for dual-channel operation.',
              ),
            ],
            imageSide: 'right',
          },
          {
            paragraphs: [
              'A CPU can read from more than one memory channel at the same time. Dual-channel operation takes advantage of this by splitting the work across two matched sticks, which increases the amount of data that can move at once. Placing the sticks in the correct slots is what activates the second channel, and the lettering on the board shows which slots belong to which channel. Two sticks installed next to each other may end up on the same channel and lose the benefit.',
              'Buying a matched kit removes the uncertainty about compatibility. Sticks from a single kit are tested together, while sticks from different sources may differ in speed or timings, and the system will then run all of them at the slowest rating.',
            ],
          },
        ],
      },
      {
        number: '3.6',
        title: 'How to install a RAM stick',
        blocks: [
          {
            ordered: [
              'Find the memory slots near the CPU and check the slot numbers in the manual.',
              'Push the clips at the ends of the slot outward.',
              'Line up the notch on the stick with the ridge in the slot.',
              'Press straight down on both ends, with firm and even pressure, until the clips snap shut with a click.',
              'Check that both clips are closed and the stick sits straight and level.',
            ],
            paragraphs: [
              'The installation depends on three checks: the notch must align, the pressure must be even, and the clips must close. The notch guarantees the correct orientation, so if the stick does not seat easily it is probably the wrong way round or the wrong type, and more force is not the answer. Pressing on both ends together keeps the stick level, because pressing on only one end leaves the other partly out of its slot. The click of the clips is the confirmation that the stick is fully seated, and a stick that is not fully seated is the most common cause of a PC that does not start.',
            ],
            images: [dimmSlots],
            imageSide: 'left',
          },
        ],
      },
      {
        number: '3.7',
        title: 'If the PC does not start',
        blocks: [
          {
            paragraphs: [
              'Re-seat the sticks and listen for the click on both sides. Try one stick at a time to find a faulty one. Make sure the sticks are in the slots the manual recommends. Be patient on the first start, because new builds can take a while to set up memory before showing a picture.',
              'When a new PC shows no picture, memory is among the first things to check because it is both common to fail to seat and simple to test. The sequence runs from the easiest checks to the more specific ones: confirm the sticks are seated, test with one stick at a time to isolate a faulty module, and confirm the slot positions. The note about patience is also important. On the first boot the system trains the memory, which can take longer than later starts, and interrupting it too early can look like a failure when nothing is wrong.',
            ],
          },
        ],
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
    sections: [
      {
        number: '4.1',
        title: 'What storage does',
        blocks: [
          {
            paragraphs: [
              'Storage holds files, programs and the operating system even when the power is off. This differs from RAM, which holds only what the CPU is working on at the moment and forgets everything at power-off.',
              'Storage is the permanent record of the computer. Everything that must survive a shutdown, including the operating system, installed programs, documents and photos, lives there. RAM works as a temporary workspace that is rebuilt from storage every time the PC starts. Keeping this difference in mind explains why a faster drive makes the whole PC feel quicker: the system constantly reads programs and data from storage into RAM, so the speed of that transfer shapes start-up time, loading times and general responsiveness.',
            ],
            images: [
              pdfImg('hw4-hdd.jpg', 'An open 3.5-inch hard drive showing the platters and the head arm.', 'An open 3.5-inch HDD showing platters and heads.'),
            ],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '4.2',
        title: 'Hard disk drive (HDD)',
        blocks: [
          {
            paragraphs: [
              'An HDD stores data magnetically on fast-spinning platters. Heads on a moving arm read and write the tracks. It looks like a metal box (usually 3.5 inches for desktops) with shiny discs and an arm inside.',
            ],
            bullets: [
              { label: 'Advantages', text: 'cheap per gigabyte and available in very large capacities, so good for bulk storage such as videos and backups.' },
              { label: 'Disadvantages', text: 'slower, because the head has to move to the right track; noisier; and moving parts are easier to damage from bumps and knocks.' },
            ],
            images: [
              pdfImg('hw4-hdd-closed.jpg', 'A closed 3.5-inch hard disk drive.', 'A 3.5-inch hard disk drive (HDD).'),
            ],
            imageSide: 'left',
          },
          {
            paragraphs: [
              'An HDD works much like a record player. The platters spin, and the head must travel to the correct position before it can read or write anything. That mechanical movement is the cause of both its main weakness, slower access, and its susceptibility to physical shock. Its strength is cost: no other type offers as much space for the money. For that reason the HDD remains a sensible home for large files that do not need to be opened quickly, such as video libraries and backups, while it is a poor choice for the operating system.',
            ],
          },
        ],
      },
      {
        number: '4.3',
        title: 'SATA SSD',
        blocks: [
          {
            paragraphs: [
              'A SATA SSD (solid-state drive) stores data in flash memory chips and has no moving parts. It connects through a SATA data cable and a SATA power cable, and usually comes as a thin 2.5-inch case.',
            ],
            bullets: [
              { label: 'Advantages', text: 'much faster than an HDD, silent, and tougher against bumps.' },
              { label: 'Disadvantages', text: 'costs more per gigabyte than an HDD, and its speed is limited by the SATA link.' },
            ],
            images: [
              pdfImg('hw4-sata-ssd.jpg', 'A thin 2.5-inch SATA SSD in its case.', 'A 2.5-inch SATA SSD.'),
            ],
            imageSide: 'right',
          },
          {
            paragraphs: [
              'Because an SSD stores data in flash memory rather than on a spinning disc, it can reach any location almost immediately. There is no head to move and no platter to wait for, which is why it is faster, quieter and more resistant to knocks. The SATA connection, however, is an older interface, and its speed limit of about 6 Gbit/s caps what the drive can deliver, however fast its memory chips are. A SATA SSD is therefore a large improvement over an HDD, and a good choice when a board has no M.2 slot, but it is not the fastest option available.',
            ],
          },
        ],
      },
      {
        number: '4.4',
        title: 'NVMe M.2 SSD',
        blocks: [
          {
            paragraphs: [
              'An NVMe M.2 SSD talks to the computer over PCIe using the NVMe protocol and plugs straight into an M.2 slot with no cables. It is a short stick about 22 mm wide, and the most common size, 2280, is 80 mm long. Current NVMe drives are many times faster than SATA SSDs.',
              "M.2 is only a shape. An M.2 drive can be SATA or NVMe, so the drive type and the board's slot support must both be checked. M.2 drives are named by width and length in millimetres.",
            ],
            table: {
              headers: ['Name', 'Length', 'Where used'],
              rows: [
                ['2230', '30 mm', 'Small devices and handheld PCs'],
                ['2242', '42 mm', 'Small devices'],
                ['2260', '60 mm', 'Less common'],
                ['2280', '80 mm', 'Most desktop boards'],
                ['22110', '110 mm', 'Larger, some server and workstation drives'],
              ],
            },
            images: [m2Ssd],
            imageSide: 'left',
          },
          {
            paragraphs: [
              'M.2 describes the form of the drive, in the same way that a book format describes a paperback without saying what the book contains. Inside an M.2 drive there may be a SATA SSD or an NVMe SSD, and only the NVMe type delivers the speed that makes M.2 attractive. NVMe is faster because it communicates over PCIe, which offers far more bandwidth than the SATA link.',
              "The four-digit name is easy to read once the pattern is known: the first two digits are the width in millimetres and the remaining digits the length. A drive named 2280 is therefore 22 mm wide and 80 mm long, which is the size most desktop boards expect. Before buying, confirm that the board has a free M.2 slot, that the slot supports NVMe, and that it accepts the length of drive chosen.",
            ],
          },
        ],
      },
      {
        number: '4.5',
        title: 'Comparing the three types',
        blocks: [
          {
            table: {
              headers: ['Feature', 'HDD', 'SATA SSD', 'NVMe M.2 SSD'],
              rows: [
                ['How it stores data', 'Spinning magnetic platters', 'Flash memory chips', 'Flash memory chips'],
                ['Moving parts', 'Yes', 'No', 'No'],
                ['Connection', 'SATA cable', 'SATA cable', 'M.2 slot (PCIe)'],
                ['Typical shape', '3.5-inch (or 2.5-inch) box', '2.5-inch case', 'Short stick, usually 2280'],
                ['Speed', 'Slowest', 'Fast', 'Fastest'],
                ['Price per GB', 'Lowest', 'Middle', 'Middle to higher'],
                ['Durability to bumps', 'Lower', 'Higher', 'Higher'],
                ['Best use', 'Bulk files, backups', 'Extra fast storage', 'Operating system, games, apps'],
              ],
            },
            paragraphs: [
              'SSDs are faster than HDDs because they do not have to move a read-write head across a disk. One maker says its entry-level SSDs are about ten times faster than a spinning HDD, and another says current PCIe 3.0 x4 NVMe drives are six to seven times faster than SATA SSDs. Newer PCIe 4.0 and 5.0 NVMe drives are faster still, but need a board that supports them.',
              'The table shows a clear pattern: speed rises and cost per gigabyte rises as the technology moves from HDD to SATA SSD to NVMe. Each type has a role, and no type is best for everything. NVMe suits the operating system, games and applications, where speed is noticed every day. A SATA SSD offers a large step up from an HDD where no M.2 slot is available. An HDD remains the cheapest way to keep large amounts of data.',
              'The speed comparisons quoted come from individual manufacturers and describe typical rather than guaranteed results, so they are best treated as indications of scale. They are useful in showing that the gap between HDD and SSD is large, and the gap between SATA and NVMe is also significant. Faster PCIe 4.0 and 5.0 drives only reach their speeds on boards that support those generations.',
            ],
          },
        ],
      },
      {
        number: '4.6',
        title: 'Choosing a storage setup',
        blocks: [
          {
            bullets: [
              { label: 'Simple build', text: 'one NVMe SSD for everything.' },
              { label: 'Large library', text: 'an NVMe SSD for the operating system and games, plus an HDD for bulk files.' },
              { label: 'Budget', text: 'a SATA SSD is a big step up from an HDD if there is no M.2 slot.' },
              'Whatever the choice, keep a backup of important files on another drive or in the cloud, because any drive can fail.',
            ],
            paragraphs: [
              'A good storage plan matches each drive to the work it does best. The fast drive holds what is used constantly, the operating system and the games, while a large, inexpensive drive holds files that are rarely opened. For most users a single NVMe SSD is enough, and a second drive can be added later as needs grow.',
              'The point about backups applies to every setup. A drive can fail without warning, and a second copy of important files on another drive or in the cloud is the only reliable protection. Backups are part of the plan, not an optional extra.',
            ],
          },
        ],
      },
      {
        number: '4.7',
        title: 'How to install an M.2 SSD',
        blocks: [
          {
            ordered: [
              'Find the M.2 slot in the motherboard manual. If it is under a heatshield, remove the heatshield first.',
              'Check that the standoff (the small post for the screw) sits at the right position for the drive length, usually 2280.',
              'Insert the SSD into the slot at an angle, then gently lay it down on the standoff. The slot fits only one way, so never force it.',
              "Secure it with the M.2 screw, or the board's latch if it has one. Do not overtighten.",
              'Put the heatshield back if the slot had one and the SSD has no heatsink.',
            ],
            paragraphs: [
              "The installation is simple but depends on correct preparation. The standoff must be in the position that matches the drive's length, because the drive is held at one end by the slot and at the other by the screw. The drive enters the slot at an angle and is then pressed flat, which is the reason the screw holds it in place against the slight spring of the connector. The slot is keyed, so a drive that does not enter easily is not aligned, and force should never be used. Replacing the heatshield matters because fast drives warm up under load.",
            ],
            images: [m2Slot],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '4.8',
        title: 'How to install a SATA drive',
        blocks: [
          {
            ordered: [
              'Mount the drive in a bay or bracket in the case, depending on its size.',
              'Plug a SATA data cable from the drive to a SATA port on the motherboard.',
              'Plug a SATA power cable from the PSU into the drive.',
            ],
            paragraphs: [
              'Unlike M.2, a SATA drive is a separate device with two connections. The data cable carries the information between the drive and the board, and the power cable supplies the electricity from the PSU. Both are needed, and a drive missing either will not appear in the system. The connectors are L-shaped and fit one way, so they cannot be reversed. Securing the drive in a bay prevents vibration and protects it from movement inside the case.',
            ],
          },
        ],
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
    sections: [
      {
        number: '5.1',
        title: 'What a power supply unit (PSU) does',
        blocks: [
          {
            paragraphs: [
              'The power supply unit (PSU) turns AC power from the wall outlet into the DC power the components use, while keeping it clean and stable. Some energy is lost as heat.',
              'It powers the whole PC. Most builds use the ATX size; small cases may use SFX or SFX-L. A PSU looks like a metal box with a fan, a power-cord socket and a bundle of cables.',
            ],
            images: [
              img(
                'hw5-psu.jpg',
                'A black ATX power supply unit showing its cooling fan, power switch, and AC power socket.',
                'An ATX power supply unit.',
                { available: true, credit: ASSET_CREDIT },
              ),
            ],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '5.2',
        title: 'Wattage rating and sizing',
        blocks: [
          {
            paragraphs: [
              'The wattage rating is the most power the PSU can supply. To size one, add the power draw of the graphics card and CPU, about 150 W for the rest, and another 150 W of headroom.',
            ],
          },
        ],
      },
      {
        number: '5.3',
        title: 'Power connectors and cable styles',
        blocks: [
          {
            heading: '24-pin ATX connector',
            paragraphs: [
              'The main power cable that plugs into the motherboard. On many units the last four pins can detach as a 4-pin plug, so the plug also fits older 20-pin boards. It looks like a wide two-row plug.',
            ],
            images: [plug24],
            imageSide: 'left',
          },
          {
            heading: 'Other power cables & cable styles',
            paragraphs: [
              'Other power cables commonly include an 8-pin CPU plug, PCIe plugs for graphics cards, SATA power and Molex—bundles of colored wires ending in plugs of different shapes.',
              'Fully modular PSUs have no fixed cables. Semi-modular ones keep the main motherboard and CPU cables fixed. Non-modular ones have every cable attached.',
            ],
            images: [otherCables],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '5.4',
        title: 'Static safety and handling parts',
        blocks: [
          {
            paragraphs: [
              'Touch the bare metal case before handling parts. Corsair says grounding is not strictly necessary because modern parts resist static, and that dropping or forcing parts is the bigger risk.',
              'If you want to be careful, touch a grounded metal object now and then, for example the PSU while it is plugged in but switched off. There is no downside to doing so. The safe habit is to touch bare metal, and to handle parts gently.',
            ],
          },
        ],
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
    sections: [
      {
        number: '6.1',
        title: 'Parts checklist',
        blocks: [
          {
            heading: 'CPU and cooler',
            paragraphs: [
              'The CPU goes in its matching socket. The cooler and thermal paste take the heat away.',
            ],
            images: [cpu, cpuCooler, thermalPaste],
            imageSide: 'right',
          },
          {
            heading: 'RAM',
            paragraphs: [
              'Goes in the DIMM slots, A2 and B2 for two sticks unless the manual says otherwise.',
            ],
            images: [ramStick],
            imageSide: 'left',
          },
          {
            heading: 'M.2 SSD',
            paragraphs: ['Goes in the M.2 slot.'],
            images: [m2Ssd],
            imageSide: 'right',
          },
          {
            heading: 'Graphics card',
            paragraphs: ['Goes in the PCIe x16 slot.'],
            images: [
              img(
                'hw6-graphics-card.jpg',
                'A triple-fan graphics card showing its PCIe x16 edge connector and rear display outputs.',
                'A triple-fan graphics card.',
                { available: true, credit: ASSET_CREDIT },
              ),
            ],
            imageSide: 'left',
          },
          {
            heading: 'Power cables',
            paragraphs: [
              'The 24-pin connector goes to the motherboard, plus the CPU and graphics-card power cables your parts need.',
            ],
            images: [plug24],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '6.2',
        title: 'Build steps',
        blocks: [
          {
            paragraphs: ['No new terms. Use the definitions from Lessons 1 to 5.'],
            ordered: [
              'Safety first. Work gently and touch bare metal now and then; Corsair calls this optional but harmless. Do not force any part.',
              'Install the CPU in its matching socket. Never push the CPU down into the socket by force.',
              'Mount the cooler. Clean off old paste, apply a small amount of new paste as the cooler maker’s manual shows, fit the mounting parts, tighten gently, and plug the fan into the CPU fan header.',
              'Insert the RAM. Open the clips, line up the notch, press until both clips click. Use A2 and B2 for two sticks unless your manual says otherwise.',
              'Install the M.2 SSD in the M.2 slot.',
              'Install the graphics card in the PCIe x16 slot.',
              'Connect the power cables: the 24-pin connector to the motherboard, plus the CPU and graphics-card power cables your parts need.',
            ],
          },
        ],
      },
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
