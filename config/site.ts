export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Plants",
  description: "Collect and manage your plants :3",
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Wishlist",
      href: "/wishlist",
    },
    {
      label: "Graveyard",
      href: "/graveyard",
    },
    {
      label: "Logout",
      href: "/login",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
