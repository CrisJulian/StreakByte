import type { LessonContent } from './types';
import { img } from './helpers';

/**
 * Networking Basics lesson content, taken from "StreakByte Track 2: Networking Basics (Lesson Content)".
 * To change a lesson, edit it here. `verify` marks claims the document flags VERIFY / NOT FOUND.
 * Pictures: see public/lessons/net/ and LESSON_TODO.md.
 */

const PDF_CREDIT = 'Source: StreakByte Networking Basics reference guide (networking.pdf)';
const pdfImg = (file: string, alt: string, caption: string) =>
  img(file, alt, caption, { available: true, credit: PDF_CREDIT });

const routerImage = pdfImg(
  'net1-router.jpg',
  'A black home Wi-Fi router with three antennas.',
  'A home router.',
);
const switchImage = pdfImg(
  'net1-switch.jpg',
  'A network switch with a row of Ethernet ports.',
  'A network switch.',
);
const hubImage = pdfImg(
  'net1-hub.jpg',
  'An 8-port desktop Ethernet hub with a row of ports.',
  'An Ethernet hub.',
);

const CLOUDFLARE_ROUTER = {
  title: 'What is a router? (Cloudflare Learning Center)',
  url: 'https://www.cloudflare.com/learning/network-layer/what-is-a-router',
};
const CLOUDFLARE_SWITCH = {
  title: 'What is a network switch? (Cloudflare Learning Center)',
  url: 'https://www.cloudflare.com/learning/network-layer/what-is-a-network-switch',
};
const MS_DEVICES = {
  title: 'Types of network devices to use when you build a network (Microsoft Learn)',
  url: 'https://learn.microsoft.com/training/modules/network-fundamentals/3-network-infrastructure',
};
const MS_CONNECTING = {
  title: 'Chapter 2: Connecting Network Components (Microsoft Learn, archived TechNet content)',
  url: 'https://learn.microsoft.com/en-us/previous-versions//cc723461(v=technet.10)?redirectedfrom=MSDN',
};
const IEEE_STANDARDS = {
  title: 'IEEE Standards Association (802.3 Ethernet, 802.11 Wi-Fi, 802.1D Switching)',
  url: 'https://standards.ieee.org',
};
const RFC1918 = {
  title: 'RFC 1918, Address Allocation for Private Internets (IETF / RFC Editor)',
  url: 'https://www.rfc-editor.org/rfc/rfc1918.txt',
};
const RFC2131 = {
  title: 'RFC 2131, Dynamic Host Configuration Protocol (IETF / RFC Editor)',
  url: 'https://www.rfc-editor.org/rfc/rfc2131',
};
const MS_DHCP = {
  title: 'DHCP Overview (Microsoft Learn)',
  url: 'https://learn.microsoft.com/windows-server/networking/technologies/dhcp/dhcp-top',
};
const MS_KB = {
  title: 'Understand TCP/IP addressing and subnetting basics (Microsoft Support, KB 164015)',
  url: 'https://support.microsoft.com/kb/164015',
};

