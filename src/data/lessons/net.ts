import type { LessonContent } from './types';
import { img } from './helpers';

/**
 * Networking Basics lesson content, structured by section from ads/networking.pdf (Lessons 1-5).
 * Pictures: see public/lessons/net/ and LESSON_TODO.md.
 */

const PDF_CREDIT = 'Source: StreakByte Networking Basics reference guide (networking.pdf)';
const ASSET_CREDIT = 'Source: StreakByte Networking Basics lesson asset';
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
const ethernetImage = pdfImg(
  'net5-ethernet-cable.jpg',
  'Blue Ethernet patch cables with RJ-45 plugs connected to a switch.',
  'Ethernet patch cables with RJ-45 plugs.',
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
    sections: [
      {
        number: '1.1',
        title: 'What is a network?',
        blocks: [
          {
            paragraphs: [
              'A network is a group of devices linked together so they can exchange data. The devices can be computers, phones, printers, game consoles or anything else that can send and receive data. Networks let people share files, share a printer, play games together and reach the internet.',
              'The defining feature of a network is the exchange of data between devices. Without a link, each device is isolated and can only use what it holds itself. Once devices are connected, they can share resources: one printer can serve many computers, one file can be reached from several places, and many devices can reach the internet through a single connection. The word "devices" is deliberately broad. Any equipment that can send and receive data can join a network, which is why phones, consoles and printers sit alongside computers.',
            ],
            images: [
              pdfImg(
                'net1-network-overview.jpg',
                'Interconnected computers, servers, and laptops linked across a global network.',
                'Connected devices exchanging data across a network.',
              ),
            ],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '1.2',
        title: 'Types of network',
        blocks: [
          {
            table: {
              headers: ['Type', 'Full name', 'Area it covers', 'Example'],
              rows: [
                ['PAN', 'Personal area network', 'A few meters around one person', 'A phone linked to earbuds by Bluetooth'],
                ['LAN', 'Local area network', 'One building or a small group of buildings', 'Home Wi-Fi, a classroom, an office'],
                ['WAN', 'Wide area network', 'Cities, countries or the world', "A company linking branch offices; the internet provider's network"],
              ],
            },
            paragraphs: [
              'The internet is many separate networks joined together. It is not one single network but a network of networks. The Internet Protocol (RFC 791) was designed to carry data across an interconnected system of networks.',
              'Networks are classified by the area they cover, and each type serves a different purpose. A PAN connects the devices around one person, a LAN connects the devices in a building such as a home or classroom, and a WAN connects sites across large distances. The categories are useful because the technology, cost and ownership usually change with the scale: a LAN is normally owned and managed by the people who use it, while a WAN usually depends on a provider.',
              'The statement that the internet is a network of networks is central to the whole course. The internet is not a single machine or a single cable. It is thousands of independently run networks that agree on shared rules so they can pass data to each other. The Internet Protocol is what makes this possible, because it defines a common way to address and deliver data across networks of different kinds.',
            ],
            images: [
              pdfImg('net1-pan.jpg', 'Personal Area Network (PAN) connecting devices around one laptop.', 'PAN: personal area network.'),
              pdfImg('net1-lan.jpg', 'Local Area Network (LAN) connecting computers and servers in a building.', 'LAN: local area network.'),
              pdfImg('net1-wan.jpg', 'Wide Area Network (WAN) linking offices, data centers, remote users, and the internet.', 'WAN: wide area network.'),
            ],
            imageSide: 'left',
          },
        ],
      },
      {
        number: '1.3',
        title: 'Two ways devices share work',
        blocks: [
          {
            heading: 'Client-server',
            paragraphs: [
              'One powerful computer (the server) provides a service, such as web pages or file storage, and other devices (clients) ask for it. A web browser asking a website for a page is a client talking to a server.',
            ],
            images: [
              pdfImg(
                'net1-client-server.jpg',
                'Client-server architecture diagram showing a client requesting a webpage and a server responding.',
                'Client-server architecture.',
              ),
            ],
            imageSide: 'right',
          },
          {
            heading: 'Peer-to-peer (P2P)',
            paragraphs: [
              'Devices share directly with each other and no device is in charge. Two laptops sharing a folder is a small example.',
              'These two models describe who provides the service. In client-server, the roles are fixed: the server waits for requests and answers them, and the clients make the requests. This arrangement is easy to manage and secure because the shared resources are kept in one place, which is why most websites and company systems use it. In peer-to-peer, every device can both offer and request, so no central machine is needed. That makes it simple for small groups, but harder to control as it grows. When a browser loads a page, the browser is the client because it asks, and the website is the server because it provides.',
            ],
            images: [
              pdfImg(
                'net1-p2p.jpg',
                'Peer-to-peer architecture diagram with laptops sharing directly without a central server.',
                'Peer-to-peer (P2P) architecture.',
              ),
            ],
            imageSide: 'left',
          },
        ],
      },
      {
        number: '1.4',
        title: 'Wired and wireless links',
        blocks: [
          {
            paragraphs: [
              'A link is the path that data travels between two devices. A wired link uses a cable, and Ethernet is the standard for wired LANs (IEEE 802.3). A wireless link uses radio waves, and Wi-Fi is the common name for wireless LANs built on IEEE 802.11. Most wireless networks still connect back to a cabled network through an access point, so wireless does not mean there are no cables anywhere.',
              "A link is simply the route between two devices, and it can be a cable or a radio signal. Standards such as IEEE 802.3 and IEEE 802.11 matter because they let equipment from different makers work together. A laptop from one company can join a Wi-Fi network built with another company's access point because both follow 802.11.",
              'The important point is that wireless networks rarely stand alone. The access point that Wi-Fi devices connect to is normally wired into the rest of the network, and from there the traffic travels by cable to the router and onward. Wireless therefore replaces only the last part of the path, between the device and the access point, not the whole network.',
            ],
            images: [
              ethernetImage,
              pdfImg(
                'net1-wireless-devices.jpg',
                'End devices including a laptop, desktop PC, phone, and tablet connected over Wi-Fi.',
                'End devices connecting to a network over Wi-Fi.',
              ),
            ],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '1.5',
        title: 'The Devices That Build a Network',
        blocks: [
          {
            paragraphs: [
              'A network is built from several devices, each with its own job. Some connect devices to one another, some connect one network to another, and others are the devices people actually use.',
            ],
          },
          {
            heading: 'Router',
            paragraphs: [
              'A router joins your local area network (LAN) to other networks, such as the internet. It reads the destination IP address of the data and decides where to send it next. In a home, it sits between your devices and the internet service provider, so a request to open a website passes through the router on its way out, and the reply comes back through it. Most home routers also assign local IP addresses to connected devices and let them share one internet connection.',
              'A home router is usually a small box, often with antennas. At the back are a WAN port that connects to the modem, several LAN ports for local devices, a power jack, and a reset button.',
            ],
            images: [routerImage],
            imageSide: 'right',
          },
          {
            heading: 'Switch',
            paragraphs: [
              "A switch connects devices within the same LAN, such as the computers and printers in a school laboratory. It learns the MAC address of the device connected to each port and uses this to send data to the intended device. For example, when one computer sends a file to a printer, the switch forwards it through the printer's port instead of sending it to everyone. If it does not yet know where the destination is, it sends the data to all other ports until it learns the location. This reduces unnecessary traffic and makes the network faster and more private.",
              'A switch is typically a flat box with a row of Ethernet ports, each with a small light that shows connection or activity.',
            ],
            images: [switchImage],
            imageSide: 'left',
          },
          {
            heading: 'Hub',
            paragraphs: [
              "A hub is a simple connection point for devices in a network. Whatever it receives on one port, it repeats to all the other ports, even if the data is meant for only one device. It does not read addresses or make decisions. As a result, all connected devices share the same capacity, can receive one another's traffic, and may experience data collisions when they transmit at the same time. For these reasons, switches have mostly replaced hubs.",
              'A hub looks much like a small switch, with a row of ports and no extra features, so check the label to tell them apart.',
            ],
            images: [hubImage],
            imageSide: 'right',
          },
          {
            heading: 'Access Point (AP)',
            paragraphs: [
              'An access point lets Wi-Fi devices, such as phones, tablets, and laptops, join a wired network. It is connected to the network by cable and communicates with wireless devices using radio signals. It broadcasts a network name, called the SSID, which users select when connecting. Schools and offices often install several access points so that the wireless signal covers a larger area.',
              'An access point may be a small box with antennas or a flat disc mounted on the ceiling.',
            ],
          },
          {
            heading: 'Modem',
            paragraphs: [
              "A modem converts the signal from the internet service provider into a form that the router can use, and converts outgoing data back for the provider's line. The line may be cable, fiber, or telephone. In fiber connections, the device that does this job is often called an optical network terminal (ONT).",
              'A modem is usually a small box placed between the wall connection and the router.',
            ],
            images: [
              pdfImg(
                'net1-modem.jpg',
                'A small desktop modem box with front status indicator lights.',
                'A broadband modem.',
              ),
            ],
            imageSide: 'left',
          },
          {
            heading: 'PC and Laptop',
            paragraphs: [
              'PCs and laptops are end devices, also called hosts. They send and receive data and are what people use to browse websites, send messages, and share files. They connect to the network through an Ethernet cable or through Wi-Fi. A desktop PC commonly uses a cable for a stable connection, while a laptop often uses Wi-Fi so it can be moved around.',
            ],
            images: [
              pdfImg(
                'net1-pc-laptop.jpg',
                'A laptop and a desktop PC side by side on a clean background.',
                'A laptop and a desktop PC (end devices).',
              ),
            ],
            imageSide: 'right',
          },
          {
            heading: 'Putting the Devices Together',
            paragraphs: [
              'In a typical home, data from the provider enters the modem, passes to the router, and then reaches the end devices by cable or Wi-Fi. Many homes use an all-in-one box that combines a router, a small switch, and an access point, and some also include the modem. Even when they share one case, each part still performs its own role.',
            ],
            images: [
              pdfImg(
                'net1-putting-together.jpg',
                'Building diagram showing a router, switch, access point, printer, computer, NAS, camera, and videophone connected together.',
                'How a router, switch, access point, and end devices connect together.',
              ),
            ],
            imageSide: 'left',
          },
        ],
      },
      {
        number: '1.6',
        title: 'How data travels: packets and protocols',
        blocks: [
          {
            paragraphs: [
              "Data is not sent as one big block. It is cut into small pieces called packets. Each packet carries the sender's address, the receiver's address and a piece of the data. The packets travel across the network and are put back together at the other end, which lets many devices share the same links at the same time.",
              'A protocol is a set of agreed rules for how devices communicate, and two devices can only talk if they follow the same rules. Examples: IP (Internet Protocol) addresses and delivers packets (RFC 791); TCP/IP is the family of protocols the internet runs on; DHCP hands out addresses automatically; ICMP sends test and error messages, and ping uses it.',
              'Sending data as small packets is what makes shared networks practical. If one device sent a large file as a single block, it would occupy the link until it finished and everyone else would wait. Because the file is divided into packets, packets from many devices can be interleaved on the same link. A lost or damaged packet can also be sent again without repeating the whole transfer. Each packet carries both addresses so that the network knows where it came from and where it must go, and the receiving device reassembles the pieces in the correct order.',
              'Protocols are what let different devices cooperate. A protocol is an agreement, and without it two machines would have no way to interpret what the other sends. IP handles addressing and delivery, DHCP handles automatic address assignment, and ICMP handles testing and error reporting. Later lessons return to each of these in detail.',
            ],
            images: [
              pdfImg(
                'net1-packets.jpg',
                'Illustration of a file split into small numbered packets traveling from one computer to another.',
                'Data divided into packets and reassembled at the destination.',
              ),
            ],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '1.7',
        title: 'Measuring a network: bandwidth and latency',
        blocks: [
          {
            paragraphs: [
              'Bandwidth is how much data a link can carry per second, measured in bits per second (for example 100 Mbps or 1 Gbps). Latency is how long a packet takes to get from one device to another, measured in milliseconds (ms), and ping shows it. A road is a good comparison: bandwidth is how many lanes it has, and latency is how long the trip takes.',
            ],
            images: [
              pdfImg(
                'net1-bandwidth.jpg',
                'Comparison of high bandwidth (wide multi-lane pipe) versus low bandwidth (narrow pipe).',
                'High bandwidth vs. low bandwidth.',
              ),
            ],
            imageSide: 'left',
          },
          {
            paragraphs: [
              'Bandwidth and latency describe two different qualities of a connection, and a network can be strong in one and weak in the other. Bandwidth is capacity: it determines how much data can move at once, which matters for large downloads and video. Latency is delay: it determines how quickly a single message arrives, which matters for games and video calls where responsiveness is noticed. A connection with very high bandwidth can still feel slow if its latency is high, in the same way that a wide motorway does not shorten a long journey.',
            ],
            images: [
              pdfImg(
                'net1-latency.jpg',
                'Network latency diagram showing user request and server response travel time between a laptop and a data center.',
                'Network latency: round-trip delay between user and server.',
              ),
            ],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '1.8',
        title: 'A home network in one picture',
        blocks: [
          {
            paragraphs: [
              "In a typical home, the internet provider's line plugs into the modem or router. The router connects to a PC by cable and to a phone and laptop by Wi-Fi. Many home routers are all-in-one boxes that combine a router, a small switch and a Wi-Fi access point.",
              "The home network brings the lesson together. The provider's line enters through the modem or router, and the router is the single point that joins the home LAN to the outside world. Wired devices connect to its built-in switch, while wireless devices connect through its built-in access point. Seen this way, a single household box performs the work of several separate devices from this lesson, and recognising each role makes later topics such as addressing, subnet masks and troubleshooting much easier to follow.",
            ],
          },
        ],
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
    sections: [
      {
        number: '2.1',
        title: 'What is an IP address?',
        blocks: [
          {
            paragraphs: [
              'An IP address is a number that identifies a device on a network, a bit like a house address on a street. Data uses it to find the right device. This lesson covers IPv4, the version still used most in homes and classrooms. An IPv4 address is 32 bits long and is written as four numbers, one for each 8-bit part, with a dot between them. Each part is called an octet, for example 192.168.1.10. Because each octet has 8 bits, each number can run from 0 to 255, so an address such as 192.168.1.256 is not valid.',
              'An IP address does for a network what a street address does for a house: it gives data a precise destination. Without a unique identifier, a packet would have no way to find its recipient. The dotted notation is simply a readable form of a 32-bit number. The computer sees 32 bits, and people see four decimal numbers.',
              'The limit of 255 follows directly from the 8 bits in each octet. Eight bits can represent 256 values, from 0 to 255, so any octet above 255 cannot exist. This is why a number such as 256 or 300 in an address is always an error, and checking each octet against that limit is the quickest way to validate an address.',
            ],
          },
        ],
      },
      {
        number: '2.2',
        title: 'Looking at an address in binary',
        blocks: [
          {
            paragraphs: [
              'Computers store the address as bits. Each bit in an octet has a place value: 128, 64, 32, 16, 8, 4, 2, 1. The place values where the bit is 1 are added together.',
            ],
            table: {
              headers: ['Decimal', 'Binary', 'How it adds up'],
              rows: [
                ['192', '11000000', '128 + 64'],
                ['168', '10101000', '128 + 32 + 8'],
                ['1', '00000001', '1'],
                ['10', '00001010', '8 + 2'],
              ],
            },
          },
          {
            paragraphs: [
              'So 192.168.1.10 is 11000000.10101000.00000001.00001010. The largest octet, 11111111, is 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255. With 32 bits there are 2³² (about 4.3 billion) possible addresses, which is not enough for every device in the world and led to IPv6.',
              'Binary is the form in which devices actually work with addresses, and it is also the key to understanding subnet masks in the next lesson. The method is to treat each octet as eight switches, each carrying a place value that doubles from right to left. Wherever a switch is on, its value is added. For 192, the two highest switches are on, and 128 + 64 gives 192.',
              'The same reasoning explains the limits of the system. If all eight switches are on, the total is 255, so no single octet can be larger. Across the whole address, 32 switches give about 4.3 billion combinations, which seemed enough when the internet was small but is now too few for the number of connected devices. That shortage is the main reason IPv6 was created.',
            ],
          },
        ],
      },
      {
        number: '2.3',
        title: 'Network part and host part',
        blocks: [
          {
            paragraphs: [
              'An address does two jobs. One part says which network a device is on, and the other part says which device it is on that network. Lesson 3 shows how the subnet mask tells where the split is.',
              'This division is the basis of all routing. A postal address has a similar structure: the town identifies the general area, and the street and number identify the exact building. Routers only need to look at the network part to send a packet toward the right network, and only the final network needs the host part to deliver it to the device. The subnet mask, covered next, is the tool that marks where the network part ends and the host part begins.',
            ],
          },
        ],
      },
      {
        number: '2.4',
        title: 'Every device needs its own address',
        blocks: [
          {
            paragraphs: [
              'Each device on a network needs a unique address so data can find the right device. Private addresses only have to be unique inside their own network. When two devices use the same address, an address conflict happens. The network cannot tell the two devices apart, so one or both may lose their connection, show an IP address conflict message, or have an unstable connection. Conflicts often happen when someone types a static address by hand without checking that it is free, or when two DHCP servers hand out overlapping addresses. Address conflict detection is described in RFC 5227.',
              'An address works only if it points to one device. If two devices share it, data meant for one may reach the other, and the network cannot decide between them. The result is the unstable behaviour that users see as dropped connections or a conflict warning. The practical cause is usually human: a static address chosen by hand without checking whether it is already in use. Using automatic assignment through DHCP, or checking before choosing a static address, prevents most conflicts. Private addresses need to be unique only within their own network, which is why the same private address can appear in millions of different homes without any problem.',
            ],
          },
        ],
      },
      {
        number: '2.5',
        title: 'Public and private addresses',
        blocks: [
          {
            paragraphs: [
              'Three blocks of addresses are set aside for private use inside homes and organizations (RFC 1918). They are not used on the public internet.',
            ],
            table: {
              headers: ['Private range', 'From', 'To'],
              rows: [
                ['Block 1', '10.0.0.0', '10.255.255.255'],
                ['Block 2', '172.16.0.0', '172.31.255.255'],
                ['Block 3', '192.168.0.0', '192.168.255.255'],
              ],
            },
          },
          {
            paragraphs: [
              'The course uses the 192.168 block. Private addresses cannot be reached directly from the internet. A home router uses NAT (network address translation) to let many private devices share one public address from the internet provider. NAT is described in RFC 3022.',
              'Private ranges solve two problems. They give every home and organization a free pool of addresses to use internally, and they conserve the limited supply of public addresses. Because private addresses are not routed on the internet, they also give a basic level of separation from outside traffic.',
              'NAT connects the private and public worlds. The router replaces the private address in outgoing packets with its own public address, and keeps a record so that replies can be returned to the correct device. This is how a household with many devices can operate with a single public address. When identifying a range, the quickest method is to compare the first number or two: anything starting with 10, anything from 172.16 to 172.31, and anything starting with 192.168 is private.',
            ],
          },
        ],
      },
      {
        number: '2.6',
        title: 'Special addresses to recognize',
        blocks: [
          {
            table: {
              headers: ['Address', 'Meaning'],
              rows: [
                ['127.0.0.1', 'Loopback. It points back to the device itself and is used to test its own TCP/IP software. The whole 127.0.0.0/8 block is reserved for this (RFC 1122).'],
                ['169.254.x.x', 'Link-local. A device gives itself this address when it cannot reach a DHCP server (RFC 3927). Microsoft calls this APIPA.'],
                ['255.255.255.255', 'Limited broadcast. Data sent here goes to every device on the local network.'],
              ],
            },
            paragraphs: [
              "These addresses have fixed meanings and are not given to ordinary devices. The loopback address is useful because it lets a device test itself without involving the network: if a ping to 127.0.0.1 works, the device's own network software is functioning. The link-local range is a diagnostic clue. A device that shows an address beginning with 169.254 has not received a proper address from a DHCP server, so the problem lies in obtaining an address, and the network itself is not at fault. The broadcast address reaches every device on the local network at once and is used for announcements such as a device looking for a DHCP server.",
            ],
          },
        ],
      },
      {
        number: '2.7',
        title: 'What a device needs to use a network',
        blocks: [
          {
            paragraphs: [
              "A computer's TCP/IP setup needs three items: an IP address (who the device is), a subnet mask (which part of the address is the network), and a default gateway (the router address the device uses to reach other networks). Most devices also receive a DNS server address, which turns names like example.com into IP addresses. It is not needed for the lab.",
              'These three settings form the minimum configuration. The address identifies the device, the mask tells it which addresses are on its own network, and the gateway tells it where to send everything else. If the gateway is missing, the device can still talk to others on its own network, but it cannot reach any other network, including the internet. DNS is a separate convenience that lets people use names in place of numbers, and it is not required for the practical exercises in this course.',
            ],
          },
        ],
      },
      {
        number: '2.8',
        title: 'DHCP and static addresses',
        blocks: [
          {
            bullets: [
              { label: 'DHCP (dynamic)', text: 'a DHCP server, often the home router, hands out the address, mask and gateway automatically (RFC 2131). This is the easiest option.' },
              { label: 'Static', text: 'a person types the settings in by hand. It is useful for servers and printers, but easier to get wrong.' },
            ],
            paragraphs: [
              'DHCP works in four steps, often called DORA: Discover (the new device broadcasts asking for a DHCP server), Offer (the server offers an address), Request (the device asks to use that address), and Acknowledge (the server confirms). The address is leased, meaning it is lent for a set time and must be renewed. If a device cannot reach a DHCP server, Windows may give it an address starting with 169.254, a link-local address that shows DHCP failed.',
              'DHCP automates what would otherwise be manual configuration. The four-step exchange can be followed as a conversation: the device asks if anyone can give it an address, the server offers one, the device accepts, and the server confirms. Because the address is leased, it returns to the pool when the device leaves, which allows many devices to share a limited range over time.',
              'Static addressing remains valuable where a device must always be found at the same place, such as a server or a printer, but it places the responsibility for avoiding duplicates on the person who sets it. For general devices, DHCP is the more reliable choice. When a device displays a 169.254 address, the conversation has failed at the first step, and the DHCP server or the connection to it should be checked.',
            ],
          },
        ],
      },
      {
        number: '2.9',
        title: 'A short look at IPv6',
        blocks: [
          {
            paragraphs: [
              'IPv6 uses 128-bit addresses, written in hexadecimal with colons, for example 2001:db8::1 (RFC 8200 and RFC 4291). It provides a vastly larger number of addresses. IPv4 and IPv6 run side by side today. The course uses IPv4 only.',
              'IPv6 was designed to solve the shortage of IPv4 addresses. With 128 bits instead of 32, the number of possible addresses is so large that every device could have its own public address.',
              'The two versions operate together during a long transition, which is why a learner may see both in real networks. The exercises in this course use IPv4, because its shorter addresses are easier to read, calculate and troubleshoot.',
            ],
          },
        ],
      },
      {
        number: '2.10',
        title: 'The example network',
        blocks: [
          {
            table: {
              headers: ['Item', 'Value'],
              rows: [
                ['Network', '192.168.1.0'],
                ['Router (default gateway)', '192.168.1.1'],
                ['Devices', '192.168.1.2 to 192.168.1.254'],
              ],
            },
            paragraphs: [
              'This range sits inside the private block 192.168.0.0 to 192.168.255.255. The address ending in .0 names the network and the address ending in .255 is the broadcast address, so devices do not use them.',
              'This network is the running example for the rest of the course, and its layout is deliberate. The router takes the first usable address, .1, which makes the gateway easy to remember, and ordinary devices take the addresses from .2 to .254. The two ends of the range are reserved: .0 identifies the network itself, and .255 reaches all devices on it. Lesson 3 explains why these two addresses cannot be assigned to devices.',
            ],
          },
        ],
      },
      {
        number: '2.11',
        title: 'Seeing your own address',
        blocks: [
          {
            paragraphs: [
              'On Windows, open Command Prompt and type ipconfig. On Linux, type ip addr. On macOS, type ifconfig or look in Network settings.',
              "A device's actual settings, and not the ones the user expects, are what determine its behaviour, so reading them is the first step in almost any network check. Each operating system provides a command for this, and the output shows the address, mask and gateway in use. Later, when a connection fails, comparing this output with the planned values is the fastest way to find a typing mistake.",
            ],
          },
        ],
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
    sections: [
      {
        number: '3.1',
        title: 'What a subnet mask does',
        blocks: [
          {
            paragraphs: [
              'A subnet mask is a number that splits an IP address into a network part and a host part. It looks like an address, but it is not one. Devices use it to decide whether another device is on the same network (local) or on a different network (remote).',
              'An address alone does not show where the network ends and the device begins. The mask provides that information. It is a companion to the address and has no meaning by itself, which is why it must never be read as an address. Every time a device wants to send data, it uses the mask to answer one question: is the destination on my own network or somewhere else? The answer decides whether the data goes straight to the destination or to the router.',
            ],
          },
        ],
      },
      {
        number: '3.2',
        title: 'Reading 255.255.255.0',
        blocks: [
          {
            paragraphs: [
              'The mask 255.255.255.0 in binary is 24 ones followed by 8 zeros: 11111111.11111111.11111111.00000000. The ones cover the network part and the zeros cover the host part. With this mask, the first three numbers of the address are the network part, and the last number is the host part.',
              'The mask works as a stencil laid over the address. Wherever the mask has a 1, the matching address bit belongs to the network. Wherever it has a 0, the bit belongs to the host. Since 255 is eight ones and 0 is eight zeros, the mask 255.255.255.0 simply says that the first three octets name the network and the last octet names the device. Reading a mask in this way, as a boundary line, makes every later calculation easier to follow.',
            ],
          },
        ],
      },
      {
        number: '3.3',
        title: 'Slash notation (/24)',
        blocks: [
          {
            paragraphs: [
              'A short way to write the same mask is /24. The number after the slash counts the ones in the mask. This is called prefix notation and is part of CIDR (Classless Inter-Domain Routing, RFC 4632). For example, 192.168.1.0/24 means the network 192.168.1.0 with a 24-bit mask.',
            ],
            table: {
              headers: ['Mask', 'Prefix', 'Network bits', 'Host bits', 'Usable hosts'],
              rows: [
                ['255.0.0.0', '/8', '8', '24', '16,777,214'],
                ['255.255.0.0', '/16', '16', '16', '65,534'],
                ['255.255.255.0', '/24', '24', '8', '254'],
                ['255.255.255.128', '/25', '25', '7', '126'],
                ['255.255.255.192', '/26', '26', '6', '62'],
                ['255.255.255.252', '/30', '30', '2', '2'],
              ],
            },
          },
          {
            paragraphs: [
              'Prefix notation is a shorthand that states the same information in fewer characters. Instead of writing four numbers, it counts how many bits belong to the network. A /24 means 24 network bits, and the remaining 8 of the 32 bits are host bits. The table shows the trade-off at the heart of subnetting: every bit moved from the host side to the network side halves the number of devices a network can hold. A /24 holds 254 devices, a /25 holds 126, and a /26 holds 62. A larger prefix therefore means a smaller network.',
            ],
          },
        ],
      },
      {
        number: '3.4',
        title: 'How many devices fit? (usable hosts)',
        blocks: [
          {
            paragraphs: [
              'A /24 network has 8 host bits, and 8 bits give 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 256 combinations. Two of them are reserved. The network address is the first one, where all host bits are 0; for 192.168.1.0/24 it is 192.168.1.0 and it names the network itself. The broadcast address is the last one, where all host bits are 1; for 192.168.1.0/24 it is 192.168.1.255, and data sent to it goes to all devices on the network. Devices cannot use these two, so a /24 has 256 − 2 = 254 usable host addresses, from 192.168.1.1 to 192.168.1.254.',
              'The general rule is: usable hosts = 2^(host bits) − 2. A /31 is a special case used on router-to-router links (RFC 3021) and is not needed in this course.',
              'The number of addresses in a network depends only on the number of host bits. Each host bit doubles the count, so 8 bits give 256 and 6 bits give 64. Two addresses in every network are given special jobs: the lowest names the network, and the highest reaches every device on it. Because they are reserved, they cannot be assigned to a device, which is why the formula subtracts 2.',
              'The rule can be applied to any prefix. For a /26 there are 6 host bits, so 2⁶ = 64 addresses, and after the two reserved ones, 62 are usable. A common error is to quote 256 as the number of devices in a /24, which forgets the reserved addresses.',
            ],
          },
        ],
      },
      {
        number: '3.5',
        title: 'How the computer decides: the AND rule',
        blocks: [
          {
            paragraphs: [
              'To find the network address, a device lines up the address and the mask in binary. For each bit, the result is 1 only if both bits are 1 (a logical AND). For 192.168.1.10 with mask 255.255.255.0:',
            ],
            table: {
              headers: ['Item', 'Binary', 'Decimal'],
              rows: [
                ['Address', '11000000.10101000.00000001.00001010', '192.168.1.10'],
                ['Mask', '11111111.11111111.11111111.00000000', '255.255.255.0'],
                ['Result (network)', '11000000.10101000.00000001.00000000', '192.168.1.0'],
              ],
            },
          },
          {
            paragraphs: [
              'The result, 192.168.1.0, is the network address. Two devices are on the same network if the AND of their addresses with the mask gives the same result.',
              'The AND operation acts as a filter. Where the mask has a 1, the address bit passes through unchanged. Where the mask has a 0, the result is forced to 0. The host part is therefore erased, and only the network part remains. In the example, the last octet 10 is cleared to 0, which leaves the network address 192.168.1.0.',
              'The method gives a precise test for whether two devices share a network: apply the same mask to both addresses and compare the results. If they are identical, the devices are on the same network. This is exactly the calculation a device performs before deciding where to send each packet, and it works for every mask, including those that do not align with whole octets.',
            ],
          },
        ],
      },
      {
        number: '3.6',
        title: 'Worked example: same network or not?',
        blocks: [
          {
            paragraphs: [
              'With mask 255.255.255.0, the first three numbers are the network part.',
            ],
            table: {
              headers: ['Address', 'Network part', 'Host part'],
              rows: [
                ['192.168.1.10', '192.168.1', '10'],
                ['192.168.1.20', '192.168.1', '20'],
                ['192.168.2.10', '192.168.2', '10'],
              ],
            },
          },
          {
            paragraphs: [
              '192.168.1.10 and 192.168.1.20 have the same network part, so they are on the same network and can talk directly. 192.168.1.10 and 192.168.2.10 have different network parts, so they are not on the same network, and a router is needed between them.',
              'Steps to check: write down both addresses and the mask; find the octets where the mask is 255, since those are the network part; compare those octets, and if they match, the devices are on the same network. These steps work when the mask uses only 255 and 0, such as /8, /16 and /24. For masks like /25, the AND rule in 3.5 is used.',
              'The shortcut makes everyday checks fast. When the mask is 255.255.255.0, only the first three octets matter, and the last octet can be ignored. This is why 192.168.1.10 and 192.168.1.20 are neighbours, while 192.168.1.10 and 192.168.2.10 are not, even though they look almost identical. A single digit in the third octet places them on different networks.',
              'The limitation of the shortcut matters as much as the shortcut itself. It depends on every octet of the mask being either fully on or fully off. As soon as a mask splits an octet, as /25 does, comparing whole octets gives the wrong answer, and the AND rule must be used instead.',
            ],
          },
        ],
      },
      {
        number: '3.7',
        title: 'A harder example (optional)',
        blocks: [
          {
            paragraphs: [
              'Mask 255.255.255.128 (/25) splits each 256-address block into two halves: .0 to .127 and .128 to .255. So 192.168.1.10 and 192.168.1.200 are on different networks, even though the first three numbers match.',
              'This example shows why the AND rule is the reliable method. With a /25 mask, the network boundary falls in the middle of the last octet. Addresses from .0 to .127 belong to one network, and addresses from .128 to .255 belong to another. The two addresses share their first three octets, but 10 falls in the lower half and 200 in the upper half, so applying the mask gives two different network addresses, 192.168.1.0 and 192.168.1.128.',
            ],
          },
        ],
      },
      {
        number: '3.8',
        title: 'What happens when the destination is remote',
        blocks: [
          {
            paragraphs: [
              'When a device wants to send data, it applies its own mask to the destination address. If the destination is on the same network, the device sends the data directly to it. If it is on a different network, the device sends the data to the default gateway, and the router takes over. This is why a wrong mask or a missing gateway breaks communication.',
              'The mask and the default gateway work as a pair. The mask lets a device sort every destination into two groups: those it can reach itself and those it cannot. For the second group it relies entirely on the gateway. A wrong mask causes the device to misjudge which group a destination belongs to, and a missing or wrong gateway leaves remote destinations with nowhere to go. Many connection problems that look mysterious, such as being able to reach the router but not the internet, trace back to one of these two settings.',
            ],
          },
        ],
      },
      {
        number: '3.9',
        title: 'The example network',
        blocks: [
          {
            paragraphs: [
              'The example network, 192.168.1.0 with mask 255.255.255.0, has the router at .1 and devices from .2 to .254.',
              'In this network all devices share the same first three octets, 192.168.1, so they are on one network and can communicate directly. Anything outside that range, including the internet, is reached through the router at 192.168.1.1. The layout is a practical application of everything in this lesson: the mask defines the network, the reserved addresses at both ends are excluded, and the gateway handles all remote destinations.',
            ],
          },
        ],
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
    sections: [
      {
        number: '4.1',
        title: 'The router',
        blocks: [
          {
            paragraphs: [
              'A router moves data between different networks. It uses a routing table, a list of paths to destinations, to decide where to send each packet (RFC 1812 describes router requirements).',
            ],
            bullets: [
              'It joins the LAN to other networks such as the internet.',
              'Its LAN-side address is the default gateway for the devices on the network (here 192.168.1.1).',
              'Home routers often bundle a router, a small switch and Wi-Fi in one box.',
              'A home router usually does NAT, so all devices share one public address.',
            ],
            images: [routerImage],
            imageSide: 'right',
          },
          {
            paragraphs: [
              'A routing table works like a list of directions. A very simple one might read: for 192.168.1.0/24, send out the LAN port; for everything else, send to the internet provider. That last rule is called the default route.',
              'The router is the device that makes the internet possible, because it connects separate networks and decides where each packet should go next. Its decision-making tool is the routing table. Each entry pairs a destination network with the direction in which to send traffic for it. When a packet arrives, the router finds the best matching entry and forwards the packet accordingly.',
              "The default route is the entry that makes a small network simple. A home router does not need to know the path to every network in the world. It knows its own LAN, and it sends everything else to the internet provider, which holds the wider knowledge. The router's address on the LAN side becomes the default gateway for every device, which is why the gateway setting in Lesson 2 points to 192.168.1.1. The NAT feature mentioned here is the same one introduced earlier: it lets the whole household share one public address.",
            ],
          },
        ],
      },
      {
        number: '4.2',
        title: 'The switch',
        blocks: [
          {
            paragraphs: [
              'A switch connects devices inside one LAN. When data arrives, the switch sends it only to the single device it is intended for, instead of to every device, which keeps the network fast. Every network card has a MAC address, a 48-bit hardware address set by the manufacturer and usually written like 00:1A:2B:3C:4D:5E. A switch learns which MAC address is on which port:',
            ],
            ordered: [
              "A frame arrives. The switch notes the sender's MAC address and the port it came from.",
              "If the switch knows the destination's port, it sends the frame only there.",
              'If it does not know, it sends the frame out of all other ports. The right device answers, and the switch learns.',
            ],
            images: [switchImage],
            imageSide: 'left',
          },
          {
            paragraphs: [
              'If a router runs out of ports, a switch can be plugged into one router port to add more wired devices. MAC address learning and forwarding are defined in IEEE 802.1D.',
              'A switch builds a map of its own network as it operates. Each time a frame arrives, the switch records which MAC address is reachable through which port. Over time it learns where every device is, and it can then deliver each frame to exactly one port. When it meets a destination it has not seen before, it uses a safe fallback: it sends the frame to all other ports, and the device that owns the address replies, which teaches the switch its location.',
              'This behaviour explains why a switch performs better than a hub. Traffic between two devices does not burden the other ports, so several conversations can take place at once. The switch also needs no configuration in a basic setup, because it learns automatically. For the builder, the practical value is simple: when a router has too few ports, adding a switch extends the network without any change to the addressing.',
            ],
          },
        ],
      },
      {
        number: '4.3',
        title: 'The hub',
        blocks: [
          {
            paragraphs: [
              'A hub is a multiport repeater. It repeats what it receives out of its other ports, so every device on the hub sees the data. As more devices are added, a hub wastes capacity, and devices that send at the same time cause collisions. Switches do the same job better, so hubs are now rare.',
              'A hub has no knowledge of the devices connected to it. It receives a signal and repeats it everywhere, so every connected device shares one pool of capacity and must take turns. When two devices transmit at once, their signals collide and must be sent again, which wastes time. The problem grows as devices are added. Understanding the hub is useful mostly as a contrast, because it shows what the switch improved: the same physical function, but with the intelligence to send data only where it is needed.',
            ],
            images: [hubImage],
            imageSide: 'right',
          },
        ],
      },
      {
        number: '4.4',
        title: 'Router, switch and hub compared',
        blocks: [
          {
            table: {
              headers: ['Feature', 'Router', 'Switch', 'Hub'],
              rows: [
                ['Connects', 'Different networks', 'Devices in one network', 'Devices in one network'],
                ['Looks at', 'IP address', 'MAC address', 'Nothing'],
                ['How it sends data', 'Along a path chosen from its routing table', 'Only to the intended device', 'To all other ports'],
                ['Intelligence', 'High', 'Medium', 'None'],
                ['Typical place', 'Between the LAN and the internet', 'Inside the LAN', 'Old or very simple LANs'],
              ],
            },
            paragraphs: [
              'The table can be summarised in a single idea: each device makes its decision using a different piece of information. The router reads the IP address, which identifies a network and a device, so it can choose a path between networks. The switch reads the MAC address, which identifies a network card on the local link, so it can choose a port within one network. The hub reads nothing and simply repeats. The more information a device uses, the more precisely it can direct data, which is why intelligence rises from the hub to the switch to the router. A useful summary is that switches let devices talk and routers let networks talk.',
            ],
          },
        ],
      },
      {
        number: '4.5',
        title: 'How IP and MAC addresses work together',
        blocks: [
          {
            paragraphs: [
              "The IP address says which device on which network. The MAC address says which network card on this local link. Inside one LAN, a device uses ARP (Address Resolution Protocol, RFC 826) to ask who has a given IP address and to learn its MAC address. Then it sends the frame to that MAC address through the switch. When data leaves the LAN, the device sends it to the router's MAC address, and the router forwards it toward the destination. On Windows, the ARP table can be shown with arp -a.",
              'Both addresses are needed because they serve different purposes. The IP address is the logical destination of the data, and it stays the same as data travels across many networks. The MAC address is used only for the next hop on the local link. When a device wants to reach 192.168.1.11, it knows the IP address but not the MAC address, so it asks the whole LAN, using ARP, who owns that IP. The owner replies with its MAC address, and the device can then deliver the frame through the switch.',
              "For a destination outside the LAN, the device still keeps the remote IP address in the packet, but it addresses the frame to the router's MAC address, because the router is the next hop. The router then repeats the process on its other network. Seen this way, the IP address describes the whole journey, and the MAC address describes each individual step.",
            ],
          },
        ],
      },
      {
        number: '4.6',
        title: 'DHCP on a home router',
        blocks: [
          {
            paragraphs: [
              'A home router can act as the DHCP server (RFC 2131). It gives each device an address, mask and gateway automatically. A common default address for a home router is 192.168.0.1 or 192.168.1.1, and the course uses 192.168.1.1.',
              'In a home, the router normally takes on the DHCP role as well, so devices receive working settings the moment they connect. This is convenient because the router already knows its own address and mask, and it can pass the correct gateway to every device. If this function is switched off, devices no longer receive addresses automatically, and static addresses must be entered by hand on each one. The practical advice is to leave DHCP on unless there is a specific reason to manage addresses manually.',
            ],
          },
        ],
      },
      {
        number: '4.7',
        title: 'Switches let devices talk. Routers let networks talk.',
        blocks: [
          {
            paragraphs: [
              'For device to device communication in the same LAN, data goes through the switch. For communication with the internet or another network, data goes through the router.',
              'This rule gives a quick way to decide which device is involved in any path. When two computers in the same room exchange files, the data travels between them through the switch and never touches the router. When a computer requests a web page, the data must leave the LAN, so the router handles it. Applying the rule to a diagram of a network is the fastest way to predict where traffic will flow and where a fault might be.',
            ],
          },
        ],
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
    sections: [
      {
        number: '5.1',
        title: 'The three cable types',
        blocks: [
          {
            table: {
              headers: ['Cable', 'How it carries data', 'Good for', 'Limits'],
              rows: [
                ['Ethernet (twisted pair, e.g. Cat6)', 'Electrical signals over copper pairs', 'Homes, offices, switch-to-PC links', '100 m per segment'],
                ['Fiber optic', 'Pulses of light through glass', 'Long links, fast backbones', 'Costs more'],
                ['Coaxial', 'Electrical signals over a copper core with a shield', 'Cable TV and broadband', 'Older for LANs'],
              ],
            },
          },
          {
            heading: 'Ethernet (twisted pair)',
            paragraphs: [
              'Copper wires twisted in pairs, which reduces interference. It ends in an RJ-45 plug with eight connections, is inexpensive, and is the most popular choice for LANs. A segment of UTP cable can be up to 100 meters long. Modern network ports can adapt to the cable, so a special crossover cable is rarely needed today.',
            ],
            table: {
              headers: ['Category', 'Bandwidth', 'Speed'],
              rows: [
                ['Cat5e', '100 MHz', 'Up to 1 Gbps at 100 m'],
                ['Cat6', '250 MHz', '1 Gbps at 100 m, up to 10 Gbps at 55 m or less'],
                ['Cat6A', '500 MHz', '10 Gbps at 100 m'],
              ],
            },
            images: [ethernetImage],
            imageSide: 'right',
          },
          {
            heading: 'Fiber optic',
            paragraphs: [
              'For this build, a Cat6 cable is a good choice. A cable cannot make a slow network faster: if the switch runs at 1 Gbps, the link runs at 1 Gbps.',
              'Glass strands (a core wrapped in cladding) carry data as pulses of light. Fiber is not affected by electrical interference, runs for many miles, and costs more. There are two main kinds: single-mode for very long distances, and multimode for shorter runs inside buildings.',
            ],
            images: [
              img(
                'net5-fiber-cable.jpg',
                'A cutaway view of a fiber optic cable showing its protective layers and glass fiber strands.',
                'A fiber optic cable cutaway showing internal fiber strands.',
                { available: true, credit: ASSET_CREDIT },
              ),
            ],
            imageSide: 'left',
          },
          {
            heading: 'Coaxial',
            paragraphs: [
              'A copper core, an insulating layer, a braided metal shield and an outer cover. It resists interference well and suits longer runs than twisted pairs. It is used for cable TV and broadband and in older Ethernet. A common connector is the BNC.',
            ],
            images: [
              img(
                'net5-coax-cable.jpg',
                'Coaxial cables with metal F-type connectors.',
                'Coaxial cables with F-type connectors.',
                { available: true, credit: ASSET_CREDIT },
              ),
            ],
            imageSide: 'right',
          },
          {
            paragraphs: [
              'The choice of cable depends on distance, speed, environment and cost. Twisted pair is the everyday answer for LANs because it is inexpensive, easy to install and fast enough for homes and offices. Its limit of 100 metres per segment is the main constraint. Fiber removes that limit by carrying light instead of electricity, which makes it immune to electrical interference and suitable for long links between buildings, though at a higher price. Coaxial, with its shielded copper design, is mainly met today in cable television and broadband connections.',
              'The category table shows how twisted-pair cables improve in steps. Higher categories support higher frequencies and therefore higher speeds, so Cat6A suits 10 Gbps runs of full length, while Cat5e and Cat6 are enough for gigabit use. The cable, however, is only one part of the speed of a link. The slowest device in the path sets the limit, so a Cat6 cable connected to a 1 Gbps switch will still run at 1 Gbps. Choosing a cable that matches the equipment avoids both underperformance and unnecessary cost.',
            ],
          },
        ],
      },
      {
        number: '5.2',
        title: 'Build steps',
        blocks: [
          {
            paragraphs: [
              'The network to be built has one router, one PC, one laptop and one switch or hub.',
            ],
            ordered: [
              'Place the router, PC, laptop and switch or hub on the grid.',
              'Give the router the address 192.168.1.1.',
              'Give each computer its own address from 192.168.1.2 to 192.168.1.254. Example: PC 192.168.1.10, laptop 192.168.1.11.',
              'Set the subnet mask to 255.255.255.0 on each computer.',
              'Set the default gateway to 192.168.1.1 on each computer.',
              'Choose a cable (Ethernet for this build) and connect each device.',
            ],
            table: {
              headers: ['Device', 'IP address', 'Subnet mask', 'Default gateway'],
              rows: [
                ['Router', '192.168.1.1', '255.255.255.0', '-'],
                ['PC', '192.168.1.10', '255.255.255.0', '192.168.1.1'],
                ['Laptop', '192.168.1.11', '255.255.255.0', '192.168.1.1'],
              ],
            },
          },
          {
            paragraphs: [
              'The build applies to each earlier lesson in sequence. The router takes the gateway address, 192.168.1.1. Each computer receives a unique address from the usable range, so no two devices share one, which avoids the conflicts described in Lesson 2. All devices use the same mask, 255.255.255.0, so they recognise each other as being on one network, as explained in Lesson 3. Every computer points to 192.168.1.1 as its gateway, so any traffic for other networks has a route out. The switch or hub only joins the devices physically and needs no address of its own in this simple setup. The addressing table is worth keeping nearby during the build, because most faults come from a value that differs from the plan.',
            ],
          },
        ],
      },
      {
        number: '5.3',
        title: 'Test with ping',
        blocks: [
          {
            paragraphs: [
              'Ping checks whether one device can reach another. It sends an ICMP echo request and waits for an echo reply (RFC 792), then shows the round-trip time. The tests run in order: ping the device itself with ping 127.0.0.1, which proves the TCP/IP software works; ping the router with ping 192.168.1.1; then ping the laptop with ping 192.168.1.11. Replies with a time in milliseconds mean success. On Windows, ping sends four requests and prints a summary of packets sent, received and lost, and 0% loss is the goal.',
            ],
            table: {
              headers: ['Part of the output', 'Meaning'],
              rows: [
                ['time=1ms', 'Round-trip time (latency)'],
                ['TTL', 'Time to live: how many routers the packet may still cross'],
                ['Lost = 0', 'No packets dropped'],
              ],
            },
          },
          {
            paragraphs: [
              'If the result is Request timed out, check in order: the cable is plugged in at both ends; the address and mask are typed correctly; the default gateway is correct; and a firewall is not blocking ping. Some devices block ping on purpose, so a failed ping does not always mean the network is broken.',
            ],
            table: {
              headers: ['Message', 'Likely meaning'],
              rows: [
                ['Request timed out', 'No reply came back (cable, address, mask or firewall)'],
                ['Destination host unreachable', 'The device or a router on the path knows it cannot reach that address'],
                ['General failure', 'The network adapter has no valid setup'],
              ],
            },
          },
          {
            paragraphs: [
              "On Windows, ipconfig shows the device's address, mask and gateway, so what was really set can be checked.",
              'The order of the pings is deliberate, and each test widens the area being checked. Pinging 127.0.0.1 tests only the device itself. If it fails, nothing about the cable or the router matters, because the problem is inside the device. Pinging the router tests the link and the addressing between the device and its gateway. Pinging the laptop tests the path to another device on the network. A failure at any stage shows where the fault begins, since everything before it has already passed.',
              'The output carries useful detail. The time shows latency, a loss of 0% shows a healthy link, and the TTL value counts down as the packet crosses routers. The error messages are also informative: a timeout means nothing returned, while destination unreachable means something on the path actively reported that the address cannot be reached. It is important to remember that a firewall can deliberately block ping, so a failed ping on its own is a clue and not a verdict. Comparing the ipconfig output with the planned table is the quickest way to detect a mistyped value.',
            ],
          },
        ],
      },
      {
        number: '5.4',
        title: 'Troubleshooting method',
        blocks: [
          {
            paragraphs: [
              'Work from the bottom up and change one thing at a time: Cable (is it connected, and are the link lights on?); Addressing (does ipconfig show the address, mask and gateway expected?); Router (can the router be pinged?); Other devices (can the laptop be pinged?); Security (is a firewall blocking ping?).',
              'Working from the bottom up follows the way a network is built: physical connection first, then addressing, then the router, then other devices, and finally security settings. Each layer depends on the one below, so checking in this order avoids wasted effort. For example, there is no point examining firewall rules if the cable is unplugged. Changing only one thing at a time is equally important. If several settings are changed together and the problem disappears, it is impossible to know which change fixed it, and the lesson is lost for the next fault.',
            ],
          },
        ],
      },
      {
        number: '5.5',
        title: 'Lab record sheet',
        blocks: [
          {
            table: {
              headers: ['Test', 'Command', 'Result (pass/fail)', 'Time (ms)'],
              rows: [
                ['Own device', 'ping 127.0.0.1', '—', '—'],
                ['PC to router', 'ping 192.168.1.1', '—', '—'],
                ['PC to laptop', 'ping 192.168.1.11', '—', '—'],
                ['Laptop to router', 'ping 192.168.1.1', '—', '—'],
              ],
            },
            paragraphs: [
              'The record sheet turns the tests into evidence. Writing down each result and its time gives a clear picture of the network at the moment it was built, and it helps to compare later if performance changes. The four tests cover both computers and both directions toward the router, so together they confirm that the addressing, the cabling and the gateway all work. A complete sheet with passes in every row is the proof that the network was built correctly.',
            ],
          },
        ],
      },
      {
        number: '5.6',
        title: 'Safety',
        blocks: [
          {
            paragraphs: [
              'Unplug equipment before changing cables. Touching bare metal on a case first to discharge static is a good habit. Do not bend cables sharply or pull on them by the wire. Hold the plug.',
              'These habits protect both the equipment and the builder. Disconnecting power before changing cables removes any risk to people and prevents damage to ports. Sharp bends damage the wires inside a cable, and pulling on the cable instead of the plug can break the connection at the point where it enters the connector. Such damage can produce faults that come and go, which are among the hardest to diagnose, so careful handling is also good troubleshooting practice.',
            ],
          },
        ],
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
