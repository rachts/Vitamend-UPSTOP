"use client"

import Link from "next/link"
import Image from "next/image"
import ThemeToggle from "@/components/theme-toggle"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const navItems = ["Donate", "Volunteer", "Store", "Transparency", "Founders"]

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (item: string) => {
    const itemPath = `/${item.toLowerCase()}`
    return pathname === itemPath
  }

  const logoVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  const navLinkVariants = {
    hidden: { opacity: 0, y: -8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: 0.2 + i * 0.06, ease: "easeOut" },
    }),
  }

  const actionsVariants = {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.4, ease: "easeOut" } },
  }

  return (
    <header
      className={`w-full sticky top-0 z-50 h-16 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50"
          : "bg-white dark:bg-slate-900"
      } border-b border-gray-200/50 dark:border-slate-800/50`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <motion.div initial={mounted ? "hidden" : false} animate="visible" variants={logoVariants}>
          <Link href="/" className="flex items-center gap-2 group" aria-label="VitaMend Home">
            <Image
              src="/images/design-mode/VITAMEND_LOGO.png"
              alt="VitaMend logo"
              width={32}
              height={32}
              className="rounded transition-transform duration-300 ease-out group-hover:scale-110"
              priority
            />
            <span className="text-base font-semibold text-slate-900 dark:text-white transition-colors duration-300">
              VitaMend
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
          {navItems.map((item, i) => (
            <motion.div
              key={item}
              initial={mounted ? "hidden" : false}
              animate="visible"
              custom={i}
              variants={navLinkVariants}
            >
              <Link
                href={`/${item.toLowerCase()}`}
                className={`relative text-sm font-medium transition-all duration-300 ease-out link-underline ${
                  isActive(item)
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {item}
                {isActive(item) && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Actions */}
        <motion.div
          className="flex items-center gap-4"
          initial={mounted ? "hidden" : false}
          animate="visible"
          variants={actionsVariants}
        >
          <ThemeToggle />
          <Link
            href="/dashboard"
            className={`hidden sm:block rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98] ${
              pathname === "/dashboard"
                ? "bg-emerald-700 shadow-lg shadow-emerald-500/30"
                : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/25"
            }`}
          >
            Dashboard
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-300 ease-out"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <motion.div animate={{ rotate: mobileMenuOpen ? 90 : 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </motion.div>
          </button>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden overflow-hidden"
        initial={false}
        animate={{ height: mobileMenuOpen ? "auto" : 0, opacity: mobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <nav
          className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-4 px-4 space-y-1"
          aria-label="Mobile navigation"
        >
          {[...navItems, "Dashboard"].map((item, idx) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className={`block py-3 px-3 rounded-lg font-medium transition-all duration-200 ease-out ${
                isActive(item)
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {item}
            </Link>
          ))}
        </nav>
      </motion.div>
    </header>
  )
}
