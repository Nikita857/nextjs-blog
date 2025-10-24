"use client";

import { layoutConfig } from "@/config/layout.config";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/react";
import { usePathname } from "next/navigation";
import RegistrationModal from "../modals/registration.modal";
import LoginModal from "../modals/login.modal";
import { useEffect, useState } from "react";
import { signOutFunction } from "@/actions/sign-out";
import { useAuthStore } from "@/store/auth.store";
import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { siteConfig } from "@/config/site.config";
import { useTheme } from "next-themes";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function Header() {
  const pathname = usePathname();
  const { isAuth, session, status, setAuthState } = useAuthStore();

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(()=>{
    setMounted(true);
  }, [])

  const { theme, systemTheme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  const handleSignOut = async () => {
    try {
      await signOutFunction();
    } catch (error) {
      console.log("error", error);
    }
    setAuthState("unauthenticated", null);
  };

  return (
    <Navbar
      className={`h-[${layoutConfig.headerHeight}]
         bg-white
          dark:bg-gray-800 
          border-b 
          border-gray-200 
          dark:border-gray-700`}
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Logo and Brand */}
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link href="/">
            <AcmeLogo />
            <p className="font-bold text-inherit">{siteConfig.title}</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation Links */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {siteConfig.navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavbarItem key={item.href}>
              <Link
                className={`
               ${mounted && currentTheme === "light" ? "text-gray-900" : "text-gray-100"} 
               ${isActive ? "text-pink-400" : ""} 
               hover:text-pink-400 transition-colors
             `}
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      {/* Right side actions */}
      <NavbarContent justify="end">
        <ThemeSwitcher />
        {/* Desktop Auth Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          {status === "loading" ? (
            <p>Загрузка...</p>
          ) : !isAuth ? (
            <>
              <NavbarItem>
                <Button
                  as={Link}
                  color="secondary"
                  href="#"
                  variant="flat"
                  onPress={() => setIsLoginOpen(true)}
                >
                  Войти
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button
                  as={Link}
                  color="primary"
                  href="#"
                  variant="flat"
                  onPress={() => setIsRegistrationOpen(true)}
                >
                  Регистрация
                </Button>
              </NavbarItem>
            </>
          ) : (
            <>
              <NavbarItem>
                <Link href="/blog/create" color="primary">
                  Добавить пост
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Button
                  as={Link}
                  color="secondary"
                  href="#"
                  variant="flat"
                  onPress={handleSignOut}
                >
                  Выйти
                </Button>
              </NavbarItem>
            </>
          )}
        </div>

        {/* Burger Menu Toggle */}
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu>
        {siteConfig.navItems.map((item, index) => (
          <NavbarMenuItem key={`${item.href}-${index}`}>
            <Link
              color="foreground"
              className="w-full"
              href={item.href}
              size="lg"
              onPress={() => setIsMenuOpen(false)} // Close menu on link click
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}

        {/* Mobile Auth Buttons */}
        <NavbarMenuItem>
          {status !== "loading" && !isAuth ? (
            <div className="flex flex-col gap-4 pt-4">
              <Button
                color="secondary"
                variant="flat"
                onPress={() => {
                  setIsLoginOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                Войти
              </Button>
              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  setIsRegistrationOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                Регистрация
              </Button>
            </div>
          ) : (
            status !== "loading" && (
              <div className="flex flex-col gap-4 pt-4">
                <Button
                  as={Link}
                  href="/blog/create"
                  variant="flat"
                  color="primary"
                  onPress={() => setIsMenuOpen(false)}
                >
                  Добавить пост
                </Button>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Выйти
                </Button>
              </div>
            )
          )}
        </NavbarMenuItem>
      </NavbarMenu>

      {/* Modals */}
      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </Navbar>
  );
}
