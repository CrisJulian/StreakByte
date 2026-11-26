# StreakByte lesson TODO list

Generated from `src/data/lessons/*.ts`. Nothing here was invented: every item is something your lesson documents marked VERIFY / NOT FOUND / NO FREE IMAGE FOUND, or something that needs a file.

## How to add a picture
1. Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), the author and the credit line.
2. Save the picture as JPG or WebP, about 200 KB or less, in `public/lessons/hw/` or `public/lessons/net/`, with exactly the file name below.
3. In the lesson data file, find the image and set `available: true` and `credit: '<exact credit line>'`.
4. Run `npm test`. A test checks the file exists, has a credit line and is small, and fails if a file is in the folder but not switched on.

## Pictures still needed

### Lesson 1: Inside the PC (hw-1)

- [x] `hw1-case.jpg` (Case) — populated from `ads/hardware.pdf`
- [x] `hw1-case-sizes.jpg` (Case sizes) — populated from `ads/hardware.pdf`
- [x] `hw1-motherboard.jpg` (Motherboard) — populated from `ads/hardware.pdf`
- [x] `hw1-motherboard-sizes.jpg` (Motherboard sizes) — populated from `ads/hardware.pdf`
- [x] `hw1-cpu.jpg` (CPU) — populated from `ads/hardware.pdf`
- [x] `hw1-cpu-cooler.jpg` (CPU cooler) — populated from `ads/hardware.pdf`
- [x] `hw1-aio-cooler.jpg` (AIO liquid cooler) — populated from `ads/hardware.pdf`
- [x] `hw1-thermal-paste.jpg` (Thermal paste) — populated from `ads/hardware.pdf`
- [x] `hw1-thermal-paste-clean.jpg` (Thermal paste cleanup) — populated from `ads/hardware.pdf`

### Lesson 2: The motherboard (hw-2)

- [x] `hw2-socket-am5.jpg` (CPU socket) — populated from `ads/hardware.pdf`
- [x] `hw2-socket-am4.jpg` (CPU socket) — populated from `ads/hardware.pdf`
- [x] `hw2-socket-lga1700.jpg` (CPU socket) — populated from `ads/hardware.pdf`
- [x] `hw2-dimm-slots.jpg` (DIMM slots) — populated from `ads/hardware.pdf`
- [x] `hw2-pcie-x16.jpg` (PCIe x16 slot) — populated from `ads/hardware.pdf`
- [x] `hw2-m2-slot.jpg` (M.2 slot) — populated from `ads/hardware.pdf`
- [x] `hw2-sata-ports.jpg` (SATA ports) — populated from `ads/hardware.pdf`
- [x] `hw5-24pin.jpg` (24-pin power connector, shared) — populated from `ads/hardware.pdf`
- [x] `hw2-chipset.jpg` (Chipset, VRM and rear I/O panel) — populated from `ads/hardware.pdf`
- [x] `hw2-vrm.jpg` (Chipset, VRM and rear I/O panel) — populated from `ads/hardware.pdf`
- [x] `hw2-rear-io.jpg` (Chipset, VRM and rear I/O panel) — populated from `ads/hardware.pdf`
- [x] `hw2-cmos-battery.jpg` (CMOS battery) — populated from `ads/hardware.pdf`

### Lesson 3: Memory (RAM) (hw-3)

- [x] `hw3-ram-stick.jpg` (RAM stick) — populated from `ads/hardware.pdf`
- [x] `hw3-key-notch.jpg` (Key notch) — populated from `ads/hardware.pdf`
- [x] `hw2-dimm-slots.jpg` (DIMM slot with clips, shared) — populated from `ads/hardware.pdf`

### Lesson 4: Storage (hw-4)

- [x] `hw4-hdd-closed.jpg` (HDD) — populated from `ads/hardware.pdf`
- [x] `hw4-hdd.jpg` (HDD) — populated from `ads/hardware.pdf`
- [x] `hw4-sata-ssd.jpg` (SATA SSD) — populated from `ads/hardware.pdf`
- [x] `hw4-m2-ssd.jpg` (M.2 SSD) — populated from `ads/hardware.pdf`
- [x] `hw2-m2-slot.jpg` (M.2 slot, shared) — populated from `ads/hardware.pdf`

### Lesson 5: Power supply (hw-5)

- [x] `hw5-psu.jpg` (PSU) — added to `public/lessons/hw/`
- [x] `hw5-24pin.jpg` (24-pin connector) — populated from `ads/hardware.pdf`
- [x] `hw5-other-cables.jpg` (Other power cables) — populated from `ads/hardware.pdf`

### Final Lesson: Build a PC (hw-6)