export const NET_LESSONS: Record<string, LessonContent> = {
  'net-1': {
    key: 'net-1',
    goal: 'Explain what a network is, compare PAN/LAN/WAN and client-server/P2P, and name the devices and links that build a network.',
    definitions: [
      {
        term: 'Network',
        text: 'A group of devices (computers, phones, printers, consoles) linked together so they can exchange data and share resources.',
      },
      {
        term: 'PAN, LAN and WAN',
        text: 'Networks classified by area: PAN (personal, a few meters like phone-to-earbuds Bluetooth), LAN (local, one building like home Wi-Fi or a classroom), and WAN (wide, cities or countries like branch offices or an ISP network).',
      },
      {
        term: 'The internet',
        text: 'Many separate, independently run networks joined together—a network of networks. IP (RFC 791) carries data across them.',
      },
      {
        term: 'Client-server vs. peer-to-peer (P2P)',
        text: 'In client-server, a server provides a service (like a website) and clients request it. In peer-to-peer, devices share directly with no central machine in charge.',
      },
      {
        term: 'Wired vs. wireless links',
        text: 'A wired link uses a cable (Ethernet, IEEE 802.3). A wireless link uses radio waves (Wi-Fi, IEEE 802.11). Most wireless networks still connect back to a cabled network through an access point.',
      },
      { term: 'Router', text: 'Joins different networks, reads destination IP addresses, and connects your LAN to the internet.' },
      {
        term: 'Switch',
        text: 'Connects devices inside one LAN and learns MAC addresses so it forwards data only to the intended port.',
      },
      {
        term: 'Hub',
        text: 'A simple multiport repeater that repeats incoming data out to every other port, sharing capacity and risking collisions.',
      },
      {
        term: 'Access point (AP) & modem (ONT)',
        text: 'An AP lets Wi-Fi devices join a wired network by broadcasting an SSID. A modem (or fiber ONT) converts the ISP’s line signal for the router.',
      },
    ],
    parts: [
      {
        name: 'Router',
        does: 'Joins your LAN to other networks such as the internet, often assigns local IPs, and lets devices share one connection.',
        looksLike: 'A small box, often with antennas, with a WAN port, LAN ports, power jack, and reset button.',
        images: [routerImage],
      },
      {
        name: 'Switch',
        does: 'Connects devices inside one LAN and sends each frame only to the destination device’s port.',
        looksLike: 'A flat box with a row of Ethernet ports and small link/activity lights.',
        images: [switchImage],
      },
      {
        name: 'Hub',
        does: 'Connects devices in one LAN with no smarts, repeating every signal to all other ports.',
        looksLike: 'Looks much like a small switch with a row of ports and no extra features—check the label.',
        images: [hubImage],
      },
      {
        name: 'PC and laptop',
        does: 'The end devices (hosts) people use to browse, message, and share files—connecting by Ethernet cable or Wi-Fi.',
        images: [
          pdfImg(
            'net1-pc-laptop.jpg',
            'A laptop and a desktop PC side by side on a clean background.',
            'A laptop and a desktop PC (end devices).',
          ),
          pdfImg(
            'net1-wireless-devices.jpg',
            'End devices including a laptop, desktop PC, phone, and tablet connected over Wi-Fi.',
            'End devices connecting to a network over Wi-Fi.',
          ),
        ],
      },
    ],
    notes: [
      {
        title: 'How data travels: packets and protocols',
        text: 'Data is cut into small packets carrying sender and receiver addresses so many devices can share a link and resend lost pieces. Protocols are the shared rules: IP addresses and delivers packets, TCP/IP is the internet suite, DHCP assigns addresses, and ICMP handles ping tests and errors.',
      },
      {
        title: 'Bandwidth vs. latency',
        text: 'Bandwidth is capacity—how much data a link carries per second (Mbps or Gbps, like lanes on a road). Latency is delay—how long one packet takes in milliseconds (ms, shown by ping). High bandwidth can still feel sluggish if latency is high.',
      },
      {
        title: 'A home network in one picture',
        text: 'The ISP line enters the modem (or ONT) and passes to the router. Many home routers combine a router, small switch, and Wi-Fi access point (and sometimes the modem) inside one box, with each part still doing its own job.',
      },
    ],
    keyPoints: [
      'A network links devices so they can share data and resources.',
      'PAN covers one person, LAN covers a building, and WAN covers large distances; the internet is a network of networks.',
      'A router joins networks; a switch targets one device on a LAN; a hub repeats to every port.',
      'Wireless (IEEE 802.11) usually only replaces the final hop to a cabled access point (IEEE 802.3 behind it).',
      'Packets carry small chunks of data using protocols like IP, DHCP, and ICMP.',
    ],
    commonMistakes: [
      'Thinking the internet is one single network or machine.',
      'Mixing up what a router does (joins networks) and what a switch does (joins devices in one LAN).',
      'Believing “wireless” means there are no cables anywhere in the network.',
    ],
    references: [
      { title: 'What is a LAN (local area network)? (Cloudflare Learning Center)', url: 'https://www.cloudflare.com/learning/network-layer/what-is-a-lan/' },
      { title: 'RFC 791, Internet Protocol (IETF / RFC Editor)', url: 'https://www.rfc-editor.org/rfc/rfc791.txt' },
      CLOUDFLARE_ROUTER,
      CLOUDFLARE_SWITCH,
      MS_DEVICES,
      MS_CONNECTING,
      IEEE_STANDARDS,
    ],
  },

  'net-2': {
    key: 'net-2',
    goal: 'Read an IPv4 address, explain why every device needs its own, and describe how devices get one.',
    definitions: [
      {
        term: 'IPv4 address',
        text: 'A 32-bit address written as four 8-bit numbers (octets) separated by dots, each from 0 to 255 (e.g. 192.168.1.10). Gives ~4.3 billion total combinations.',
      },
      {
        term: 'Network part and host part',
        text: 'Like a town and street number on mail: one part names the network (used by routers) and the other names the device on that network.',
      },
      {
        term: 'Unique address & address conflict',
        text: 'Every device on a network needs its own address so data finds the right device. If two share one, an address conflict occurs (RFC 5227) and one or both lose connection.',
      },
      {
        term: 'Private ranges & NAT',
        text: 'RFC 1918 reserves 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255, and 192.168.0.0–192.168.255.255 for internal use. A router uses NAT (RFC 3022) so private devices share one public IP.',
      },
      {
        term: 'Special addresses',
        text: '127.0.0.1 is loopback (tests the device’s own TCP/IP stack, RFC 1122); 169.254.x.x is link-local / APIPA when DHCP fails (RFC 3927); 255.255.255.255 is limited broadcast.',
      },
      {
        term: 'Default gateway & DNS',
        text: 'TCP/IP needs an IP address, subnet mask, and default gateway (the router address used to reach other networks). Devices often also get a DNS address to turn names into IPs (not needed in the lab).',
      },
      {
        term: 'DHCP (dynamic) vs. static',
        text: 'DHCP (RFC 2131) leases IP, mask, and gateway automatically; static means typing settings by hand (useful for servers/printers, but prone to duplicates).',
      },
      {
        term: 'IPv6',
        text: 'Uses 128-bit hexadecimal addresses with colons (e.g. 2001:db8::1, RFC 8200 / 4291) to solve the IPv4 shortage. Both run side by side; this course uses IPv4.',
      },
    ],
    parts: [
      {
        name: 'The example network',
        does: 'Network 192.168.1.0 inside the 192.168 private block. The router (default gateway) is 192.168.1.1, and devices use 192.168.1.2 to 192.168.1.254. The .0 network address and .255 broadcast address are reserved.',
        images: [],
      },
    ],
    notes: [
      {
        title: 'Reading an IPv4 octet in binary',
        text: 'Each bit in an octet has a place value: 128, 64, 32, 16, 8, 4, 2, 1. Adding the 1s turns 192.168.1.10 into 11000000.10101000.00000001.00001010, and all eight bits on (11111111) equals 255.',
      },
      {
        title: 'How DHCP works (DORA) & spotting 169.254.x.x',
        text: 'DHCP runs in four steps—Discover, Offer, Request, Acknowledge—and leases addresses for a set time. If a Windows PC shows a 169.254.x.x link-local address, DHCP failed and the server or cable should be checked.',
      },
      {
        title: 'Seeing your own IP address',
        text: 'Run ipconfig in Windows Command Prompt, ip addr on Linux, or ifconfig (or Network settings) on macOS to inspect the actual address, mask, and gateway in use.',
      },
    ],
    keyPoints: [
      'An IPv4 address has four 8-bit octets from 0 to 255; anything above 255 is invalid.',
      'Part of the address names the network and part names the host.',
      'Every device needs a unique IP to avoid address conflicts; private ranges only need uniqueness inside their own LAN.',
      'A device needs an IP address, subnet mask, and default gateway (192.168.1.1 here).',
      'DHCP assigns settings via DORA automatically; a 169.254.x.x address signals DHCP failed.',
    ],
    commonMistakes: [
      'Typing an octet above 255 (for example 192.168.1.256).',
      'Giving two devices the same static IP address, causing an address conflict.',
      'Leaving the default gateway blank, which blocks reaching other networks and the internet.',
    ],
    references: [
      { title: 'RFC 791, Internet Protocol (IETF / RFC Editor)', url: 'https://www.rfc-editor.org/rfc/rfc791.txt' },
      MS_KB,
      RFC1918,
      RFC2131,
      { title: 'RFC 3927, Dynamic Configuration of IPv4 Link-Local Addresses (IETF)', url: 'https://www.rfc-editor.org/rfc/rfc3927' },
      { title: 'RFC 1122, Requirements for Internet Hosts (IETF)', url: 'https://www.rfc-editor.org/rfc/rfc1122' },
      { title: 'RFC 3022, Traditional IP Network Address Translator (IETF)', url: 'https://www.rfc-editor.org/rfc/rfc3022' },
      { title: 'RFC 8200, Internet Protocol, Version 6 (IPv6) (IETF)', url: 'https://www.rfc-editor.org/rfc/rfc8200' },
      { title: 'RFC 4291, IPv6 Addressing Architecture (IETF)', url: 'https://www.rfc-editor.org/rfc/rfc4291' },
      MS_DHCP,
      { title: 'RFC 5227, IPv4 Address Conflict Detection (IETF)', url: 'https://www.rfc-editor.org/rfc/rfc5227' },
    ],
  },

  'net-3': {
    key: 'net-3',
    goal: 'Use a subnet mask to tell whether two addresses are on the same network and count usable host addresses.',
    definitions: [
      {
        term: 'Subnet mask',
        text: 'A 32-bit companion number that splits an IP address into a network part and a host part. It looks like an IP address, but has no meaning by itself.',
      },
      {
        term: '255.255.255.0',
        text: 'In binary, 24 ones followed by 8 zeros (11111111.11111111.11111111.00000000). Like a stencil, 1s mark the network octets and 0s mark the host octet.',
      },
      {
        term: '/24 notation (CIDR)',
        text: 'Shorthand prefix notation (RFC 4632) that counts the 1-bits in the mask: 192.168.1.0/24 means 24 network bits and 8 host bits.',
      },
      {
        term: 'Usable hosts in a /24',
        text: '8 host bits give 2^8 = 256 combinations. Subtracting 2 reserved addresses (the .0 network address and .255 broadcast address) leaves 2^(host bits) − 2 = 254 usable addresses (.1 to .254).',
      },
      {
        term: 'Same network vs. remote',
        text: 'A device applies its mask to the destination IP (bitwise AND). If the network parts match, it sends directly; if they differ, it sends to the default gateway.',
      },
      {
        term: 'Private ranges (RFC 1918)',
        text: '10.0.0.0 to 10.255.255.255, 172.16.0.0 to 172.31.255.255, and 192.168.0.0 to 192.168.255.255.',
      },
    ],
    parts: [
      {
        name: 'A worked example',
        does: 'With 255.255.255.0, compare the first three octets: 192.168.1.10 and 192.168.1.20 share 192.168.1, so they talk directly. 192.168.1.10 and 192.168.2.10 differ in the third octet (1 vs. 2), so a router is needed between them.',
        images: [],
      },
      {
        name: 'Our example network',
        does: 'With mask 255.255.255.0 (/24), 192.168.1.0 has the router at .1, devices at .2 to .254, and remote traffic (including the internet) routed through 192.168.1.1.',
        images: [],
      },
    ],
    notes: [
      {
        title: 'Common CIDR prefixes',
        text: 'Moving bits from host to network halves host capacity: /8 (255.0.0.0) = 16,777,214 hosts; /16 (255.255.0.0) = 65,534; /24 (255.255.255.0) = 254; /25 (255.255.255.128) = 126; /26 (255.255.255.192) = 62; /30 (255.255.255.252) = 2.',
      },
      {
        title: 'How the bitwise AND rule works',
        text: 'Line up address and mask in binary: 1 AND 1 = 1, anything AND 0 = 0. So 192.168.1.10 AND 255.255.255.0 clears the host octet and leaves network 192.168.1.0. Two devices share a network when their AND results match.',
      },
      {
        title: 'Beyond /24: a /25 example',
        text: 'The 255-octet comparison shortcut only works for /8, /16, and /24. Mask 255.255.255.128 (/25) splits a block into .0–.127 and .128–.255, putting 192.168.1.10 and 192.168.1.200 on different networks despite matching first three octets.',
      },
    ],
    keyPoints: [
      'The subnet mask separates the network part from the host part.',
      '255.255.255.0 is /24 in CIDR shorthand and gives 254 usable host addresses (256 − 2).',
      'The bitwise AND of an address and mask yields the network address.',
      'Local destinations go directly; remote destinations go to the default gateway.',
      'The 255-octet shortcut breaks on masks like /25—use the AND rule whenever a mask splits an octet.',
    ],
    commonMistakes: [
      'Reading the subnet mask as a normal device address.',
      'Forgetting to subtract the 2 reserved addresses (network and broadcast) and saying a /24 has 256 usable hosts.',
      'Comparing only the last octet: 192.168.1.10 and 192.168.2.10 look similar but are on different networks.',
    ],
    references: [
      MS_KB,
      { title: 'RFC 4632, Classless Inter-domain Routing (CIDR) (IETF)', url: 'https://datatracker.ietf.org/doc/rfc4632' },
      RFC1918,
      { title: 'RFC 950, Internet Standard Subnetting Procedure (IETF)', url: 'https://www.rfc-editor.org/rfc/rfc950' },
      { title: 'RFC 3021, Using 31-Bit Prefixes on IPv4 Point-to-Point Links (IETF)', url: 'https://www.rfc-editor.org/rfc/rfc3021' },
    ],
  },

  'net-4': {
    key: 'net-4',
    goal: 'Tell a router, a switch, and a hub apart by what addresses they read and how they forward data.',
    definitions: [
      {
        term: 'Router & routing table',
        text: 'Moves data between different networks (RFC 1812) using a routing table—for example sending 192.168.1.0/24 out the LAN port and everything else via the default route to the ISP. Its LAN IP (192.168.1.1) is the default gateway.',
      },
      {
        term: 'Switch & MAC address',
        text: 'Connects devices inside one LAN (IEEE 802.1D). Every network card has a 48-bit MAC address (e.g. 00:1A:2B:3C:4D:5E); the switch notes which MAC sits on each port and sends frames only to the intended port (flooding other ports only until learned).',
      },
      {
        term: 'Hub',
        text: 'A multiport repeater that reads no addresses and repeats incoming signals out of every other port, sharing one pool of capacity and causing collisions when two devices send at once.',
      },
      {
        term: 'ARP (Address Resolution Protocol)',
        text: 'Asks the LAN which device owns a target IP so the sender learns its MAC address (RFC 826; inspect with arp -a on Windows).',
      },
      {
        term: 'DHCP on a home router',
        text: 'The router normally acts as a DHCP server (RFC 2131), handing out IP, mask, and gateway automatically (192.168.0.1 or 192.168.1.1; this course uses 192.168.1.1).',
      },
    ],
    parts: [
      {
        name: 'Router',
        does: 'Connects different networks using IP addresses and a routing table; home models often bundle a router, switch, Wi-Fi AP, and NAT.',
        images: [routerImage],
      },
      {
        name: 'Switch',
        does: 'Connects devices inside one LAN using MAC addresses; plugging a switch into a router port adds more wired ports without changing addressing.',
        images: [switchImage],
      },
      {
        name: 'Hub',
        does: 'Repeats signals to all other ports without reading IP or MAC addresses; mostly replaced by switches.',
        images: [hubImage],
      },
    ],
    notes: [
      {
        title: 'Router vs. switch vs. hub compared',
        text: 'Router (high intelligence): connects different networks, reads IP addresses, forwards via routing table. Switch (medium): connects devices in one LAN, reads MAC addresses, forwards to the target port. Hub (none): connects devices in one LAN, reads nothing, repeats to all other ports.',
      },
      {
        title: 'How IP and MAC addresses work together',
        text: 'The IP address stays the same across the whole journey; the MAC address changes at each local hop. For a LAN device, ARP finds the target’s MAC; for a remote address, the frame goes to the router’s MAC so the router forwards it onward.',
      },
      {
        title: 'Switches let devices talk; routers let networks talk',
        text: 'Local file transfers between two PCs on the same LAN pass through the switch and never touch the router. Traffic headed to the internet or another network must go through the router.',
      },
    ],
    keyPoints: [
      'Switches let devices talk inside one LAN (using MAC addresses); routers let networks talk (using IP addresses).',
      'A switch learns MAC-to-port mappings automatically and only floods unknown destinations.',
      'A hub repeats traffic to every port, wasting capacity and causing collisions.',
      'ARP maps an IP address to a local MAC address for the next hop.',
      'Home routers commonly bundle router, switch, Wi-Fi, NAT, and DHCP in one box.',
    ],
    commonMistakes: [
      'Plugging two routers together and expecting them to share one flat network.',
      'Choosing a hub when a switch would isolate traffic per port and prevent collisions.',
      'Turning off DHCP on the router and forgetting to enter static settings on every device.',
    ],
    references: [
      CLOUDFLARE_ROUTER,
      CLOUDFLARE_SWITCH,
      MS_DEVICES,
      { title: 'RFC 826, An Ethernet Address Resolution Protocol (ARP) (IETF)', url: 'https://www.rfc-editor.org/rfc/rfc826' },
      { title: 'RFC 1812, Requirements for IP Version 4 Routers (IETF)', url: 'https://www.rfc-editor.org/rfc/rfc1812' },
      RFC2131,
      MS_DHCP,
      IEEE_STANDARDS,
    ],
  },

  'net-5': {
    key: 'net-5',
    goal: 'Choose a cable, configure IPv4 settings, test reachability with ping, and troubleshoot systematically.',
    definitions: [],
    definitionsNote: 'No new terms. The only new ideas are the three cable types below.',
    parts: [
      {
        name: 'Ethernet (twisted pair, such as Cat6)',
        does: 'Copper wires twisted in pairs to reduce interference, ending in an 8-pin RJ-45 plug with a 100 m UTP segment limit. Cat5e (100 MHz) handles 1 Gbps at 100 m; Cat6 (250 MHz) adds 10 Gbps up to 55 m; Cat6A (500 MHz) reaches 10 Gbps at 100 m. Modern ports auto-adapt (no crossover cable needed), and the slowest device sets link speed.',
        images: [
          pdfImg(
            'net5-ethernet-cable.jpg',
            'Blue Ethernet patch cables with RJ-45 plugs connected to a switch.',
            'Ethernet patch cables with RJ-45 plugs.',
          ),
        ],
      },
      {
        name: 'Fiber optic',
        does: 'Glass strands (a core wrapped in cladding) carry pulses of light, immune to electrical interference and running for miles at higher cost. Single-mode serves long distances; multimode serves shorter runs inside buildings.',
        images: [
          img(
            'net5-fiber-cable.jpg',
            'A cutaway view of a fiber optic cable showing its protective layers and glass fiber strands.',
            'A fiber optic cable cutaway showing internal fiber strands.',
            { available: true, credit: 'Source: StreakByte Networking Basics lesson asset' },
          ),
        ],
      },
      {
        name: 'Coaxial',
        does: 'A copper core, insulating layer, braided metal shield, and outer cover. Resists interference well and is used for cable TV, broadband, and older Ethernet (with F or BNC connectors).',
        images: [
          img(
            'net5-coax-cable.jpg',
            'Coaxial cables with metal F-type connectors.',
            'Coaxial cables with F-type connectors.',
            { available: true, credit: 'Source: StreakByte Networking Basics lesson asset' },
          ),
        ],
      },
    ],
    steps: [
      { text: 'Place the router, PC, laptop, and switch or hub on the grid.' },
      { text: 'Give the router the address 192.168.1.1 and mask 255.255.255.0.' },
      { text: 'Give each computer a unique address from 192.168.1.2 to 192.168.1.254 (for example, PC 192.168.1.10 and laptop 192.168.1.11).' },
      { text: 'Set the subnet mask to 255.255.255.0 on each computer.' },
      { text: 'Set the default gateway to 192.168.1.1 on each computer.' },
      { text: 'Choose Ethernet cable and connect each device.' },
      { text: 'Test with ping in order (ICMP echo request/reply, RFC 792): ping 127.0.0.1 (own TCP/IP stack), ping 192.168.1.1 (router), then ping 192.168.1.11 (laptop).' },
    ],
    notes: [
      {
        title: 'Reading ping output & errors',
        text: 'time=1ms shows round-trip latency, TTL counts remaining router hops, and Lost = 0 confirms 0% packet loss. “Request timed out” means no reply (cable, IP/mask, or firewall); “Destination host unreachable” means a device knows no route; “General failure” means no valid adapter setup. Verify settings with ipconfig.',
      },
      {
        title: 'Bottom-up troubleshooting',
        text: 'Check one layer and change one thing at a time: 1) Cable & link lights, 2) Addressing (ipconfig), 3) Ping the router, 4) Ping other devices, 5) Firewall rules (some devices block ping on purpose).',
      },
      {
        title: 'Lab record checklist',
        text: 'Verify all four paths pass with 0% loss: own device (ping 127.0.0.1), PC to router (ping 192.168.1.1), PC to laptop (ping 192.168.1.11), and laptop to router (ping 192.168.1.1).',
      },
      {
        title: 'Safety reminder',
        text: 'Unplug equipment before changing cables and touch bare metal on the case first to discharge static. Never bend cables sharply or pull by the wire—always hold the plug.',
      },
    ],
    keyPoints: [
      'Ethernet (twisted pair) is inexpensive for LANs up to 100 m; fiber carries light for long backbones; coax is shielded copper.',
      'Every computer needs a unique address, mask 255.255.255.0, and gateway 192.168.1.1.',
      'Ping tests reachability in order: 127.0.0.1 (self), then 192.168.1.1 (router), then another host.',
      'Troubleshoot bottom-up (cable → IP/mask → router → host → firewall) and change one setting at a time.',
    ],
    commonMistakes: [
      'Using the router’s address (192.168.1.1) on a PC or laptop, or setting a gateway on the wrong network.',
      'Changing multiple settings at once when troubleshooting instead of one thing at a time.',
      'Assuming ping failed because of cabling when a firewall may be blocking ICMP, or pulling cables by the wire instead of the plug.',
    ],
    references: [
      MS_CONNECTING,
      { title: 'ping (Microsoft Learn, Windows commands)', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping' },
      { title: 'RFC 792, Internet Control Message Protocol (IETF)', url: 'https://datatracker.ietf.org/doc/rfc792/' },
      { title: 'Using the Ping Command (Microsoft TechNet, archived)', url: 'https://technet.microsoft.com/en-us/library/dd469646.aspx' },
      { title: 'TIA, ANSI/TIA-568.2-D Cabling Standards', url: 'https://tiaonline.org' },
      IEEE_STANDARDS,
    ],
  },
};
