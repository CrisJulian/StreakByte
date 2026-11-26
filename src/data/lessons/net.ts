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
  note: 'The document read this from a search excerpt; the page fetch returned only the header.',
};
const CISCO_DHCP = {
  title: 'Module 9: Dynamic Addressing with DHCP, Networking Essentials (Cisco Networking Academy, © 2020 Cisco)',
  url: 'https://ciscoacademy.cu.edu.ge/wp-content/uploads/masala/qseli/Module9.pdf',
  note: 'Slides on a university mirror. VERIFY the wording on netacad.com.',
};
const RFC1918 = {
  title: 'RFC 1918, Address Allocation for Private Internets (IETF / RFC Editor)',
  url: 'https://www.rfc-editor.org/rfc/rfc1918.txt',
};
const MS_KB = {
  title: 'Understand TCP/IP addressing and subnetting basics (Microsoft Support, KB 164015)',
  url: 'https://support.microsoft.com/kb/164015',
  note: 'Older Windows 10 article with class-based wording; use for basics only.',
};

export const NET_LESSONS: Record<string, LessonContent> = {
  'net-1': {
    key: 'net-1',
    goal: 'Explain what a network is and name the devices and links that build one.',
    definitions: [
      {
        term: 'Network',
        text: 'A group of devices linked together so they can exchange data.',
        verify: 'No opened source gives this plain definition; it is consistent with the LAN and RFC 791 sources.',
      },
      {
        term: 'LAN (local area network)',
        text: 'A group of connected devices that are close together, such as a home Wi-Fi network.',
      },
      {
        term: 'The internet',
        text: 'Many separate networks joined together. IP was designed to carry data across an interconnected system of networks.',
      },
      { term: 'Router', text: 'A device that moves data between different networks.' },
      {
        term: 'Switch',
        text: 'A device that connects devices on one network and sends data only to the device it is meant for.',
      },
      {
        term: 'Hub',
        text: 'A simple device that acts as a multiport repeater, a central connection point for a LAN.',
      },
      {
        term: 'Wired vs. wireless link',
        text: 'A wired link uses a cable. A wireless link uses radio or light. Most wireless networks still connect back to a cabled network through an access point.',
      },
    ],
    parts: [
      {
        name: 'Router',
        does: 'Joins your LAN to other networks, such as the internet.',
        looksLike: 'A small box, often with antennas, and its back has WAN and LAN ports, a power jack and a reset button.',
        images: [routerImage],
      },
      {
        name: 'Switch',
        does: 'Connects the devices on one LAN.',
        looksLike: 'A flat box with a row of Ethernet ports.',
        images: [switchImage],
      },
      {
        name: 'Hub',
        does: 'Connects devices, but with no smarts.',
        looksLike: 'It looks like a small switch, with a row of ports and no extra features.',
        images: [hubImage],
      },
      {
        name: 'PC and laptop',
        does: 'The end devices that use the network. They connect by cable or by Wi-Fi.',
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
    keyPoints: [
      'A network is devices connected so they can share data.',
      'A LAN covers a small area, like a home or classroom.',
      'The internet is a network of networks.',
      'A router joins networks. A switch joins devices inside one network.',
      'A hub is the simplest connector and has no intelligence.',
      'Wireless networks usually still depend on a cabled network behind them.',
    ],
    commonMistakes: [
      'Thinking the internet is one single network.',
      'Mixing up what a router does (joins networks) and what a switch does (joins devices).',
      'Believing “wireless” means no cables anywhere.',
    ],
    references: [
      { title: 'What is a LAN (local area network)? (Cloudflare Learning Center)', url: 'https://www.cloudflare.com/ru-ru/learning/network-layer/what-is-a-lan/', note: 'Russian-language page with English text. VERIFY and find the English URL.' },
      { title: 'RFC 791, Internet Protocol (IETF / RFC Editor)', url: 'https://www.rfc-editor.org/rfc/rfc791.txt' },
      CLOUDFLARE_ROUTER,
      CLOUDFLARE_SWITCH,
      MS_DEVICES,
      { title: 'Chapter 2: Connecting Network Components (Microsoft Learn, archived TechNet content)', url: 'https://learn.microsoft.com/en-us/previous-versions//cc723461(v=technet.10)?redirectedfrom=MSDN' },
    ],
  },

  'net-2': {
    key: 'net-2',
    goal: 'Read an IPv4 address and explain why every device on a network needs its own.',
    definitions: [
      {
        term: 'IPv4 address',
        text: 'A 32-bit address written as four numbers, one for each of its four 8-bit parts. Each part runs from 0 to 255.',
      },
      {
        term: 'Network part and host part',
        text: 'An address has two jobs. One part says which network a device is on. The other part says which device it is.',
      },
      {
        term: 'Unique address',
        text: 'Each device on a network needs its own address, so data can find the right device. Private addresses only have to be unique inside their own network.',
      },
      {
        term: 'Address conflict',
        text: 'When two devices use the same address, the network cannot tell them apart and one or both lose connection.',
        verify: 'NOT FOUND in an opened trusted source.',
      },
      {
        term: 'Default gateway',
        text: 'The router address a device uses to reach other networks. A computer’s TCP/IP setup needs three items: address, subnet mask and default gateway.',
      },
      { term: 'DHCP (dynamic)', text: 'A server hands out the address, mask and gateway automatically.' },
      { term: 'Static', text: 'A person types the settings in by hand, which is more error-prone.' },
    ],
    parts: [
      {
        name: 'The example network',
        does: 'Network 192.168.1.0. The router (default gateway) is 192.168.1.1. Devices use 192.168.1.2 to 192.168.1.254. This range sits inside the private block 192.168.0.0 to 192.168.255.255. The .0 and .255 addresses are normally reserved.',
        verify: 'The reserved .0 and .255 addresses are marked VERIFY in the document.',
        images: [],
      },
    ],
    keyPoints: [
      'An IPv4 address has four numbers from 0 to 255.',
      'Part of the address names the network and part names the device.',
      'Every device needs its own address.',
      'The default gateway is the router’s address, here 192.168.1.1.',
      'DHCP assigns settings automatically. Static means you type them.',
    ],
    commonMistakes: [
      'Typing a number above 255 (for example 192.168.1.256).',
      'Giving two devices the same address.',
      'Leaving the default gateway blank, which stops the device from reaching other networks.',
    ],
    references: [
      { title: 'RFC 791, Internet Protocol (IETF / RFC Editor)', url: 'https://www.rfc-editor.org/rfc/rfc791.txt', note: '32-bit, four-octet addresses; network number plus local part.' },
      MS_KB,
      RFC1918,
      CISCO_DHCP,
    ],
  },

  'net-3': {
    key: 'net-3',
    goal: 'Use a subnet mask to tell whether two addresses are on the same network.',
    definitions: [
      { term: 'Subnet mask', text: 'A number that splits an IP address into a network part and a host part.' },
      {
        term: '255.255.255.0',
        text: 'In binary, 24 ones followed by 8 zeros (11111111.11111111.11111111.00000000). The ones cover the network part.',
      },
      {
        term: '/24 notation',
        text: 'A short way to write the same mask. The number after the slash counts the ones. Prefix notation is part of the CIDR standard.',
        verify: 'Only the table of contents and abstract of RFC 4632 were opened.',
      },
      {
        term: 'Usable hosts in a /24',
        text: '8 bits for hosts gives 256 combinations. Two are reserved (the network address and the broadcast address), leaving 254 usable.',
        verify: 'The arithmetic is sound, but no opened trusted source states the reservation.',
      },
      {
        term: 'Same network',
        text: 'Two addresses are on the same network when their network parts match. The mask is how a device decides whether another host is local or remote.',
      },
      {
        term: 'Private ranges (RFC 1918)',
        text: '10.0.0.0 to 10.255.255.255, 172.16.0.0 to 172.31.255.255, and 192.168.0.0 to 192.168.255.255.',
      },
    ],
    parts: [
      {
        name: 'A worked example',
        does: 'With mask 255.255.255.0, the first three numbers are the network part. 192.168.1.10 is on network 192.168.1. 192.168.2.10 is on network 192.168.2. The network parts differ, so these two are not on the same network, and a router is needed between them. 192.168.1.10 and 192.168.1.20 are both on network 192.168.1, so they are on the same network.',
        images: [],
      },
      {
        name: 'Our example network',
        does: 'With the mask 255.255.255.0, our example network 192.168.1.0 has the router at .1 and devices at .2 to .254.',
        images: [],
      },
    ],
    keyPoints: [
      'The mask separates network part from host part.',
      '255.255.255.0 is the same as /24.',
      'A /24 network has 254 usable host addresses.',
      'Matching network parts means the same network.',
      'Three private ranges exist, and the 192.168 range is the one the app uses.',
    ],
    commonMistakes: [
      'Reading the mask as a normal address.',
      'Forgetting to subtract the two reserved addresses and saying a /24 has 256 hosts.',
      'Comparing only the last number: 192.168.1.10 and 192.168.2.10 look alike but are on different networks.',
    ],
    references: [
      MS_KB,
      { title: 'RFC 4632, Classless Inter-domain Routing (CIDR) (IETF)', url: 'https://datatracker.ietf.org/doc/rfc4632', note: 'Partly read.' },
      RFC1918,
    ],
  },

  'net-4': {
    key: 'net-4',
    goal: 'Tell a router, a switch and a hub apart by how they handle data.',
    definitions: [
      { term: 'Router', text: 'Moves data between different networks, using a routing table that lists paths to destinations.' },
      { term: 'Switch', text: 'Sends data only to the single device it is intended for on one LAN, instead of to every device.' },
      {
        term: 'Hub',
        text: 'A multiport repeater. It repeats what it receives out of every other port, so every device sees the data.',
        verify: 'The “every port” detail was found only on a source outside the trusted list.',
      },
      {
        term: 'DHCP on a home router',
        text: 'The router can act as the DHCP server, giving each device an address, mask and gateway automatically. A common default is the router at 192.168.0.1, which is the gateway for all hosts on the LAN. Our app uses 192.168.1.1.',
      },
    ],
    parts: [
      {
        name: 'Router',
        does: 'Lets different networks talk to each other.',
        images: [routerImage],
      },
      {
        name: 'Switch',
        does: 'Lets devices on a network talk to each other. If a router runs out of ports, a switch can plug into one router port to add more wired devices.',
        images: [switchImage],
      },
      {
        name: 'Hub',
        does: 'Repeats data to the other ports.',
        images: [hubImage],
      },
    ],
    keyPoints: [
      'Routers connect networks. Switches connect devices inside a network.',
      'A switch is smarter than a hub because it targets one device.',
      'A hub sends data everywhere, so it wastes capacity as devices are added.',
      'A home router usually also runs DHCP.',
      'Home routers commonly bundle router, switch and Wi-Fi in one box.',
    ],
    commonMistakes: [
      'Plugging two routers together and expecting them to share one network.',
      'Choosing a hub when a switch would do the same job better.',
      'Turning off DHCP and forgetting to set static addresses.',
    ],
    references: [
      CLOUDFLARE_ROUTER,
      CLOUDFLARE_SWITCH,
      MS_DEVICES,
      CISCO_DHCP,
      { title: 'How does a switch work? (Cisco)', url: 'https://www.cisco.com/c/en_ae/solutions/small-business/resource-center/networking/network-switch-how.html' },
    ],
  },

  'net-5': {
    key: 'net-5',
    goal: 'Choose a cable, set addresses, and prove the network works with ping. (Hands-on, no new theory beyond the cables.)',
    definitions: [],
    definitionsNote: 'No new terms. The only new ideas are the three cable types below.',
    parts: [
      {
        name: 'Ethernet (twisted pair, such as Cat6)',
        does: 'Copper wires twisted in pairs, which reduces interference. It carries electrical signals and ends in an RJ-45 plug with eight connections. It is inexpensive and the most popular choice for LANs, with a 100 meter segment limit for UTP. Used for homes, offices and links from a switch to a PC.',
        verify: 'All Cat6-specific details are marked VERIFY: the opened source covers Category 5 and older.',
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
        does: 'Glass strands (a core wrapped in cladding) carry data as pulses of light. It is not affected by electrical interference, runs for many miles, and costs more. Used for long links and high-speed backbones.',
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
        does: 'A copper core, an insulating layer, a braided metal shield and an outer cover. It resists interference well and suits longer runs than twisted pair. Used for cable TV and broadband (RG-59 and RG-6 types), and in older Ethernet. Connectors include BNC.',
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
      { text: 'Place the router, PC, laptop and hub on the grid.' },
      { text: 'Give the router the address 192.168.1.1.' },
      { text: 'Give each computer its own address from 192.168.1.2 to 192.168.1.254. Example: PC 192.168.1.10, laptop 192.168.1.11.' },
      { text: 'Set the subnet mask to 255.255.255.0 on each computer.' },
      { text: 'Set the default gateway to 192.168.1.1 on each computer.' },
      { text: 'Choose a cable (Ethernet for this build) and connect each device.' },
      { text: 'Test with ping: ping 192.168.1.1 from the PC, then ping the laptop’s address. Ping sends an ICMP echo request and shows the echo reply and round-trip time.' },
    ],
    notes: [
      {
        title: 'If you see “Request timed out”',
        text: 'Check the cable, the address and mask, and the gateway.',
      },
      {
        title: 'Safety reminder',
        text: 'Unplug equipment before changing cables, and touch bare metal on the case first to discharge static.',
      },
    ],
    keyPoints: [
      'Ethernet is cheap and common. Fiber is fast and long-range. Coax is shielded copper.',
      'Every computer needs a unique address, mask 255.255.255.0 and gateway 192.168.1.1.',
      'Ping tests whether two devices can reach each other.',
      'Ping the router first, then another computer.',
    ],
    commonMistakes: [
      'Using the router’s address (192.168.1.1) for a computer.',
      'Setting a gateway that is not on the same network.',
      'Assuming ping failed because of the network when a firewall can block ping.',
    ],
    references: [
      { title: 'Chapter 2: Connecting Network Components (Microsoft Learn, archived TechNet content)', url: 'https://learn.microsoft.com/en-us/previous-versions//cc723461(v=technet.10)?redirectedfrom=MSDN', note: 'Old content; no Cat6.' },
      { title: 'ping (Microsoft Learn, Windows commands)', url: 'https://learn.microsoft.com/sv-se/windows-server/administration/windows-commands/ping', note: 'Swedish-locale URL, English text. Find the en-us URL.' },
      { title: 'RFC 792, Internet Control Message Protocol (IETF)', url: 'https://datatracker.ietf.org/doc/rfc792/', note: 'Defines ICMP; the link from ping to echo messages comes from the Microsoft ping page.' },
      { title: 'Using the Ping Command (Microsoft TechNet, archived)', url: 'https://technet.microsoft.com/en-us/library/dd469646.aspx' },
    ],
  },
};
