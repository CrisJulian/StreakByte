# StreakByte lesson TODO list

Generated from `src/data/lessons/*.ts`. Nothing here was invented: every item is something your lesson documents marked VERIFY / NOT FOUND / NO FREE IMAGE FOUND, or something that needs a file.

## How to add a picture
1. Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), the author and the credit line.
2. Save the picture as JPG or WebP, about 200 KB or less, in `public/lessons/hw/` or `public/lessons/net/`, with exactly the file name below.
3. In the lesson data file, find the image and set `available: true` and `credit: '<exact credit line>'`.
4. Run `npm test`. A test checks the file exists, has a credit line and is small, and fails if a file is in the folder but not switched on.

## Pictures still needed

### Lesson 1: Inside the PC (hw-1)

- [ ] `hw1-case.jpg` (Case) source: https://commons.wikimedia.org/wiki/File:ATX_computer_case.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw1-motherboard.jpg` (Motherboard)
  - NO FREE IMAGE FOUND yet. Look for a clear, top-down photo of a modern ATX board. Lead: https://commons.wikimedia.org/wiki/Category:ASUS_motherboards (category page; check each file’s license).
- [ ] `hw1-cpu.jpg` (CPU) source: https://commons.wikimedia.org/wiki/File:Intel_CPU_Core_i7_12700K_Alder_Lake_top.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw1-cpu-cooler.jpg` (CPU cooler) source: https://commons.wikimedia.org/wiki/File:Alpenf%C3%B6hn_Nordwand_%E2%80%93_CPU_tower_cooler-front_oblique_PNr%C2%B00303.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw1-thermal-paste.jpg` (Thermal paste) source: https://commons.wikimedia.org/wiki/File:2023_Thermal_Grizzly_Kryonaut.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.

### Lesson 2: The motherboard (hw-2)

- [ ] `hw2-socket-am5.jpg` (CPU socket) source: https://commons.wikimedia.org/wiki/File:AM5_Socket_Open.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw2-socket-lga1700.jpg` (CPU socket) source: https://commons.wikimedia.org/wiki/File:2023_Podstawka_LGA_1700.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw2-dimm-slots.jpg` (DIMM slots)
  - NO FREE IMAGE FOUND yet. Look for a desktop board photo with the clips visible. Do not use the DDR4 SO-DIMM slot photo on Commons: it is a laptop slot.
- [ ] `hw2-pcie-x16.jpg` (PCIe x16 slot)
  - NO FREE IMAGE FOUND yet. Look for a modern board close-up. Older PCI photos on Commons do not show PCIe x16 clearly.
- [ ] `hw2-m2-slot.jpg` (M.2 slot) source: https://commons.wikimedia.org/wiki/Category:M.2
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw2-sata-ports.jpg` (SATA ports)
  - NO FREE IMAGE FOUND yet. Find a clear picture (CC0, public domain, CC BY or CC BY-SA), save it under this file name and add its credit line.
- [ ] `hw2-24pin-board.jpg` (24-pin power connector) source: https://commons.wikimedia.org/wiki/File:ATX_Power_connectors_24pin_8pin_4pin_Motherboard.jpg
  - Lead only: verify the license (author Tobias Maier). It is a server board, not a consumer board.
- [ ] `hw2-chipset.jpg` (Chipset, VRM and rear I/O panel)
  - NO FREE IMAGE FOUND yet. Find a clear picture (CC0, public domain, CC BY or CC BY-SA), save it under this file name and add its credit line.
- [ ] `hw2-vrm.jpg` (Chipset, VRM and rear I/O panel)
  - NO FREE IMAGE FOUND yet. Find a clear picture (CC0, public domain, CC BY or CC BY-SA), save it under this file name and add its credit line.
- [ ] `hw2-rear-io.jpg` (Chipset, VRM and rear I/O panel)
  - NO FREE IMAGE FOUND yet. Find a clear picture (CC0, public domain, CC BY or CC BY-SA), save it under this file name and add its credit line.
- [ ] `hw2-cmos-battery.jpg` (CMOS battery) source: https://commons.wikimedia.org/wiki/File:Asus_P5PL2_-_Newsun_CR2032-0428.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.

### Lesson 3: Memory (RAM) (hw-3)

- [ ] `hw3-ram-stick.jpg` (RAM stick) source: https://commons.wikimedia.org/wiki/File:RAM_Module_(SDRAM-DDR4).jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw3-key-notch.jpg` (Key notch)
  - NO FREE IMAGE FOUND for a desktop DDR4/DDR5 side-by-side. Look for a close-up of the contact edge with the notch in view.
- [ ] `hw3-dimm-slot.jpg` (DIMM slot with clips)
  - NO FREE IMAGE FOUND (same search as Lesson 2: a desktop board photo with the clips visible).

### Lesson 4: Storage (hw-4)

- [ ] `hw4-hdd.jpg` (HDD) source: https://commons.wikimedia.org/wiki/File:3.5_inch_hard_disk_drive,_side_view.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw4-sata-ssd.jpg` (SATA SSD) source: https://commons.wikimedia.org/wiki/File:WDC_WDS200T2B0A-00SM50_2000,3_GB_SATA_Vorderseite_20211008_SSD024corr.png
  - Document says CC BY 4.0 (copyright statement in page metadata; VERIFY). Credit if confirmed: "Scan: PantheraLeo1359531, CC BY 4.0, Wikimedia Commons".
