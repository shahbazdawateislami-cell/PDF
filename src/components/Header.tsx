import React from 'react';
import { ShoppingCart, User, Menu, Search, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export const Navbar = () => (
  <nav className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-red-600 rounded-md"></div>
      <span className="font-bold text-xl">PDF Master <span className="text-orange-500">India</span></span>
    </div>
    <div className="hidden md:flex gap-6 font-medium">
      <a href="/">Home</a>
      <a href="/all">All PDFs</a>
      <a href="/categories">Categories</a>
      <a href="/purchases">My Purchases</a>
    </div>
    <div className="flex items-center gap-4">
      <ShoppingCart size={20} />
      <User size={20} />
      <Menu size={20} />
    </div>
  </nav>
);

export const Hero = () => (
  <section className="bg-navy-900 text-white p-8 rounded-2xl m-4 flex flex-col md:flex-row items-center gap-8">
    <div className="flex-1">
      <h1 className="text-4xl font-extrabold mb-4">Learn More. Do More.<br/><span className="text-orange-400">Grow Faster.</span></h1>
      <p className="text-gray-300 mb-6">Practical PDF Guides for Students, Teachers, Professionals & Business Owners.</p>
      <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold">Explore PDFs →</button>
    </div>
    <div className="flex gap-2">
      {[1,2,3].map(i => <div key={i} className="w-24 h-32 bg-white rounded-lg shadow-lg rotate-3"></div>)}
    </div>
  </section>
);
