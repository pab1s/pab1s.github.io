export const siteConfig = {
  title: "Pablo Olivares",
  labName: "NEOLAB",
  tagline: "ML engineer · data alchemist · tinkerer",
  currently: "Currently engineering ML at Santander.",
  description:
    "Pablo Olivares — ML engineer and data scientist. Welcome to the NEOLAB: projects, notes, and experiments built with PyTorch, curiosity, and a pinch of alchemy.",
  url: "https://pab1s.github.io",
  author: "Pablo Olivares",
  googleAnalyticsId: "G-Q6BZDBC20J",
  social: [
    { name: "GitHub", href: "https://github.com/pab1s", icon: "github" },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/pablolivares/?locale=en_US",
      icon: "linkedin",
    },
    { name: "Email", href: "mailto:pablolivares1502@gmail.com", icon: "email" },
  ],
  nav: [
    { name: "Lab Notes", href: "/blog/" },
    { name: "Experiments", href: "/projects/" },
    { name: "Resume", href: "/resume/" },
    { name: "Search", href: "/search/" },
  ],
  /** Avatar shown in nav and hero. File in `/public/`. */
  avatarSrc: "/avatar.png",
  /** Panel LOG / proyecto en portada. */
  homeFeed: {
    /** Índice en `telemetryLines` para la línea del pie del dock. */
    telemetryLineIndex: 0,
  },
} as const;

export const telemetryLines = [
  "Currently reading: The Book of Why",
  "Last experiment: LLM interpretability pipeline",
  "Stargazing: Tracking Jupiter's moons",
  "Tinkering with: Conformal prediction",
];
