import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import SidebarFilter from './components/SidebarFilter';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartModal from './components/CartModal';
import AdminDashboard from './components/AdminDashboard';
import { fetchProducts, fetchProductDetail, fetchUsers, fetchModerationStats } from './api';
import { RotateCcw, ChevronDown, Check, Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  // Check URL pathname or hash for direct /admin routing
  const getInitialView = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
      return 'admin';
    }
    return 'storefront';
  };

  const [currentView, setCurrentView] = useState(getInitialView());
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters State (Amazon Style)
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [selectedMinRating, setSelectedMinRating] = useState(0);
  const [primeOnly, setPrimeOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  // Cart & Instant Checkout State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [flaggedCount, setFlaggedCount] = useState(0);

  // Sync URL bar with view
  const setView = (view) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [userData, statsData] = await Promise.all([
          fetchUsers(),
          fetchModerationStats()
        ]);
        setUsers(userData);
        if (userData.length > 0) {
          if (currentView === 'admin') {
            const adminUser = userData.find((u) => u.role === 'owner') || userData[0];
            setCurrentUser(adminUser);
          } else {
            setCurrentUser(userData[0]);
          }
        }
        setFlaggedCount(statsData.flagged_reviews);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    init();
  }, []);

  // Fetch products from backend
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(selectedCategory, searchQuery);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery]);

  // Client-side filtering & sorting for instant Amazon-grade responsiveness
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Price range presets
    if (selectedPriceRange === 'under-2000') {
      result = result.filter((p) => p.price < 2000);
    } else if (selectedPriceRange === '2000-10000') {
      result = result.filter((p) => p.price >= 2000 && p.price <= 10000);
    } else if (selectedPriceRange === '10000-30000') {
      result = result.filter((p) => p.price > 10000 && p.price <= 30000);
    } else if (selectedPriceRange === 'above-30000') {
      result = result.filter((p) => p.price > 30000);
    }

    // Custom Min/Max Price filter
    if (customMinPrice !== '' && !isNaN(customMinPrice)) {
      result = result.filter((p) => p.price >= Number(customMinPrice));
    }
    if (customMaxPrice !== '' && !isNaN(customMaxPrice)) {
      result = result.filter((p) => p.price <= Number(customMaxPrice));
    }

    // Rating filter (4 stars & up, etc.)
    if (selectedMinRating > 0) {
      result = result.filter((p) => (p.rating_avg || 4.2) >= selectedMinRating);
    }

    // Discount filter
    if (selectedDiscount > 0) {
      result = result.filter((p) => {
        if (!p.original_price) return false;
        const disc = Math.round(((p.original_price - p.price) / p.original_price) * 100);
        return disc >= selectedDiscount;
      });
    }

    // In Stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.in_stock);
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating_avg || 4.2) - (a.rating_avg || 4.2));
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [
    products,
    selectedBrands,
    selectedPriceRange,
    customMinPrice,
    customMaxPrice,
    selectedMinRating,
    selectedDiscount,
    inStockOnly,
    sortBy
  ]);

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedBrands([]);
    setSelectedPriceRange('all');
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setSelectedMinRating(0);
    setPrimeOnly(false);
    setInStockOnly(false);
    setSelectedDiscount(0);
    setSearchQuery('');
  };

  const handleApplyCustomPrice = (min, max) => {
    setSelectedPriceRange('custom');
    setCustomMinPrice(min);
    setCustomMaxPrice(max);
  };

  const handleSelectProduct = async (product) => {
    try {
      const fullDetail = await fetchProductDetail(product.id);
      setSelectedProduct(fullDetail);
    } catch (err) {
      console.error(err);
      setSelectedProduct(product);
    }
  };

  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
    setIsCartOpen(true);
  };

  const handleBuyNow = (product) => {
    // Single-click checkout flow for instant ordering
    setCart([product]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      
      {/* Velmora Top Navigation */}
      <Navbar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.length}
        openCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        setCurrentUser={(u) => {
          setCurrentUser(u);
          if (u.role === 'owner') {
            setView('admin');
          }
        }}
        users={users}
        currentView={currentView}
        setCurrentView={setView}
        flaggedCount={flaggedCount}
      />

      {/* Main Content Router */}
      <main className="flex-1 w-full">
        {currentView === 'admin' ? (
          <AdminDashboard
            onStatsChanged={(count) => setFlaggedCount(count)}
            onBackToStore={() => setView('storefront')}
          />
        ) : (
          <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            
            {/* Amazon-Style Hero Banner Carousel & Deals Bar */}
            {selectedCategory === 'All' && !searchQuery && (
              <HeroBanner
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                onQuickFilter={(type) => {
                  if (type === 'under-2000') setSelectedPriceRange('under-2000');
                  if (type === 'rating-4') setSelectedMinRating(4);
                }}
              />
            )}

            {/* Results Header Bar & Sorting */}
            <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-slate-700">
                <span>Showing </span>
                <strong className="text-slate-950 font-bold">1-{filteredProducts.length}</strong>
                <span> of </span>
                <strong className="text-slate-950 font-bold">{filteredProducts.length}</strong>
                <span> results for </span>
                <span className="text-amber-700 font-bold">
                  "{searchQuery ? searchQuery : selectedCategory === 'All' ? 'All Departments' : selectedCategory}"
                </span>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold py-1.5 px-3 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="recommended">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Avg. Customer Review</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Layout: Amazon Left Sidebar Filters + Product Grid */}
            <div className="flex items-start gap-6">
              
              {/* Left Sidebar */}
              <SidebarFilter
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={setSelectedPriceRange}
                customMinPrice={customMinPrice}
                setCustomMinPrice={setCustomMinPrice}
                customMaxPrice={customMaxPrice}
                setCustomMaxPrice={setCustomMaxPrice}
                onApplyCustomPrice={handleApplyCustomPrice}
                selectedMinRating={selectedMinRating}
                setSelectedMinRating={setSelectedMinRating}
                primeOnly={primeOnly}
                setPrimeOnly={setPrimeOnly}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                selectedDiscount={selectedDiscount}
                setSelectedDiscount={setSelectedDiscount}
                onClearAll={handleClearFilters}
              />

              {/* Right Side Product Grid */}
              <div className="flex-1 min-w-0">
                {loading ? (
                  <div className="py-24 text-center text-slate-400 text-sm font-medium bg-white rounded-xl border border-slate-200">
                    Loading Velmora catalog...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="py-24 text-center bg-white rounded-xl border border-slate-200 p-8 space-y-3">
                    <p className="font-bold text-slate-800 text-base">
                      No results found for your active filters.
                    </p>
                    <p className="text-xs text-slate-500">
                      Try clearing some filters or searching with different keywords.
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full cursor-pointer shadow-xs"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onSelect={handleSelectProduct}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          currentUser={currentUser}
          onAddToCart={handleAddToCart}
          onBuyNow={(prod) => {
            setSelectedProduct(null);
            handleBuyNow(prod);
          }}
          onReviewSubmitted={() => {
            loadProducts();
            fetchModerationStats().then((s) => setFlaggedCount(s.flagged_reviews));
          }}
        />
      )}

      {/* Shopping Cart & Instant Checkout Modal */}
      {isCartOpen && (
        <CartModal
          cartItems={cart}
          onClose={() => setIsCartOpen(false)}
          currentUser={currentUser}
          onClearCart={() => setCart([])}
          onRemoveItem={handleRemoveFromCart}
          onOrderSuccess={() => {
            loadProducts();
          }}
        />
      )}

      {/* Amazon-Style Multi-Tier Footer */}
      <footer className="mt-16 text-xs text-slate-300 font-sans">
        {/* Back to Top Bar */}
        <button
          onClick={scrollToTop}
          className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-center text-xs font-bold text-white transition-colors cursor-pointer"
        >
          Back to top
        </button>

        {/* 4-Column Directory */}
        <div className="bg-slate-900 py-12 px-6 lg:px-12 border-b border-slate-800">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h5 className="font-bold text-white text-sm mb-3">Get to Know Us</h5>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-amber-400 cursor-pointer">About Velmora</li>
                <li className="hover:text-amber-400 cursor-pointer">Careers</li>
                <li className="hover:text-amber-400 cursor-pointer">Press Releases</li>
                <li className="hover:text-amber-400 cursor-pointer">Velmora Science</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-sm mb-3">Connect with Us</h5>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-amber-400 cursor-pointer">Facebook</li>
                <li className="hover:text-amber-400 cursor-pointer">Twitter / X</li>
                <li className="hover:text-amber-400 cursor-pointer">Instagram</li>
                <li className="hover:text-amber-400 cursor-pointer">Velmora Community</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-sm mb-3">Make Money with Us</h5>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-amber-400 cursor-pointer">Sell on Velmora</li>
                <li className="hover:text-amber-400 cursor-pointer">Sell under Velmora Accelerator</li>
                <li className="hover:text-amber-400 cursor-pointer">Protect and Build Your Brand</li>
                <li className="hover:text-amber-400 cursor-pointer">Fulfillment by Velmora</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-sm mb-3">Let Us Help You</h5>
              <ul className="space-y-2 text-slate-400 mb-4">
                <li className="hover:text-amber-400 cursor-pointer">Your Account</li>
                <li className="hover:text-amber-400 cursor-pointer">Returns Centre</li>
                <li className="hover:text-amber-400 cursor-pointer">100% Purchase Protection</li>
                <li className="hover:text-amber-400 cursor-pointer">Help & Customer Service</li>
              </ul>
              <button
                onClick={() => setView('admin')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded border border-slate-700 transition-colors cursor-pointer text-xs"
              >
                Velmora Operations Portal (/admin)
              </button>
            </div>
          </div>
        </div>

        {/* Brand Bottom Bar */}
        <div className="bg-slate-950 py-8 px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-black text-white">
              Velmora<span className="text-amber-400">.in</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="hover:underline cursor-pointer">Conditions of Use & Sale</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Privacy Notice</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Interest-Based Ads</span>
            <span>•</span>
            <button
              onClick={() => setView(currentView === 'admin' ? 'storefront' : 'admin')}
              className="hover:underline text-amber-400 cursor-pointer font-bold"
            >
              {currentView === 'admin' ? 'Customer Storefront' : 'Admin Operations (/admin)'}
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            © 2026, Velmora.in, Inc. or its affiliates. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
