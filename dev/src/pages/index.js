'use client'

import { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [featuresInView, setFeaturesInView] = useState(false)
  const [joinInView, setJoinInView] = useState(false)

  // Refs for sections
  const featuresRef = useRef(null)
  const joinRef = useRef(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  // Intersection observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === featuresRef.current && entry.isIntersecting) {
            setFeaturesInView(true)
          }
          if (entry.target === joinRef.current && entry.isIntersecting) {
            setJoinInView(true)
          }
        })
      },
      { threshold: 0.5 } // Trigger when 50% of the section is in view
    )

    if (featuresRef.current) {
      observer.observe(featuresRef.current)
    }

    if (joinRef.current) {
      observer.observe(joinRef.current)
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current)
      }

      if (joinRef.current) {
        observer.unobserve(joinRef.current)
      }
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background shadow-md fixed w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-8 w-8 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </motion.div>
            <span className="ml-2 text-xl font-bold text-foreground">HiveSoc</span>
          </Link>

          <div className="flex items-center space-x-4">
            <NavigationMenu className="hidden md:block">
              <NavigationMenuList className="space-x-4">
                <NavigationMenuItem>
                  <NavigationMenuLink href="#features">
                    Features
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#">
                    Pricing
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#">
                    About
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Button asChild className="ml-4">
              <Link href="/authpage">Login</Link>
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden ml-4" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        <motion.div
          className="md:hidden"
          initial={false}
          animate={isMenuOpen ? "open" : "closed"}
          variants={{
            open: { opacity: 1, height: "auto" },
            closed: { opacity: 0, height: 0 }
          }}
        >
        <nav className="bg-white text-black bg-opacity-90">


            <ul className="flex flex-col space-y-2 px-4 py-2">
              <li>
                <Link
                  href="#features"
                  className="block text-foreground hover:text-primary font-medium"
                  onClick={toggleMenu}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block text-foreground hover:text-primary font-medium"
                  onClick={toggleMenu}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block text-foreground hover:text-primary font-medium"
                  onClick={toggleMenu}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </motion.div>
      </header>

      <main className="flex-grow pt-24">
      <section className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 relative">
  <motion.div
    className="container mx-auto px-4 text-center transform -translate-y-10" // This moves the text upward
    initial="initial"
    animate="animate"
    variants={fadeInUp}
  >
    <h1 className="text-4xl sm:text-5xl md:text-6xl  lg:text-7xl font-bold text-foreground mb-4">
      Connect with Like-Minded People
    </h1>
    <br/>
    <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
      Discover and connect with people who share your passions. Join HiveSoc
      today and start meaningful conversations.
    </p>
    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
      <Button asChild size="lg">
        <Link href="/signup">Get Started</Link>
      </Button>
      <Button asChild variant="outline" size="lg">
        <Link href="/learn-more">Learn More</Link>
      </Button>
    </div>
  </motion.div>
</section>



        <section id="features" ref={featuresRef} className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-12 text-center"
              initial="initial"
              animate={featuresInView ? "animate" : "initial"}
              variants={fadeInUp}
            >
              Key Features
            </motion.h2>
            <motion.div
              className="grid gap-8 md:grid-cols-3"
              variants={staggerChildren}
              initial="initial"
              animate={featuresInView ? "animate" : "initial"}
            >
                {[
                {
                  title: "Find Your Tribe",
                  description: "Connect with people who share your interests and passions.",
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  )
                },
                {
                  title: "Engage in Discussions",
                  description: "Start meaningful conversations on topics you care about.",
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  )
                },
                {
                  title: "Build Communities",
                  description: "Create and join groups centered around shared interests.",
                  icon: (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-2.78-2.24-5-5-5H7c-2.76 0-5 2.24-5 5v2"
                    />
                  )
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center bg-white rounded-lg shadow-md p-6"
                  variants={fadeInUp}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-12 w-12 text-primary mb-4"
                  >
                    {feature.icon}
                  </svg>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section ref={joinRef} className="py-16 md:py-20 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-12"
              initial="initial"
              animate={joinInView ? "animate" : "initial"}
              variants={fadeInUp}
            >
              Join Us Today!
            </motion.h2>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial="initial"
              animate={joinInView ? "animate" : "initial"}
              variants={fadeInUp}
            >
              <Button size="lg" className="w-full sm:w-auto">
                <Link href="/signup" className="w-full text-center">Sign Up Now</Link>
              </Button>
              <Button size="lg" className="w-full sm:w-auto bg-white text-black border border-gray-300 hover:bg-gray-100">
                <Link href="/learn-more" className="w-full text-center">Learn More</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2024 HiveSoc. All rights reserved.
            </p>
            <nav className="mt-4 md:mt-0">
              <ul className="flex space-x-4">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
