import React, { useState } from 'react';
import {
  Search,
  User,
  ShoppingCart,
  MapPin,
  ChevronDown,
  LayoutDashboard,
  Store,
  ShieldCheck,
  Package,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  cartCount,
  openCart,
  currentUser,
  setCurrentUser,
  users,
  currentView,
  setCurrentView,
  flaggedCount
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('All');

  const navCategories = [
    { label: "Today's Deals", value: 'Deals' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Fashion', value: 'Fashion' },
    { label: 'Footwear', value: 'Footwear' },
    { label: 'Home & Kitchen', value: 'Home & Kitchen' },
    { label: 'Gaming', value: 'Gaming' },
    { label: 'Velmora Prime', value: 'Prime' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCategory !== 'All') {
      setSelectedCategory(searchCategory);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-md select-none font-sans">
      {/* Top Main Navigation Bar (Velmora Dark Slate Theme) */}
      <div className="bg-slate-950 text-white px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Brand Logo: Velmora */}
          <div
            onClick={() => {
              setCurrentView('storefront');
              setSelectedCategory('All');
            }}
            className="flex items-center gap-2 cursor-pointer group shrink-0 pt-0.5"
            title="Velmora - Home"
          >
            <div className="flex flex-col items-start leading-none">
              <div className="flex items-center gap-1">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
                  Velmora
                </span>
                <span className="text-amber-400 font-extrabold text-xl sm:text-2xl">.in</span>
              </div>
              {/* Velmora Smile Swoosh Accent */}
              <div className="w-full flex items-center -mt-0.5">
                <svg className="w-20 h-2.5 text-amber-400 fill-current" viewBox="0 0 100 20">
                  <path d="M5 4 Q50 20 95 4 Q50 14 5 4 Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Delivery Location Pill (Amazon Style) */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:ring-1 hover:ring-white cursor-pointer text-xs transition-all shrink-0">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="leading-tight">
              <span className="block text-[11px] text-slate-300">
                Deliver to {currentUser?.username ? currentUser.username.split('_')[0] : 'Guest'}
              </span>
              <span className="block font-bold text-white text-xs">
                Bengaluru 560103
              </span>
            </div>
          </div>

          {/* Amazon-Class Search Bar */}
          {currentView === 'storefront' ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-3xl hidden md:flex items-center h-10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 transition-all bg-white"
            >
              {/* Category Dropdown */}
              <div className="relative bg-slate-100 hover:bg-slate-200 border-r border-slate-300 text-slate-700 h-full flex items-center px-2 cursor-pointer shrink-0">
                <select
                  value={searchCategory}
                  onChange={(e) => {
                    setSearchCategory(e.target.value);
                    if (e.target.value === 'All') {
                      setSelectedCategory('All');
                    } else {
                      setSelectedCategory(e.target.value);
                    }
                  }}
                  className="bg-transparent text-xs font-semibold pr-4 outline-none cursor-pointer appearance-none text-slate-800"
                >
                  <option value="All">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Gaming">Gaming</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 pointer-events-none absolute right-1" />
              </div>

              {/* Main Input */}
              <input
                type="text"
                placeholder="Search Velmora.in for phones, shoes, clothing, electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-white outline-none h-full"
              />

              {/* Search Submit Button (Signature Amber Accent) */}
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 h-full flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Search"
              >
                <Search className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </button>
            </form>
          ) : (
            <div className="flex-1 max-w-xl mx-4 flex items-center gap-2 text-sm text-slate-300">
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black rounded text-xs uppercase tracking-wider">
                Velmora Admin
              </span>
              <span className="text-slate-400">/</span>
              <span className="font-semibold text-slate-200">Operations & Content Moderation Portal</span>
            </div>
          )}

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Quick Link to Admin Console */}
            {currentView === 'storefront' ? (
              <button
                onClick={() => setCurrentView('admin')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:ring-1 hover:ring-white text-xs font-medium text-slate-200 transition-all cursor-pointer"
                title="Open Velmora Operations Console"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <div className="text-left leading-tight">
                  <span className="block text-[10px] text-slate-400">Portal</span>
                  <span className="font-bold text-white text-xs flex items-center gap-1">
                    Admin
                    {flaggedCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full">
                        {flaggedCount}
                      </span>
                    )}
                  </span>
                </div>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('storefront')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded shadow transition-colors cursor-pointer"
              >
                <Store className="w-4 h-4 text-slate-950" />
                <span>Storefront</span>
              </button>
            )}

            {/* Account & Lists Dropdown (Amazon Style) */}
            <div className="relative">
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded hover:ring-1 hover:ring-white cursor-pointer text-xs transition-all"
              >
                <div className="text-left leading-tight">
                  <span className="block text-[11px] text-slate-300">
                    Hello, {currentUser ? currentUser.username.split('_')[0] : 'Sign In'}
                  </span>
                  <span className="font-bold text-white text-xs flex items-center gap-0.5">
                    Account & Lists
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </span>
                </div>
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="border-b border-slate-100 pb-3 mb-3">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate capitalize">{currentUser?.username}</p>
                    <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {currentUser?.role === 'owner' ? 'Store Operations' : 'Customer Account'}
                    </span>
                  </div>

                  {/* Switch Account */}
                  <div className="space-y-1.5 mb-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Switch User
                    </label>
                    <select
                      value={currentUser?.id || ''}
                      onChange={(e) => {
                        const sel = users.find((u) => u.id === parseInt(e.target.value));
                        if (sel) {
                          setCurrentUser(sel);
                          setProfileOpen(false);
                        }
                      }}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username} ({u.role === 'owner' ? 'Store Operations' : 'Customer'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <button
                      onClick={() => {
                        setCurrentView(currentView === 'admin' ? 'storefront' : 'admin');
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      <span>{currentView === 'admin' ? '← Back to Storefront' : 'Open Admin Portal (/admin)'}</span>
                      {flaggedCount > 0 && currentView !== 'admin' && (
                        <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full">
                          {flaggedCount} Flagged
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Returns & Orders (Amazon Style) */}
            <div
              onClick={openCart}
              className="hidden md:flex items-center px-2.5 py-1.5 rounded hover:ring-1 hover:ring-white cursor-pointer text-xs transition-all leading-tight"
            >
              <div>
                <span className="block text-[11px] text-slate-300">Returns</span>
                <span className="font-bold text-white text-xs">& Orders</span>
              </div>
            </div>

            {/* Shopping Cart Button (Amazon Style with Yellow Count Badge) */}
            {currentView === 'storefront' && (
              <button
                onClick={openCart}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:ring-1 hover:ring-white transition-all cursor-pointer group"
                title="View Shopping Cart"
              >
                <div className="relative flex items-center">
                  <ShoppingCart className="w-7 h-7 text-white group-hover:text-amber-400 transition-colors" />
                  <span className="absolute -top-1.5 left-3.5 bg-amber-400 text-slate-950 text-xs font-black px-1.5 py-0.2 rounded-full min-w-5 text-center shadow-xs">
                    {cartCount}
                  </span>
                </div>
                <span className="hidden sm:inline font-bold text-xs text-white group-hover:text-amber-400">
                  Cart
                </span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input (Visible only on small screens) */}
        {currentView === 'storefront' && (
          <div className="mt-2.5 md:hidden">
            <div className="flex items-center h-9 bg-white rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Search Velmora.in..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 text-xs text-slate-900 outline-none"
              />
              <button
                onClick={handleSearchSubmit}
                className="bg-amber-400 text-slate-950 px-3 h-full flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Sub-Navigation Strip (Amazon "All Departments" Bar) */}
      {currentView === 'storefront' && (
        <div className="bg-slate-900 text-slate-200 px-3 sm:px-6 lg:px-8 py-2 text-xs flex items-center justify-between border-t border-slate-800 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* All Departments Button */}
            <button
              onClick={() => setSelectedCategory('All')}
              className={`flex items-center gap-1.5 font-bold hover:text-amber-400 transition-colors cursor-pointer ${
                selectedCategory === 'All' ? 'text-amber-400 font-extrabold' : 'text-white'
              }`}
            >
              <Menu className="w-4 h-4" />
              <span>All Departments</span>
            </button>

            {/* Category Links */}
            {navCategories.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`hover:text-amber-400 transition-colors cursor-pointer font-medium ${
                    isActive ? 'text-amber-400 font-bold border-b border-amber-400 pb-0.5' : 'text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right Announcement */}
          <div className="hidden lg:flex items-center gap-2 text-amber-400 font-semibold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast, Free Prime Delivery on Eligible Orders</span>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 text-xs text-white space-y-3">
          <p className="font-bold uppercase tracking-wider text-amber-400 text-[11px]">Departments</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700"
            >
              All Products
            </button>
            {navCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setMobileMenuOpen(false);
                }}
                className="text-left py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700"
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setCurrentView(currentView === 'admin' ? 'storefront' : 'admin');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-amber-400 text-slate-950 font-bold rounded text-center"
            >
              {currentView === 'admin' ? 'Customer Storefront' : 'Admin Operations (/admin)'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