- [ ] `hw4-m2-ssd.jpg` (M.2 SSD) source: https://commons.wikimedia.org/wiki/File:Samsung_980_PRO_PCIe_4.0_NVMe_SSD_1TB-top_PNr%C2%B00915.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw4-m2-slot.jpg` (M.2 slot) source: https://commons.wikimedia.org/wiki/Category:M.2
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.

### Lesson 5: Power supply (hw-5)

- [ ] `hw5-psu.jpg` (PSU) source: https://commons.wikimedia.org/wiki/File:ATX_Computer_power_supply_unit.jpg
  - Document says CC BY-SA 4.0 (page metadata; VERIFY). Credit if confirmed: "Photo: Dmitry Makeev, CC BY-SA 4.0, Wikimedia Commons".
- [ ] `hw5-24pin.jpg` (24-pin connector) source: https://commons.wikimedia.org/wiki/File:24-pin_ATX_power_plug_from_a_Seasonic_PSU_20131105.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw5-other-cables.jpg` (Other power cables) source: https://commons.wikimedia.org/wiki/File:PC-Netzteilanschluesse_ATX2_numbered_IMGP2167_smial_wp.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.

### Final Lesson: Build a PC (hw-6)

- [ ] `hw1-cpu.jpg` (CPU and cooler) source: https://commons.wikimedia.org/wiki/File:Intel_CPU_Core_i7_12700K_Alder_Lake_top.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw1-cpu-cooler.jpg` (CPU and cooler) source: https://commons.wikimedia.org/wiki/File:Alpenf%C3%B6hn_Nordwand_%E2%80%93_CPU_tower_cooler-front_oblique_PNr%C2%B00303.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw1-thermal-paste.jpg` (CPU and cooler) source: https://commons.wikimedia.org/wiki/File:2023_Thermal_Grizzly_Kryonaut.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw3-ram-stick.jpg` (RAM) source: https://commons.wikimedia.org/wiki/File:RAM_Module_(SDRAM-DDR4).jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw4-m2-ssd.jpg` (M.2 SSD) source: https://commons.wikimedia.org/wiki/File:Samsung_980_PRO_PCIe_4.0_NVMe_SSD_1TB-top_PNr%C2%B00915.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.
- [ ] `hw6-graphics-card.jpg` (Graphics card)
  - The document does not name a graphics-card picture. Find one (CC0, public domain, CC BY or CC BY-SA) and add its credit line.
- [ ] `hw5-24pin.jpg` (Power cables) source: https://commons.wikimedia.org/wiki/File:24-pin_ATX_power_plug_from_a_Seasonic_PSU_20131105.jpg
  - Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.

### Lesson 1: What is a network? (net-1)

- [ ] `net1-router.jpg` (Router) source: https://commons.wikimedia.org/wiki/File:TP-link_Archer_A6_Router_(v4)_-_Front_Side.jpg
  - License is CC BY-SA but the version number was not visible (VERIFY on the Commons page). Credit once confirmed: “TP-link Archer A6 Router (v4) - Front Side.jpg” by Paowee, CC BY-SA [add version], via Wikimedia Commons.
- [ ] `net1-switch.jpg` (Switch)
  - NO FREE IMAGE FOUND. Look on Commons for a plain photo of an unmanaged 5 or 8 port switch with the ports visible.
- [ ] `net1-hub.jpg` (Hub) source: https://commons.wikimedia.org/wiki/File:4_port_netgear_ethernet_hub.jpg
  - Public domain (license text confirmed on a mirror page only). Confirm on the Commons page, then add the file.
  - Credit line from the document: “4 port netgear ethernet hub.jpg” by plugwash, public domain, via Wikimedia Commons
- [ ] `net1-pc.jpg` (PC and laptop)
  - NO FREE IMAGE FOUND. Look for a plain desktop PC photo on a clean background (CC0, public domain, CC BY or CC BY-SA).
- [ ] `net1-laptop.jpg` (PC and laptop)
  - NO FREE IMAGE FOUND. Look for a closed laptop photo on a clean background (CC0, public domain, CC BY or CC BY-SA).

### Lesson 4: Routers and switches (net-4)

- [ ] `net4-router.jpg` (Router) source: https://commons.wikimedia.org/wiki/File:TP-link_Archer_A6_Router_(v4)_-_Front_Side.jpg
  - License is CC BY-SA but the version number was not visible (VERIFY on the Commons page). Credit once confirmed: “TP-link Archer A6 Router (v4) - Front Side.jpg” by Paowee, CC BY-SA [add version], via Wikimedia Commons.
- [ ] `net4-switch.jpg` (Switch)
  - NO FREE IMAGE FOUND. Look on Commons for a plain photo of an unmanaged 5 or 8 port switch with the ports visible.
- [ ] `net4-hub.jpg` (Hub) source: https://commons.wikimedia.org/wiki/File:4_port_netgear_ethernet_hub.jpg
  - Public domain (license text confirmed on a mirror page only). Confirm on the Commons page, then add the file.
  - Credit line from the document: “4 port netgear ethernet hub.jpg” by plugwash, public domain, via Wikimedia Commons

### Final Lesson: Build a Network (net-5)

- [ ] `net5-ethernet-cable.jpg` (Ethernet (twisted pair, such as Cat6))
  - NO FREE IMAGE FOUND. Look for a plain photo of a Cat6 patch cable with the RJ-45 plug visible.
- [ ] `net5-fiber-cable.jpg` (Fiber optic)
  - NO FREE IMAGE FOUND. Look for a photo of a fiber patch cable with connectors.
- [ ] `net5-coax-cable.jpg` (Coaxial)
  - NO FREE IMAGE FOUND. Look for a clear cross-section or end photo of coax cable with an F or BNC connector.

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
