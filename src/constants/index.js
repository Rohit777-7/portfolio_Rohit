import sixty3 from "../assets/projects/sixty3.jpg";
import jpInfra from "../assets/projects/jp-infra.jpg";
import rideflow from "../assets/projects/rideflow.jpg";
import bookstore from "../assets/projects/bookstore.jpg";

// ─────────────────────────────────────────────────────────────
//  Everything on the site is driven from this file.
//  Edit text, links and projects here — no component changes needed.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: "Rohitkumar Yadav",
  firstName: "Rohit",
  role: "Creative Frontend Developer",
  company: "Brainwing Innovations",
  location: "India",
  timezone: "Asia/Kolkata",
  email: "rohityadavit45@gmail.com",
  available: true,
  mernYears: 2,
  heroStats: [
    { value: "2+", label: "Years MERN" },
    { value: "4", label: "Live projects" },
  ],
  // Optional: drop a PDF into /public and set e.g. "/Rohitkumar-Yadav-Resume.pdf"
  resume: "",
};

export const socials = [
  { label: "GitHub", href: "https://github.com/Rohit777-7" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rohitkumar-yadav7" },
].filter((s) => s.href);

export const navLinks = [
  { id: "about", title: "About" },
  { id: "experience", title: "Experience" },
  { id: "work", title: "Work" },
  { id: "contact", title: "Contact" },
];

export const stats = [
  { value: 2, suffix: "+", label: "Years hands-on with the MERN stack" },
  { value: 4, suffix: "+", label: "Months building in production" },
  { value: 4, suffix: "", label: "Live projects shipped" },
  { value: 2, suffix: "", label: "Real-estate client launches" },
];

export const stack = [
  "React",
  "Next.js",
  "JavaScript",
  "TypeScript",
  "GSAP",
  "ScrollTrigger",
  "Framer Motion",
  "Three.js",
  "Tailwind CSS",
  "Node.js",
  "Express",
  "MongoDB",
  "REST APIs",
  "Socket.IO",
  "MapLibre",
  "Figma",
  "Git",
  "Vercel",
];

export const capabilities = [
  {
    title: "Motion & interaction",
    body: "Scroll-driven storytelling, page transitions and micro-interactions with GSAP, ScrollTrigger and Framer Motion.",
    tags: ["GSAP", "ScrollTrigger", "Framer Motion"],
  },
  {
    title: "Immersive web",
    body: "360° tours, interactive floor pickers, live maps and WebGL touches that make a site feel like a product.",
    tags: ["Three.js", "360° tours", "MapLibre"],
  },
  {
    title: "Pixel-perfect builds",
    body: "Designs translated faithfully into fast, responsive and accessible interfaces.",
    tags: ["Tailwind", "Figma", "Performance"],
  },
  {
    title: "Full-stack MERN",
    body: "2+ years of hands-on MERN: REST APIs with Node and Express, MongoDB data models, auth, carts and orders, wired to React frontends with real-time updates over WebSockets.",
    tags: ["MongoDB", "Express", "React", "Node.js", "Socket.IO"],
  },
];

export const experiences = [
  {
    company: "Brainwing Innovations",
    role: "Creative Frontend Developer",
    period: "Jul 2026 — Present",
    current: true,
    summary:
      "Building cinematic launch websites for real-estate developers: interactive, motion-first experiences that let buyers explore a project before it is built.",
    points: [
      "Built the SIXTY3 W.E. Residences site with an interactive tower: pick any floor to open its plan or the view from that height.",
      "Worked on a 360° virtual tour and a commute map with live routing for the same project.",
      "Built Codename Endgame for JP Infra: a fly-through-the-clouds intro and scroll-driven storytelling with GSAP ScrollTrigger.",
      "Turn designs into responsive, high-performance React interfaces and tune animations to run smoothly on mobile.",
    ],
    stack: ["React", "GSAP", "ScrollTrigger", "MapLibre", "360° tours"],
  },
  {
    company: "Full-stack projects",
    role: "MERN Stack Developer",
    period: "2+ years hands-on",
    current: false,
    summary:
      "Building complete web apps end to end with MongoDB, Express, React and Node.js, from database design and APIs to polished, responsive frontends.",
    points: [
      "Built RideFlow, a real-time ride-booking platform with separate rider and driver apps kept in sync over WebSockets.",
      "Built a full bookstore with catalogue, search, wishlist, cart and orders backed by MongoDB.",
      "Designed REST APIs with Node and Express, including authentication and role-based flows.",
      "Deployed and maintained apps on Vercel with a focus on clean, reusable code.",
    ],
    stack: ["MongoDB", "Express", "React", "Node.js", "Socket.IO", "Next.js"],
  },
];

export const projects = [
  {
    slug: "sixty3",
    title: "SIXTY3 W.E. Residences",
    kind: "client",
    client: "Brainwing · Client",
    year: "2026",
    blurb:
      "Interactive launch site for a luxury tower in Goregaon (E), Mumbai. Pick a floor on the tower to open its plan or the view from that height, take a 360° tour, and check commute times on a live map.",
    highlights: ["Floor-picker tower", "360° virtual tour", "Live commute routing"],
    tags: ["React", "GSAP", "MapLibre", "360°"],
    image: sixty3,
    live: "https://sixty3-brainwing.vercel.app/",
    accent: "#c9a86a",
  },
  {
    slug: "endgame",
    title: "Codename Endgame",
    kind: "client",
    client: "JP Infra · via Brainwing",
    year: "2026",
    blurb:
      "Cinematic launch experience for JP Infra's North Garden City: a fly-through-the-clouds intro, scroll-driven storytelling and a 360° world to explore the spaces.",
    highlights: ["Cinematic intro", "Scroll storytelling", "360° world"],
    tags: ["React", "GSAP", "ScrollTrigger"],
    image: jpInfra,
    live: "https://jp-infra-brainwing.vercel.app/",
    accent: "#e8c9a0",
  },
  {
    slug: "rideflow",
    title: "RideFlow",
    kind: "personal",
    client: "Personal project",
    year: "2026",
    blurb:
      "Real-time ride-booking platform with separate rider and driver apps. Bikes, autos and cabs on a live map, PIN-verified pickups, upfront fares, wallet, in-trip chat and SOS, all synced over WebSockets.",
    highlights: ["Rider + driver apps", "Live map tracking", "Real-time over WebSockets"],
    tags: ["React", "Socket.IO", "MapLibre", "GSAP"],
    image: rideflow,
    live: "https://smart-ride-rohit.vercel.app/",
    code: "",
    accent: "#3b82f6",
  },
  {
    slug: "bookstore",
    title: "Book Store",
    kind: "personal",
    client: "Personal project",
    year: "2026",
    blurb:
      "Curated online bookstore with weekly trending picks, a deal-of-the-day countdown, wishlist, cart and orders, plus a Ctrl+K search across the catalogue.",
    highlights: ["Ctrl+K search", "Cart & wishlist", "Deal countdown"],
    tags: ["Next.js", "React", "MongoDB"],
    image: bookstore,
    live: "https://bookstore-application-2026.vercel.app/",
    code: "",
    accent: "#d4a85a",
  },
];
