"use client";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/../public/assets/logo.png";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { NavbarAuth } from "@/components/navbar-auth";

const navLinkBaseClass =
  "font-medium text-[1rem] transition-all focus-visible:outline-none rounded-full px-4 py-2 hover:bg-amber-brand/10";

const btnPrimaryClass =
  "bg-amber-brand text-white rounded-full px-6 py-2.5 font-bold transition-all hover:scale-[1.05] hover:shadow-lg active:scale-[0.95]";

function isPathActive(
  pathname: string,
  href: string,
  mode: "exact" | "section" = "exact",
) {
  if (!pathname) return false;
  if (mode === "exact") return pathname === href;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const serviceAudienceGroups = [
  {
    title: "Executive Leadership",
    href: "/services#children",
    items: ["BBR", "Executive Presence", "Decision Mastery"],
  },
  {
    title: "Business Scaling",
    href: "/services#teenagers",
    items: ["Scale Strategy", "Operational Excellence"],
  },
  {
    title: "Career Advancement",
    href: "/services#adults",
    items: ["Trajectory Mapping", "Leadership Acceleration"],
  },
  {
    title: "Corporate Workshops",
    href: "/services#schools",
    items: ["BBR Corporate", "Management Capacity"],
  },
  {
    title: "Workplace Productivity",
    href: "/services#organisations",
    items: ["Peak Performance", "Stress Mastery"],
  },
  {
    title: "Peer Advisory",
    href: "/services#communities",
    items: ["Lift Others Mastermind", "Executive Networking"],
  },
  {
    title: "Life Coaching",
    href: "/services#parents",
    items: ["Personal Vision", "Life Strategy"],
  },
];

const aboutUsGroup = [
  {
    title: "Team",
    href: "/team",
  },
  {
    title: "Internship",
    href: "/internship",
  },
  {
    title: "Testimonials",
    href: "/testimonials",
  },
  {
    title: "Events",
    href: "/events",
  },
];

function Navbar() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const aboutCloseTimerRef = useRef<number | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const onLogoNavigate = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    setMegaOpen(false);
    setAboutOpen(false);
    setMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useGSAP(
    () => {
      // Mega Menu Animation

      if (megaOpen) {
        gsap.to(megaMenuRef.current, {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(megaMenuRef.current, {
          autoAlpha: 0,
          y: -20,
          duration: 0.2,
          ease: "power2.in",
        });
      }

      // Mobile Menu Animation
      if (mobileMenuOpen) {
        gsap.to(mobileMenuRef.current, {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: "power3.out",
        });
        gsap.fromTo(
          ".mobile-link",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.4,
            delay: 0.2,
            ease: "power2.out",
          },
        );
      } else {
        gsap.to(mobileMenuRef.current, {
          y: "-100%",
          autoAlpha: 0,
          duration: 0.3,
          ease: "power3.in",
        });
      }
    },
    { dependencies: [megaOpen, mobileMenuOpen] },
  );

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 48;
      setIsScrolled((prev) => (prev === next ? prev : next));
    };

    onScroll(); // initialize based on initial scroll position
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const clearAboutCloseTimer = () => {
    if (aboutCloseTimerRef.current) {
      window.clearTimeout(aboutCloseTimerRef.current);
      aboutCloseTimerRef.current = null;
    }
  };

  const openMegaMenu = () => {
    clearCloseTimer();
    setAboutOpen(false);
    setMegaOpen(true);
  };

  const scheduleCloseMegaMenu = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setMegaOpen(false);
    }, 160);
  };

  const openAboutMenu = () => {
    clearAboutCloseTimer();
    setMegaOpen(false);
    setAboutOpen(true);
  };

  const scheduleCloseAboutMenu = () => {
    clearAboutCloseTimer();
    aboutCloseTimerRef.current = window.setTimeout(() => {
      setAboutOpen(false);
    }, 160);
  };

  const isHeaderWhite = isScrolled;

  const navLinkClass = `${navLinkBaseClass} ${isHeaderWhite ? "text-navy-brand" : "text-amber-brand"}`;

  const navLinkClassFor = (
    href: string,
    mode: "exact" | "section" = "exact",
  ) => {
    const active = isPathActive(pathname, href, mode);
    const activeStyles = isHeaderWhite
      ? "bg-amber-brand/15 text-navy-brand"
      : "bg-white/15 text-black";
    return `${navLinkClass} ${active ? activeStyles : ""}`;
  };

  const isServicesActive = isPathActive(pathname, "/services", "section");
  const isBlogActive = isPathActive(pathname, "/blog", "section");
  const isContactActive = isPathActive(pathname, "/contact", "section");
  const isStoreActive = isPathActive(pathname, "/store", "section");
  const isAboutActive =
    isPathActive(pathname, "/about", "section") ||
    isPathActive(pathname, "/team", "section") ||
    isPathActive(pathname, "/internship", "section") ||
    isPathActive(pathname, "/testimonials", "section");

  useEffect(() => {
    // Reset all mobile menu states when the route changes
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
    setMobileAboutOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav
        className={[
          "sticky top-0 z-[100] transition-all duration-300",
          isHeaderWhite
            ? "bg-cream-brand/80 backdrop-blur-md shadow-sm"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="mx-auto max-w-[1240px] px-6 flex items-center justify-between">
          <div className="nav-logo relative z-[110]">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand/60"
              aria-label="The Safe Space Global — Home"
              onClick={onLogoNavigate}
            >
              <Image
                src={Logo}
                alt="TSSG Logo"
                width={96}
                height={96}
                className="h-20 w-20 md:h-28 md:w-28 object-contain transition-all duration-300"
                priority
              />
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/" className={navLinkClassFor("/", "exact")}>
              Home
            </Link>
            <Link
              href="/services"
              className={`${navLinkClassFor("/services", "section")} inline-flex items-center gap-1.5`}
              onMouseEnter={openMegaMenu}
              onMouseLeave={scheduleCloseMegaMenu}
              onClick={() => setMegaOpen(false)}
            >
              Services
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`}
              />
            </Link>

            <div
              className="relative"
              onMouseEnter={openAboutMenu}
              onMouseLeave={scheduleCloseAboutMenu}
            >
              <Link
                href="/about"
                className={`${navLinkClassFor("/about", "section")} ${isAboutActive ? (isHeaderWhite ? "bg-amber-brand/15" : "bg-white/15") : ""} inline-flex items-center gap-1.5`}
                aria-haspopup="menu"
                aria-expanded={aboutOpen}
              >
                About Us
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${aboutOpen ? "rotate-180" : ""}`}
                />
              </Link>
              <div
                role="menu"
                className={[
                  "absolute left-0 top-full mt-2 w-56 rounded-2xl border border-amber-brand/10 bg-white shadow-xl p-2 transition",
                  aboutOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 -translate-y-1 pointer-events-none",
                ].join(" ")}
              >
                {aboutUsGroup.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className={[
                      "block rounded-xl px-4 py-3 font-semibold transition-colors",
                      isPathActive(pathname, item.href, "section")
                        ? "bg-amber-brand/10 text-navy-brand"
                        : "text-navy-brand hover:bg-amber-brand/10",
                    ].join(" ")}
                    onClick={() => setAboutOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
            <Link href="/blog" className={navLinkClassFor("/blog", "section")}>
              Blog
            </Link>
            <Link
              href="/store"
              className={navLinkClassFor("/store", "section")}
            >
              Store
            </Link>
            <Link
              href="/contact"
              className={navLinkClassFor("/contact", "exact")}
            >
              Contact
            </Link>

            <NavbarAuth variant="header" navLinkClass={navLinkClass} />

            <Link
              href="/booking"
              className={btnPrimaryClass + " ml-2 shrink-0"}
            >
              Book Now
            </Link>
          </div>
          <button
            type="button"
            className={`lg:hidden p-2 rounded-lg text-[var(--text-primary)]`}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Mobile Menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={28} />
          </button>
        </div>

        {/* Mega Menu */}
        <div
          ref={megaMenuRef}
          className="hidden lg:block absolute left-0 right-0 top-full bg-cream-brand shadow-2xl border-t border-amber-brand/10 invisible opacity-0"
          onMouseEnter={openMegaMenu}
          onMouseLeave={scheduleCloseMegaMenu}
        >
          <div className="mx-auto max-w-[1240px] grid grid-cols-12 gap-0">
            <div className="col-span-4 p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-playfair font-bold text-navy-brand mb-4">
                Our Services
              </h3>
              <p className="text-brown-brand/70 font-nunito leading-relaxed">
                Premium executive coaching and business strategy tailored for enterprise success.
              </p>
            </div>
            <div className="col-span-8 p-12 grid grid-cols-3 gap-8">
              {serviceAudienceGroups.map((group) => (
                <Link
                  key={group.title}
                  href={group.href}
                  className="group flex flex-col gap-1 p-4 rounded-2xl hover:bg-amber-brand/5 transition-colors"
                  onClick={() => setMegaOpen(false)}
                >
                  <span className="font-bold text-navy-brand group-hover:text-amber-brand transition-colors">
                    {group.title}
                  </span>
                  <span className="text-sm text-brown-brand/60">
                    {group.items.join(" • ")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className="fixed inset-0 z-[120] bg-white flex flex-col justify-start pt-4 pb-10 invisible translate-y-[-100%] lg:hidden overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-12 px-6">
          <Link
            href="/"
            className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand/60"
            aria-label="The Safe Space Global — Home"
            onClick={onLogoNavigate}
          >
            <Image
              src={Logo}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-[var(--text-primary)]"
            aria-label="Close Mobile Menu"
          >
            <X size={28} />
          </button>
        </div>
        <div className="flex flex-col gap-6 text-2xl font-bold pb-20 overflow-y-auto px-6">
          <Link
            href="/"
            className={[
              "mobile-link",
              "text-[var(--text-primary)]",
              isPathActive(pathname, "/", "exact") ? "text-amber-brand" : "",
            ].join(" ")}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <div className="mobile-link flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <button
                className=
                "flex-1 text-left text-[var(--text-primary)]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMobileServicesOpen(!mobileServicesOpen);
                }}
              >
                Services
              </button>
              <ChevronDown
                size={24}
                className={`transition-transform duration-300 ${mobileServicesOpen ? "rotate-180" : ""}`}
              />
            </div>
            <div
              className={`grid transition-all duration-300 ease-in-out ${mobileServicesOpen
                ? "grid-rows-[1fr] mt-4 opacity-100"
                : "grid-rows-[0fr] opacity-0"
                }`}
            >
              <div className="overflow-hidden flex flex-col gap-4 pl-4 border-l-2 border-gray-100 text-lg font-semibold">
                <Link
                  href="/services"
                  className={[
                    "transition-colors",
                    isPathActive(pathname, "/services", "section")
                      ? "text-amber-brand"
                      : "text-gray-600 hover:text-[var(--primary)]",
                  ].join(" ")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
                {serviceAudienceGroups.map((group) => (
                  <Link
                    key={group.title}
                    href={group.href}
                    className={[
                      "transition-colors",
                      isPathActive(pathname, group.href, "exact")
                        ? "text-amber-brand"
                        : "text-gray-600 hover:text-[var(--primary)]",
                    ].join(" ")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {group.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mobile-link flex flex-col w-full">
            <div className="flex items-center justify-between w-full">
              <button
                className=
                "flex-1 text-left text-[var(--text-primary)]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMobileAboutOpen(!mobileAboutOpen);
                }}
              >
                About Us
              </button>
              <ChevronDown
                size={24}
                className={`transition-transform duration-300 ${mobileAboutOpen ? "rotate-180" : ""}`}
              />
            </div>
            <div
              className={`grid transition-all duration-300 ease-in-out ${mobileAboutOpen
                ? "grid-rows-[1fr] mt-4 opacity-100"
                : "grid-rows-[0fr] opacity-0"
                }`}
            >
              <div className="overflow-hidden flex flex-col gap-4 pl-4 border-l-2 border-gray-100 text-lg font-semibold">
                <Link
                  href="/about"
                  className={[
                    "transition-colors",
                    isPathActive(pathname, "/about", "section")
                      ? "text-amber-brand"
                      : "text-gray-600 hover:text-[var(--primary)]",
                  ].join(" ")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                {aboutUsGroup.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "transition-colors",
                      isPathActive(pathname, item.href, "section")
                        ? "text-amber-brand"
                        : "text-gray-600 hover:text-[var(--primary)]",
                    ].join(" ")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Link
            href="/store"
            className={[
              "mobile-link",
              isStoreActive ? "text-amber-brand" : "text-[var(--text-primary)]",
            ].join(" ")}
            onClick={() => setMobileMenuOpen(false)}
          >
            Store
          </Link>
          <Link
            href="/blog"
            className={[
              "mobile-link",
              isBlogActive ? "text-amber-brand" : "text-[var(--text-primary)]",
            ].join(" ")}
            onClick={() => setMobileMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className={[
              "mobile-link",
              isContactActive ? "text-amber-brand" : "text-[var(--text-primary)]",
            ].join(" ")}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <NavbarAuth
            variant="drawer"
            onNavigate={() => setMobileMenuOpen(false)}
          />
          <div className="mobile-link mt-4">
            <Link
              href="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center text-lg px-8 py-3.5 bg-amber-brand text-white rounded-full font-bold transition-all hover:scale-[1.05]"
            >
              Book Now <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