- [x] `hw1-cpu.jpg` (CPU and cooler) — populated from `ads/hardware.pdf`
- [x] `hw1-cpu-cooler.jpg` (CPU and cooler) — populated from `ads/hardware.pdf`
- [x] `hw1-thermal-paste.jpg` (CPU and cooler) — populated from `ads/hardware.pdf`
- [x] `hw3-ram-stick.jpg` (RAM) — populated from `ads/hardware.pdf`
- [x] `hw4-m2-ssd.jpg` (M.2 SSD) — populated from `ads/hardware.pdf`
- [x] `hw6-graphics-card.jpg` (Graphics card) — added to `public/lessons/hw/`
- [x] `hw5-24pin.jpg` (Power cables) — populated from `ads/hardware.pdf`

### Lesson 1: What is a network? (net-1)

- [x] `net1-router.jpg` (Router) — populated from `ads/networking.pdf`
- [x] `net1-switch.jpg` (Switch) — populated from `ads/networking.pdf`
- [x] `net1-hub.jpg` (Hub) — populated from `ads/networking.pdf`
- [x] `net1-pc-laptop.jpg` (PC and laptop) — populated from `ads/networking.pdf`
- [x] `net1-wireless-devices.jpg` (PC and laptop over Wi-Fi) — populated from `ads/networking.pdf`

### Lesson 4: Routers and switches (net-4)

- [x] `net1-router.jpg` (Router, shared) — populated from `ads/networking.pdf`
- [x] `net1-switch.jpg` (Switch, shared) — populated from `ads/networking.pdf`
- [x] `net1-hub.jpg` (Hub, shared) — populated from `ads/networking.pdf`

### Final Lesson: Build a Network (net-5)

- [x] `net5-ethernet-cable.jpg` (Ethernet (twisted pair, such as Cat6)) — populated from `ads/networking.pdf`
- [x] `net5-fiber-cable.jpg` (Fiber optic) — added to `public/lessons/net/`
- [x] `net5-coax-cable.jpg` (Coaxial) — added to `public/lessons/net/`

## Claims your documents mark VERIFY / NOT FOUND (still shown in the lessons)

In development builds (`npm run dev`) these show an amber "Needs checking" tag on the page. Learners do not see the tag.

### Lesson 1: Inside the PC (hw-1)

- [ ] Reference "What Is a PC Case? Sizes, Layouts, and Beginner Basics (MSI)": Document read a search excerpt only. Also at https://uk.msi.com/blog/what-is-a-pc-case
- [ ] Reference "PC Cases 101: Sizes and Layouts (Corsair)": Search excerpt only.
- [ ] Reference "What Is RAM vs. Processor? (Intel)": Search excerpt only.
- [ ] Reference "Air Cooler vs AIO Cooler (Corsair)": Search excerpt only.
- [ ] Reference "What CPU Cooler Should I Get? (Corsair)": Search excerpt only.
- [ ] Reference "What is Thermal Paste? (Corsair)": Search excerpt only.
- [ ] Reference "How should I apply the NT-H1 or NT-H2 thermal paste (Noctua)": Search excerpt only.
- [ ] Reference "Noctua NH-U12A manual (Noctua)": Search excerpt only.

### Lesson 2: The motherboard (hw-2)

- [ ] Definition "CPU socket": Add an AMD or Intel page that states a CPU fits only its own socket type.
- [ ] Definition "VRM": Add a source that defines what the VRM does.
- [ ] Reference "What is a CMOS Battery and How do you Replace It? (Corsair)": Search excerpt only.

### Lesson 3: Memory (RAM) (hw-3)

- [ ] Reference "What Is RAM vs. Processor? (Intel)": Search excerpt only.
- [ ] Reference "What is a CMOS Battery…? (Corsair; mentions RAM loses its contents when the PC powers down)": Search excerpt only.
- [ ] Reference "Which RAM slots should I use? (Corsair)": Search excerpt only.

### Lesson 4: Storage (hw-4)

- [ ] Definition "Non-volatile storage": The trusted pages opened say RAM loses data, but none state this about SSDs and HDDs directly.
- [ ] Part "HDD": Add a maker page that states the HDD-versus-SSD speed difference.
- [ ] Reference "Hard Drives and SSDs (Seagate)": Search excerpt only.
- [ ] Reference "HDD vs. SSD: How Do They Store Data? (Seagate)": Search excerpt only.
- [ ] Reference "NVMe vs SATA SSDs (SanDisk)": Search excerpt only.
- [ ] Reference "What is a CMOS Battery…? (Corsair; RAM loses data at power-off)": Search excerpt only.

### Lesson 5: Power supply (hw-5)

