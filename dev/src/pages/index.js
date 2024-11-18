'use client'

import { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import { Menu, X } from 'lucide-react'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState({})
  const featuresRef = useRef(null)
  

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({
              ...prev,
              [entry.target.dataset.animation]: true
            }))
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('[data-animation]')
    elements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

       .animate-slide-in {
        opacity: 0;
        visibility: hidden;
      }
        .animate-slide-in.visible {
        visibility: visible;
        animation: slideIn 0.6s ease forwards;
      }

        .animate-fade-up {
          opacity: 0;
          animation: fadeUp 0.6s ease forwards;
        }

        .animate-scale-in {
          opacity: 0;
          animation: scaleIn 0.6s ease forwards;
        }

        .animate-delay-1 {
          animation-delay: 0.2s;
        }

        .animate-delay-2 {
          animation-delay: 0.4s;
        }

        .animate-delay-3 {
          animation-delay: 0.6s;
        }

        .button-hover {
          transition: transform 0.2s ease;
        }

        .button-hover:hover {
          transform: scale(1.05);
        }

        .button-hover:active {
          transform: scale(0.95);
        }

        .menu-slide {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        transform-origin: top;
        transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
      }

        .menu-enter {
          opacity: 1;
          transform: scaleY(1);
        }

        .menu-exit {
        visibility: hidden;
        opacity: 0;
        transform: scaleY(0);
        height: 0;
      }
      `}</style>

      <header className="bg-white shadow-md fixed w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <div className="button-hover">
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
            </div>
            <span className="ml-2 text-xl font-bold text-gray-800">HiveSoc</span>
          </Link>

          <div className="flex items-center">
            <nav className="hidden md:block mr-4">
              <ul className="flex items-center space-x-6">
                <li>
                  <Link
                    href="#features"
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link 
                    href="#" 
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link 
                    href="#" 
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>
            
            <Link
              href="/login"
              className="button-hover inline-block px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 font-medium transition-colors duration-200"
            >
              Login
            </Link>
            
            <button className="md:hidden ml-4" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className={`menu-slide ${isMenuOpen ? 'menu-enter' : 'menu-exit'} md:hidden`}>
          <nav className="bg-white">
            <ul className="flex flex-col space-y-2 px-4 py-2">
              <li>
                <Link
                  href="#features"
                  className="block text-gray-600 hover:text-gray-800 font-medium"
                  onClick={toggleMenu}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="block text-gray-600 hover:text-gray-800 font-medium"
                  onClick={toggleMenu}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="block text-gray-600 hover:text-gray-800 font-medium"
                  onClick={toggleMenu}
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow pt-24">
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 md:py-28">
          <div 
            className={`container mx-auto px-4 text-center animate-fade-up ${
              isVisible['hero'] ? 'visible' : ''
            }`}
            data-animation="hero"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
              Connect with Like-Minded People
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Discover and connect with people who share your passions. Join HiveSoc
              today and start meaningful conversations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/signup"
                className="button-hover inline-block bg-white text-black px-8 py-4 rounded-md font-medium hover:bg-primary-dark transition duration-200 shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/learn-more"
                className="button-hover inline-block bg-white text-primary px-8 py-4 rounded-md font-medium border border-primary hover:bg-primary-50 transition duration-200 shadow-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-20" ref={featuresRef}>
          <div className="container mx-auto px-4">
            <h2 
              className={`text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-12 text-center animate-scale-in ${
                isVisible['features-title'] ? 'visible' : ''
              }`}
              data-animation="features-title"
            >
              Key Features
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  )
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-2xl shadow-lg animate-slide-in animate-delay-${index + 1} ${
                    isVisible[`feature-${index}`] ? 'visible' : ''
                  }`}
                  data-animation={`feature-${index}`}
                >
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="h-12 w-12 text-primary mb-4"
                    >
                      {feature.icon}
                    </svg>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                  </div>
                  <p className="text-center text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 md:py-20">
          <div 
            className={`container mx-auto px-4 text-center animate-fade-up ${
              isVisible['cta'] ? 'visible' : ''
            }`}
            data-animation="cta"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Join the Conversation
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Start connecting with like-minded individuals and build meaningful
              relationships. Sign up now and get started for free!
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/signup"
                className="button-hover inline-block bg-white text-black px-8 py-4 rounded-md font-medium hover:bg-primary-dark transition duration-200 shadow-lg"
              >
                Sign up
              </Link>
              <Link
                href="/learn-more"
                className="button-hover inline-block bg-white text-primary px-8 py-4 rounded-md font-medium border border-primary hover:bg-primary-50 transition duration-200 shadow-lg"
              >
                Learn More
              </Link>
            </div>
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