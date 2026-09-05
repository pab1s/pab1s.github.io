export const siteConfig = {
  title: "Pablo Olivares",
  labName: "pab1s",
  tagline: "ML engineer · Madrid",
  currently: "At Santander I help build the platform that takes teams from running experiments to shipping AI and agents into production. Sometimes I build models that go brrr.",
  description:
    "Pablo Olivares: ML engineer at Santander working on AI/ML and experimentation platforms. Into hiking, cooking, traveling, and building stuff.",
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
    { name: "Experiments", href: "/projects/" },
    { name: "Resume", href: "/resume/" },
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
