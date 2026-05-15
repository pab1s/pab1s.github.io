export const siteConfig = {
  title: "Pablo Olivares",
  tagline:
    "ML engineer · data alchemist · build notes in the open",
  description:
    "Pablo Olivares — ML engineer and data scientist. Writing about ML, statistical learning, and experiments.",
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
    { name: "Blog", href: "/blog/" },
    { name: "Projects", href: "/projects/" },
    { name: "Resume", href: "/resume/" },
    { name: "Search", href: "/search/" },
  ],
  /** Portada orbital: archivo en `/public/` */
  avatarSrc: "/avatar.svg",
  /** Subtítulo debajo del nombre en la tarjeta (texto anterior de la portada). */
  orbitHomeSubtitle: "Laboratorio · órbita sintética en optimización permanente",
  /** Panel LOG / proyecto en portada: match `title` en `projects.json`; vacío = primer proyecto. */
  homeFeed: {
    featuredProjectTitle: "",
    /** Índice en `telemetryLines` para la línea del pie del dock. */
    telemetryLineIndex: 0,
  },
} as const;

export const telemetryLines = [
  "NEURAL_LINK: STANDBY",
  "GRID_REF: SOL_00·LAB_NOTEBOOK",
  "ORBIT_TELEMETRY: NOMINAL",
  "LATENT_SPACE: CALIBRATED",
  "TOOLS: PYTHON · PYTORCH · NOTE SCRAPS",
];
