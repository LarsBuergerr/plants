import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { account } from "@/lib/appwrite";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { resetPlants } from "@/store/plantSlice";
import { setCurrUid } from "@/store/appSlice";

export const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currUid } = useSelector((state: RootState) => state.app);
  const { plants } = useSelector((state: RootState) => state.plants);

  const signOut = async () => {
    try {
      await account.deleteSession("current");
      dispatch(setCurrUid(null));
      dispatch(resetPlants());
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Force logout even if API call fails
      dispatch(setCurrUid(null));
      dispatch(resetPlants());
      router.push("/login");
    }
  };

  // Filter nav items based on authentication state
  const getVisibleNavItems = () => {
    return siteConfig.navMenuItems.filter((item) => {
      if (item.label === "Logout") {
        return currUid !== null; // Only show logout when user is logged in
      }
      if (item.label === "Login") {
        return currUid === null; // Only show login when user is not logged in
      }
      return true; // Show all other items
    });
  };

  const visibleNavItems = getVisibleNavItems();

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">PLANTS</p>
          </NextLink>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {visibleNavItems.map((item, index) => (
            <NavbarItem key={item.href}>
              <Link
                color={item.label === "Logout" ? "danger" : "foreground"}
                onPress={async () => {
                  if (item.label === "Logout") {
                    await signOut();
                  } else if (item.href) {
                    router.push(item.href);
                  }
                }}
                href={item.label === "Logout" ? undefined : item.href}
                size="lg"
                className={item.label === "Logout" ? "cursor-pointer" : ""}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden md:flex"></NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {visibleNavItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={item.label === "Logout" ? "danger" : "foreground"}
                onPress={async () => {
                  if (item.label === "Logout") {
                    await signOut();
                  } else if (item.href) {
                    router.push(item.href);
                  }
                }}
                href={item.label === "Logout" ? undefined : item.href}
                size="lg"
                className={item.label === "Logout" ? "cursor-pointer" : ""}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
