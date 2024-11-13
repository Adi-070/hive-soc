import Link from "next/link";


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-8 w-8 text-blue-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-800">HiveSoc</span>
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link
                  href="#features"
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-800 font-medium">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-gray-800 font-medium">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Login
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-28">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Connect with Like-Minded People
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Discover and connect with people who share your passions. Join ConnectHub
              today and start meaningful conversations.
            </p>
            <div className="space-x-4">
              <Link
                href="/signup"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-md font-medium hover:bg-blue-700 transition duration-200 shadow-lg"
              >
                Get Started
              </Link>
              <Link
                href="/learn-more"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-md font-medium border border-blue-600 hover:bg-blue-50 transition duration-200 shadow-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
              Key Features
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-12 w-12 text-blue-600 mb-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Find Your Tribe</h3>
                </div>
                <p className="text-center text-gray-600">
                  Connect with people who share your interests and passions.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-12 w-12 text-blue-600 mb-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Engage in Discussions</h3>
                </div>
                <p className="text-center text-gray-600">
                  Start meaningful conversations on topics you care about.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-12 w-12 text-blue-600 mb-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">Build Communities</h3>
                </div>
                <p className="text-center text-gray-600">
                  Create and join groups centered around shared interests.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Join the Conversation
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Start connecting with like-minded individuals and build meaningful
              relationships. Sign up now and get started for free!
            </p>
            <div className="space-x-4">
              <Link
                href="/signup"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-md font-medium hover:bg-blue-700 transition duration-200 shadow-lg"
              >
                Sign up
              </Link>
              <Link
                href="/learn-more"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-md font-medium border border-blue-600 hover:bg-blue-50 transition duration-200 shadow-lg"
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
  );
}