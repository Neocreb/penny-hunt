
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">PennyHunt</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8">
            Invest in <span className="text-blue-600">Crypto</span> & <span className="text-green-600">Fiat</span>
            <br />with Confidence
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Trade cryptocurrencies and manage multiple fiat currencies including Nigerian Naira (NGN), 
            USD, EUR and more. Professional-grade tools for both beginners and experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                Start Trading Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                View Demo Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Why Choose PennyHunt?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Multi-Currency Support</h3>
              <p className="text-gray-600">
                Trade cryptocurrencies and manage Nigerian Naira, USD, EUR, GBP and other major currencies all in one platform.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Shield className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Bank-Level Security</h3>
              <p className="text-gray-600">
                Your investments are protected with advanced encryption, two-factor authentication, and secure cold storage.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Globe className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Global Markets</h3>
              <p className="text-gray-600">
                Access global cryptocurrency markets and international fiat currencies with real-time pricing and analytics.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 bg-blue-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Investing?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of investors who trust PennyHunt for their crypto and fiat investments.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer with Navigation */}
      <footer className="bg-gray-900 text-white mt-24">
        {/* Footer Navigation Bar */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap justify-center md:justify-between items-center space-y-2 md:space-y-0">
              <div className="flex items-center space-x-6">
                <Link to="/dashboard" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
                <Link to="/trading" className="text-gray-300 hover:text-white transition-colors">
                  Trading
                </Link>
                <Link to="/wallet" className="text-gray-300 hover:text-white transition-colors">
                  Wallet
                </Link>
                <Link to="/portfolio" className="text-gray-300 hover:text-white transition-colors">
                  Portfolio
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
                    Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-lg font-bold">PennyHunt</span>
              </div>
              <p className="text-gray-400">
                Professional cryptocurrency and fiat investment platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/trading" className="hover:text-white">Trading</Link></li>
                <li><Link to="/wallet" className="hover:text-white">Wallet</Link></li>
                <li><Link to="/portfolio" className="hover:text-white">Portfolio</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">API Documentation</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PennyHunt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
