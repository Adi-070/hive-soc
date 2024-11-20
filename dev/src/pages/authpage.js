'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
// Import your existing components
import LoginForm from './login'
import SignUpForm from './signup'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const toggleAuth = () => setIsLogin(!isLogin)
  
  return (
    <div className="flex min-h-screen max-w-screen h-screen w-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-black overflow-hidden">
      <div className="flex h-full w-full max-w-screen overflow-hidden rounded-none md:rounded-2xl shadow-2xl">
        {/* Form Container */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-100 to-purple-100 p-8 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div 
                key={isLogin ? 'login' : 'signup'}
                className="w-full"
                initial={{ opacity: 0, x: isLogin ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 50 : -50 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-center text-3xl font-bold mb-6">
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </h2>
                {isLogin ? <LoginForm /> : <SignUpForm />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {/* Background Panel */}
        <div className="hidden md:block w-1/2 relative h-full">
          <div className="absolute inset-0 bg-[url('/bg.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white p-8">
              <div className="text-center">
                <h2 className="mb-6 text-3xl font-bold">
                  {isLogin ? 'Hello, Friend!' : 'Welcome Back!'}
                </h2>
                <p className="mb-8">
                  {isLogin
                    ? 'Enter your personal details and start your journey with us'
                    : 'To keep connected with us please login with your personal info'}
                </p>
                <Button
                  onClick={toggleAuth}
                  variant="outline"
                  className="border-2 border-white bg-transparent px-10 py-2 text-lg font-semibold text-white hover:bg-white hover:text-black"
                >
                  {isLogin ? 'SIGN UP' : 'SIGN IN'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Toggle Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden">
        <Button
          onClick={toggleAuth}
          className="w-full bg-blue-500 py-2 text-white"
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </Button>
      </div>
    </div>
  )
}