- [ ] Part "Other power cables": Corsair’s article does not list these cables; the source is a Commons photo description.
- [ ] Reference "Commons file description: 24-pin ATX power plug (connector names only)": Not a trusted-list source (VERIFY).
- [ ] Reference "Commons file description: PC power supply connectors (connector names only)": Not a trusted-list source (VERIFY).

### Final Lesson: Build a PC (hw-6)

- [ ] Step "Install the CPU in its matching socket. Never push…": Add an Intel or AMD install page (CPU socket install steps are NOT FOUND).
- [ ] Step "Install the M.2 SSD in the M.2 slot.…": Add the screw step from a board manual.
- [ ] Reference "Noctua NH-U12A installation manual": Search excerpt only.
- [ ] Reference "Noctua NH-L9x65 installation manual": Search excerpt only.

### Lesson 1: What is a network? (net-1)

- [ ] Definition "Network": No opened source gives this plain definition; it is consistent with the LAN and RFC 791 sources.
- [ ] Reference "What is a LAN (local area network)? (Cloudflare Learning Center)": Russian-language page with English text. VERIFY and find the English URL.
- [ ] Reference "Types of network devices to use when you build a network (Microsoft Learn)": The document read this from a search excerpt; the page fetch returned only the header.

### Lesson 2: IP address basics (net-2)

- [ ] Definition "Address conflict": NOT FOUND in an opened trusted source.
- [ ] Part "The example network": The reserved .0 and .255 addresses are marked VERIFY in the document.
- [ ] Reference "RFC 791, Internet Protocol (IETF / RFC Editor)": 32-bit, four-octet addresses; network number plus local part.
- [ ] Reference "Understand TCP/IP addressing and subnetting basics (Microsoft Support, KB 164015)": Older Windows 10 article with class-based wording; use for basics only.
- [ ] Reference "Module 9: Dynamic Addressing with DHCP, Networking Essentials (Cisco Networking Academy, © 2020 Cisco)": Slides on a university mirror. VERIFY the wording on netacad.com.

### Lesson 3: Subnet masks (net-3)

- [ ] Definition "/24 notation": Only the table of contents and abstract of RFC 4632 were opened.
- [ ] Definition "Usable hosts in a /24": The arithmetic is sound, but no opened trusted source states the reservation.
- [ ] Reference "Understand TCP/IP addressing and subnetting basics (Microsoft Support, KB 164015)": Older Windows 10 article with class-based wording; use for basics only.
- [ ] Reference "RFC 4632, Classless Inter-domain Routing (CIDR) (IETF)": Partly read.

### Lesson 4: Routers and switches (net-4)

- [ ] Definition "Hub": The “every port” detail was found only on a source outside the trusted list.
- [ ] Reference "Types of network devices to use when you build a network (Microsoft Learn)": The document read this from a search excerpt; the page fetch returned only the header.
- [ ] Reference "Module 9: Dynamic Addressing with DHCP, Networking Essentials (Cisco Networking Academy, © 2020 Cisco)": Slides on a university mirror. VERIFY the wording on netacad.com.

### Final Lesson: Build a Network (net-5)

- [ ] Part "Ethernet (twisted pair, such as Cat6)": All Cat6-specific details are marked VERIFY: the opened source covers Category 5 and older.
- [ ] Reference "Chapter 2: Connecting Network Components (Microsoft Learn, archived TechNet content)": Old content; no Cat6.
- [ ] Reference "ping (Microsoft Learn, Windows commands)": Swedish-locale URL, English text. Find the en-us URL.
- [ ] Reference "RFC 792, Internet Control Message Protocol (IETF)": Defines ICMP; the link from ping to echo messages comes from the Microsoft ping page.

## Other things to know
- Picture advice from the hardware document: do not use the labeled "MSI KT3 Ultra ver 1.0" board as the main motherboard picture. It is an old board with an AGP slot and no M.2 or PCIe x16 slot.
- The pass mark is 3 of 4. Your documents do not state one, so this is the default you asked for. Change it in `src/domain/rules/lessonProgress.ts` (DEFAULT_PASS_MARK).
- The Dashboard "Start lesson" card and the Practice/Leaderboard shortcuts still open the PC lab directly. An existing test (App.test.tsx) requires that, so they bypass the Final Lesson lock. Tell me if you want me to change that test and route them through the curriculum instead.
- The labs themselves (Build a PC, Build a network) do not mark a Final Lesson complete. The Final Lesson counts as complete when its quiz is passed.
- Hardware document: the Lesson 5 backup pin diagram (hw5-24pin-diagram.png, public domain, George Shuklin) was not used because it is a PNG backup, not a main picture.
