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
    goal: 'Name the main parts inside a desktop PC and say what each one does.',
    definitions: [
      {
        term: 'PC case',
        text: 'The box that holds and protects the PC’s parts and helps air flow through them.',
      },
      {
        term: 'Motherboard',
        text: 'The main circuit board. The CPU, memory, storage and expansion cards plug into it, and its chipset passes messages between the CPU and the other devices.',
      },
      {
        term: 'CPU (processor)',
        text: 'The “brain” of the computer. It runs the instructions of programs and does calculations.',
      },
      {
        term: 'CPU cooler',
        text: 'A part that pulls heat away from the CPU. An air cooler uses a metal heatsink with fans. A liquid (AIO) cooler uses a pump and radiator.',
      },
      {
        term: 'Thermal paste',
        text: 'A paste placed between the CPU and the cooler. It fills tiny gaps so heat can pass across more easily.',
      },
    ],
    parts: [
      {
        name: 'Case',
        does: 'Holds the parts together, protects them from dust and damage, and shapes airflow and cable routing.',
        looksLike: 'A tower box with side panels. A mid-tower is the most common size and fits ATX boards.',
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
        does: 'Connects every other part so they can work together.',
        looksLike: 'A flat board covered in slots, sockets and connectors.',
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
        does: 'Runs program instructions.',
        looksLike:
          'A small square chip with metal contacts on one side. The LGA 1700 example photo shows a chip about 45 × 37.5 mm.',
        images: [cpu],
      },
      {
        name: 'CPU cooler',
        does: 'Removes heat so the CPU stays at a safe temperature.',
        looksLike:
          'A block of thin metal fins with a fan, or a pump cap with tubes running to a radiator.',
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
        does: 'Improves heat transfer from CPU to cooler.',
        looksLike: 'A grey or white paste sold in a syringe or tube.',
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
    keyPoints: [
      'The case holds everything; the motherboard connects everything.',
      'The CPU does the thinking and makes heat.',
      'A cooler moves that heat away from the CPU.',
      'Thermal paste fills tiny gaps between the CPU and the cooler.',
      'Buy a case that supports your motherboard size.',
    ],
    commonMistakes: [
      'Using too much thermal paste. Noctua warns that too much lowers cooling performance.',
      'Buying a case that cannot fit the motherboard size. Cases list which board sizes they support.',
      'Choosing a cooler without checking what the CPU needs. Stronger CPUs need stronger cooling.',
    ],
    references: [
      { title: 'What Is a PC Case? Sizes, Layouts, and Beginner Basics (MSI)', url: 'https://www.msi.com/blog/what-is-a-pc-case', note: 'Document read a search excerpt only. Also at https://uk.msi.com/blog/what-is-a-pc-case' },
      { title: 'PC Cases 101: Sizes and Layouts (Corsair)', url: 'https://www.corsair.com/us/en/explorer/diy-builder/cases/pc-cases-101-sizes-and-layouts/', note: 'Search excerpt only.' },
      { title: 'Gaming Motherboard Buying Guide (Intel)', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html' },
      { title: 'What Is RAM vs. Processor? (Intel)', url: 'https://www.intel.com/content/www/us/en/learn/what-is-ram-vs-processor.html', note: 'Search excerpt only.' },
      { title: 'Air Cooler vs AIO Cooler (Corsair)', url: 'https://www.corsair.com/us/en/explorer/diy-builder/cpu-coolers/air-cooler-vs-aio-cooler-which-should-you-buy/', note: 'Search excerpt only.' },
      { title: 'What CPU Cooler Should I Get? (Corsair)', url: 'https://www.corsair.com/uk/en/explorer/diy-builder/cpu-coolers/what-cpu-cooler-should-i-get/', note: 'Search excerpt only.' },
      { title: 'What is Thermal Paste? (Corsair)', url: 'https://www.corsair.com/us/en/explorer/glossary/what-is-thermal-paste/', note: 'Search excerpt only.' },
      { title: 'How should I apply the NT-H1 or NT-H2 thermal paste (Noctua)', url: 'https://www.noctua.at/en/support/faqs/how-should-i-apply-the-nt-h1-or-nt-h2-thermal-paste-on-the-cpu-and-how-can-i-remove-it', note: 'Search excerpt only.' },
      { title: 'Noctua NH-U12A manual (Noctua)', url: 'https://noctua.at/pub/media/blfa_files/manual/noctua_nh_u12a_manual_en_web_4.pdf', note: 'Search excerpt only.' },
    ],
  },

  'hw-2': {
    key: 'hw-2',
    goal: 'Find and explain the main sockets, slots and connectors on a motherboard.',
    definitions: [
      {
        term: 'CPU socket',
        text: 'The place where the CPU sits on the board. Socket names such as LGA 1700 come from the number of contacts, and you must check that your CPU matches the socket. AMD’s AM5 and Intel’s LGA 1700 are examples.',
        verify: 'Add an AMD or Intel page that states a CPU fits only its own socket type.',
      },
      {
        term: 'Chipset',
        text: 'A chip that works with specific CPU generations and links the CPU to extra PCIe lanes, storage, USB and other devices.',
      },
      {
        term: 'DIMM slot',
        text: 'A slot for a memory stick. Full-size ATX boards usually have four, Mini-ITX boards usually two.',
      },
      {
        term: 'PCIe x16 slot',
        text: 'Usually the longest slot, most often used for a graphics card.',
      },
      {
        term: 'M.2 slot',
        text: 'A small slot for devices such as NVMe SSDs and Wi-Fi cards that plug straight into the board without cables.',
      },
      {
        term: 'SATA ports',
        text: 'Connectors for older-style 2.5-inch and 3.5-inch drives, running up to 6 Gbit/s in SATA 3.',
      },
      {
        term: '24-pin power connector',
        text: 'The main connector where a cable from the power supply plugs into the board.',
      },
      {
        term: 'VRM',
        text: 'Voltage regulator module. High-end boards improve it for overclocking, and it makes heat that needs cooling.',
        verify: 'Add a source that defines what the VRM does.',
      },
      {
        term: 'Rear I/O panel',
        text: 'The group of ports at the back (USB, video, audio, network) covered by a metal shield.',
      },
      {
        term: 'CMOS battery',
        text: 'A coin-shaped battery that keeps BIOS settings when the PC is off.',
      },
    ],
    parts: [
      {
        name: 'CPU socket',
        does: 'Holds the CPU; only a matching CPU fits (example: AM5 for Ryzen 7000, LGA 1700 for Intel Alder and Raptor Lake).',
        looksLike: 'A square frame, with pins either in the socket or on the CPU.',
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
        does: 'Holds a graphics card.',
        looksLike: 'The longest slot, often with a release latch.',
        images: [
          pdfImg('hw2-pcie-x16.jpg', 'PCIe x16 expansion slots on a motherboard.', 'PCIe x16 slots on a motherboard.'),
        ],
      },
      {
        name: 'M.2 slot',
        does: 'Holds an M.2 SSD.',
        looksLike: 'A small edge-connector slot with a screw post at the far end.',
        images: [m2Slot],
      },
      {
        name: 'SATA ports',
        does: 'Connect SATA drives with cables.',
        looksLike: 'Small L-shaped connectors in a row.',
        images: [
          pdfImg('hw2-sata-ports.jpg', 'A row of SATA ports along the edge of a motherboard.', 'SATA ports on a motherboard.'),
        ],
      },
      {
        name: '24-pin power connector',
        does: 'Brings main power from the PSU.',
        looksLike: 'The largest plug-in block on the board, near the edge.',
        images: [plug24],
      },
      {
        name: 'Chipset, VRM and rear I/O panel',
        does: 'See the definitions above.',
        looksLike:
          'Chipset: a chip under a heatsink. VRM: a block of small coils and heatsinks around the CPU socket. Rear I/O: a metal plate of ports.',
        images: [
          pdfImg('hw2-chipset.jpg', 'A motherboard chipset chip.', 'The chipset.'),
          pdfImg('hw2-vrm.jpg', 'Voltage regulator components including coil and capacitors.', 'Voltage regulator module (VRM) components.'),
          pdfImg('hw2-rear-io.jpg', 'The metal rear I/O plate with USB, video, audio and network ports.', 'The rear I/O panel.'),
        ],
      },
      {
        name: 'CMOS battery',
        does: 'Keeps BIOS settings.',
        looksLike: 'A silver coin cell in a round holder.',
        images: [
          pdfImg('hw2-cmos-battery.jpg', 'A silver coin cell battery in its round holder on a motherboard.', 'A CMOS battery in its holder.'),
        ],
      },
    ],
    keyPoints: [
      'A CPU only fits a socket made for it (AM5, LGA 1700 and so on).',
      'RAM goes in DIMM slots; a graphics card goes in the PCIe x16 slot.',
      'An M.2 SSD plugs into an M.2 slot with no cable.',
      'The 24-pin connector brings main power from the PSU.',
      'The CMOS battery keeps BIOS settings when the PC is off.',
    ],
    commonMistakes: [
      'Buying a CPU without checking the board’s socket and chipset support.',
      'Putting a card in the wrong slot because a smaller card also fits an x16 slot.',
      'Forgetting that M.2 cards need no cables, then hunting for one.',
    ],
    references: [
      { title: 'Gaming Motherboard Buying Guide (Intel)', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html' },
      { title: 'What is a CMOS Battery and How do you Replace It? (Corsair)', url: 'https://www.corsair.com/us/en/explorer/gamer/gaming-pcs/what-is-a-cmos-battery-and-how-do-you-replace-it/', note: 'Search excerpt only.' },
      { title: 'Category: Socket 1700 (Wikimedia Commons, for socket naming only)', url: 'https://commons.wikimedia.org/wiki/Category:Socket_1700' },
      { title: 'Category: Socket AM5 (Wikimedia Commons, for socket naming only)', url: 'https://commons.wikimedia.org/wiki/Category:Socket_AM5' },
    ],
  },

  'hw-3': {
    key: 'hw-3',
    goal: 'Explain what RAM does, tell DDR4 from DDR5, and install a stick correctly.',
    definitions: [
      {
        term: 'RAM',
        text: 'Short-term working memory. The CPU takes program instructions from it. Its contents are lost when the PC powers down.',
      },
      {
        term: 'DDR4 and DDR5',
        text: 'Two generations of memory. They use different pin layouts and the key notch sits in a different place, so they are not interchangeable.',
      },
      {
        term: 'Dual-channel',
        text: 'Using matching sticks together so the CPU can use two memory channels at once.',
      },
    ],
    parts: [
      {
        name: 'RAM stick',
        does: 'Holds data the CPU is working on.',
        looksLike: 'A narrow green or black board with chips and a row of gold contacts.',
        images: [ramStick],
      },
      {
        name: 'Key notch',
        does: 'Makes sure only the right memory type fits. On DDR5 the notch sits farther left than on DDR4 when the sticks are side by side.',
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
      { text: 'Find the slots near the CPU and check the numbers in the manual.' },
      { text: 'Push the clips outward.' },
      { text: 'Line up the notch with the key in the slot.' },
      { text: 'Press straight down on both ends until the clips snap shut with a click.' },
    ],
    notes: [
      {
        title: 'Check your board’s manual',
        text: 'Sources disagree on slot order. One Corsair guide lists the fill order as A1, B1, A2, B2, while another says two sticks usually go in slot two (A2) and slot four (B2). Both say to check the motherboard manual. This app teaches A2 and B2.',
      },
    ],
    keyPoints: [
      'RAM is fast, short-term memory and is emptied when power is off.',
      'DDR4 and DDR5 notches are in different places; never force a stick in.',
      'Two matching sticks in the right slots give dual-channel.',
      'Many boards want A2 and B2 first for two sticks. Always check the manual.',
      'Press until the clips click on both sides.',
    ],
    commonMistakes: [
      'Forcing a DDR5 stick into a DDR4 slot (or the reverse). It can break the stick or the slot.',
      'Putting both sticks in the same channel, which leaves performance unused.',
      'Pressing only one end so one clip stays open.',
    ],
    references: [
      { title: 'What Is RAM vs. Processor? (Intel)', url: 'https://www.intel.com/content/www/us/en/learn/what-is-ram-vs-processor.html', note: 'Search excerpt only.' },
      { title: 'What is a CMOS Battery…? (Corsair; mentions RAM loses its contents when the PC powers down)', url: 'https://www.corsair.com/us/en/explorer/gamer/gaming-pcs/what-is-a-cmos-battery-and-how-do-you-replace-it/', note: 'Search excerpt only.' },
      { title: 'Is DDR5 Backwards Compatible? (Corsair)', url: 'https://www.corsair.com/explorer/diy-builder/memory/is-ddr5-backwards-compatible/' },
      { title: 'Gaming Motherboard Buying Guide (Intel; matching pairs enable dual-channel)', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html' },
      { title: 'Which RAM slots should I use? (Corsair)', url: 'https://www.corsair.com/explorer/diy-builder/memory/which-ram-slots-should-i-use/', note: 'Search excerpt only.' },
      { title: 'How to Upgrade & Install RAM in your PC (Corsair)', url: 'https://www.corsair.com/explorer/diy-builder/memory/how-to-upgrade-ram-in-your-pc/' },
    ],
  },

  'hw-4': {
    key: 'hw-4',
    goal: 'Tell HDDs, SATA SSDs and NVMe M.2 SSDs apart and know where each connects.',
    definitions: [
      {
        term: 'HDD',
        text: 'A hard disk drive. It stores data magnetically on fast-spinning platters, and heads on a moving arm read and write the tracks.',
      },
      {
        term: 'SATA SSD',
        text: 'A solid-state drive that uses the SATA connection, the same kind of link older drives use.',
      },
      {
        term: 'NVMe M.2 SSD',
        text: 'An SSD that talks over PCIe using the NVMe protocol and plugs into an M.2 slot. M.2 is only a shape; an M.2 drive can be SATA or NVMe.',
      },
      {
        term: 'Non-volatile storage',
        text: 'Storage that keeps data when the power is off, unlike RAM.',
        verify: 'The trusted pages opened say RAM loses data, but none state this about SSDs and HDDs directly.',
      },
    ],
    parts: [
      {
        name: 'HDD',
        does: 'Cheap, high-capacity storage with moving parts. It is slower because the head has to move to the right track on spinning platters.',
        looksLike: 'A metal box. Inside, one or more shiny discs and an arm.',
        verify: 'Add a maker page that states the HDD-versus-SSD speed difference.',
        images: [
          pdfImg('hw4-hdd-closed.jpg', 'A closed 3.5-inch hard disk drive.', 'A 3.5-inch hard disk drive (HDD).'),
          pdfImg('hw4-hdd.jpg', 'An open 3.5-inch hard drive showing the platters and the head arm.', 'An open 3.5-inch HDD showing platters and heads.'),
        ],
      },
      {
        name: 'SATA SSD',
        does: 'Flash storage with no moving parts, connected by cable.',
        looksLike: 'A thin 2.5-inch case.',
        images: [
          pdfImg('hw4-sata-ssd.jpg', 'A thin 2.5-inch SATA SSD in its case.', 'A 2.5-inch SATA SSD.'),
        ],
      },
      {
        name: 'M.2 SSD',
        does: 'NVMe drives are much faster than SATA SSDs. Samsung says current PCIe 3.0 x4 NVMe drives run six to seven times faster.',
        looksLike: 'A short stick about 22 mm wide; the common 2280 size is 80 mm long.',
        images: [m2Ssd],
      },
      {
        name: 'M.2 slot',
        does: 'Holds the M.2 SSD with no cable.',
        looksLike: 'A small slot on the board.',
        images: [m2Slot],
      },
    ],
    notes: [
      {
        title: 'Installing an M.2 SSD',
        text: 'Samsung says to find the right slot, slide the drive in and click it into place. The app teaches that a small screw secures it. Both can be true: the click seats the drive and the screw holds it.',
      },
    ],
    keyPoints: [
      'HDD: spinning platters and a moving head, so it is the slowest type.',
      'SATA SSD: no moving parts, same SATA link as older drives.',
      'NVMe M.2 SSD: PCIe link, far faster than SATA.',
      'M.2 is a shape, not a speed. Check whether the drive is SATA or NVMe.',
      'RAM forgets when power is off; storage keeps files.',
    ],
    commonMistakes: [
      'Assuming every M.2 drive is fast. M.2 can be SATA or NVMe.',
      'Buying an M.2 drive without checking that the board’s slot supports it.',
      'Treating RAM and storage as the same thing.',
    ],
    references: [
      { title: 'Hard Drives and SSDs (Seagate)', url: 'https://www.seagate.com/innovation/hard-drives-and-ssds/', note: 'Search excerpt only.' },
      { title: 'HDD vs. SSD: How Do They Store Data? (Seagate)', url: 'https://www.seagate.com/blog/how-do-hdds-and-ssds-store-data/', note: 'Search excerpt only.' },
      { title: 'What is NVMe SSD technology? (Samsung Semiconductor Insights)', url: 'https://insights.samsung.com/2024/01/26/what-is-nvme-ssd-technology' },
      { title: 'NVMe vs SATA SSDs (SanDisk)', url: 'https://www.sandisk.com/topics/nvme-vs-sata-ssds', note: 'Search excerpt only.' },
      { title: 'Gaming Motherboard Buying Guide (Intel)', url: 'https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html' },
      { title: 'What is a CMOS Battery…? (Corsair; RAM loses data at power-off)', url: 'https://www.corsair.com/us/en/explorer/gamer/gaming-pcs/what-is-a-cmos-battery-and-how-do-you-replace-it/', note: 'Search excerpt only.' },
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
