"use client"

import * as React from "react"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react"
import { useIsMobile } from "../../hooks/use-mobile"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

interface NavigationMenuDemoProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  user?: { role: string } | null;
}

export function NavigationMenuDemo({ onNavigate, currentPage, user }: NavigationMenuDemoProps) {

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6"
                    href="#"
                    onClick={() => onNavigate('home')}
                  >
                    <div className="mb-2 text-lg font-medium sm:mt-4">
                      Foodie
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Beautifully designed food ordering experience.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="#" title="Menu" onClick={() => onNavigate('menu')}>
                Browse our delicious menu
              </ListItem>
              <ListItem href="#" title="About" onClick={() => onNavigate('about')}>
                Learn about our story
              </ListItem>
              <ListItem href="#" title="Contact" onClick={() => onNavigate('contact')}>
                Get in touch with us
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <a href="#" onClick={() => onNavigate('docs')}>Docs</a>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>List</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <a href="#" onClick={() => onNavigate('menu')}>
                    <div className="font-medium">Menu</div>
                    <div className="text-muted-foreground">
                      Browse all items in our menu.
                    </div>
                  </a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#" onClick={() => onNavigate('orders')}>
                    <div className="font-medium">Orders</div>
                    <div className="text-muted-foreground">
                      View your order history.
                    </div>
                  </a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#" onClick={() => onNavigate('profile')}>
                    <div className="font-medium">Profile</div>
                    <div className="text-muted-foreground">
                      Manage your account.
                    </div>
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <a href="#" onClick={() => onNavigate('menu')}>Menu</a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#" onClick={() => onNavigate('orders')}>Orders</a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#" onClick={() => onNavigate('settings')}>Settings</a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <a href="#" onClick={() => onNavigate('help')} className="flex-row items-center gap-2">
                    <CircleHelpIcon />
                    Help
                  </a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#" onClick={() => onNavigate('orders')} className="flex-row items-center gap-2">
                    <CircleIcon />
                    Orders
                  </a>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <a href="#" onClick={() => onNavigate('profile')} className="flex-row items-center gap-2">
                    <CircleCheckIcon />
                    Profile
                  </a>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {user?.role === 'admin' && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <a href="#" onClick={() => onNavigate('admin')}>Admin Dashboard</a>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({
  title,
  children,
  href,
  onClick,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string; onClick?: () => void }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <a href={href} onClick={onClick}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}