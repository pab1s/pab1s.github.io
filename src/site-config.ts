export const siteConfig = {
  title: "Pablo Olivares",
  tagline: "ML engineer · data alchemist · tinkerer",
  description:
    "Pablo Olivares — ML engineer and data scientist. Building things with PyTorch, curiosity, and a pinch of alchemy.",
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
    { name: "Kitchen", href: "/kitchen/" },
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
  "Currently reading: The Book of Why",
  "Kitchen status: Perfecting sourdough",
  "Last experiment: LLM interpretability pipeline",
  "Stargazing: Tracking Jupiter's moons",
  "Tinkering with: Conformal prediction",
];
