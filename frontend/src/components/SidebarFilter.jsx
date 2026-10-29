import React, { useState } from 'react';
import { Star, Check, Zap, RotateCcw } from 'lucide-react';

export default function SidebarFilter({
  selectedCategory,
  setSelectedCategory,
  selectedBrands,
  setSelectedBrands,
  selectedPriceRange,
  setSelectedPriceRange,
  customMinPrice,
  setCustomMinPrice,
  customMaxPrice,
  setCustomMaxPrice,
  onApplyCustomPrice,
  selectedMinRating,
  setSelectedMinRating,
  primeOnly,
  setPrimeOnly,
  inStockOnly,
  setInStockOnly,
  selectedDiscount,
  setSelectedDiscount,
  onClearAll
}) {
  const [minInput, setMinInput] = useState(customMinPrice || '');
  const [maxInput, setMaxInput] = useState(customMaxPrice || '');

  const categories = [
    { label: 'All Departments', value: 'All' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Footwear', value: 'Footwear' },
    { label: 'Fashion & Apparel', value: 'Fashion' },
    { label: 'Home & Kitchen', value: 'Home & Kitchen' },
    { label: 'Gaming & Accessories', value: 'Gaming' }
  ];

  const brands = [
    'Apple',
    'Sony',
    'Samsung',
    'Nike',
    'Adidas',
    'Puma',
    'boAt',
    'JBL',
    'Noise',
    'Fastrack',
    "Levi's",
    'Allen Solly',
    'Roadster',
    'Philips',
    'Logitech',
    'Dyson',
    'Nespresso',
    'Razer'
  ];

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹2,000', value: 'under-2000' },
    { label: '₹2,000 to ₹10,000', value: '2000-10000' },
    { label: '₹10,000 to ₹30,000', value: '10000-30000' },
    { label: 'Above ₹30,000', value: 'above-30000' }
  ];

  const discounts = [
    { label: 'All Deals', value: 0 },
    { label: '10% Off or more', value: 10 },
    { label: '25% Off or more', value: 25 },
    { label: '50% Off or more', value: 50 }
  ];

  const toggleBrand = (b) => {
    if (selectedBrands.includes(b)) {
      setSelectedBrands(selectedBrands.filter((item) => item !== b));
    } else {
      setSelectedBrands([...selectedBrands, b]);
    }
  };

  const handleCustomPriceSubmit = (e) => {
    e.preventDefault();
    if (onApplyCustomPrice) {
      onApplyCustomPrice(minInput, maxInput);
    }
  };

  return (
    <aside className="w-64 shrink-0 pr-6 border-r border-slate-200 hidden md:block text-slate-800 text-xs font-sans">
      
      {/* Filters Title & Clear Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <span className="font-extrabold text-sm uppercase tracking-tight text-slate-900">
          Filters
        </span>
        <button
          onClick={onClearAll}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="py-4 space-y-6">
        
        {/* Velmora Prime Filter (Amazon Style) */}
        <div className="space-y-2 pb-5 border-b border-slate-100">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Delivery Option
          </h4>
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={primeOnly}
              onChange={(e) => setPrimeOnly(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
              <span className="bg-slate-950 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                PRIME
              </span>
              <span>Velmora One-Day</span>
            </span>
          </label>
        </div>

        {/* Customer Review Rating (Amazon 4-Star & Up Style) */}
        <div className="space-y-2.5 pb-5 border-b border-slate-100">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Customer Reviews
          </h4>
          <div className="space-y-2">
            {[
              { stars: 4, label: '& Up' },
              { stars: 3, label: '& Up' },
              { stars: 2, label: '& Up' }
            ].map((item) => (
              <button
                key={item.stars}
                type="button"
                onClick={() =>
                  setSelectedMinRating(selectedMinRating === item.stars ? 0 : item.stars)
                }
                className={`w-full flex items-center gap-2 text-left py-1 px-1.5 rounded transition-colors cursor-pointer ${
                  selectedMinRating === item.stars
                    ? 'bg-amber-50 text-amber-900 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= item.stars
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-700">{item.label}</span>
              </button>
            ))}
            {selectedMinRating > 0 && (
              <button
                onClick={() => setSelectedMinRating(0)}
                className="text-[11px] text-amber-600 hover:underline font-semibold block pt-1"
              >
                Reset Rating Filter
              </button>
            )}
          </div>
        </div>

        {/* Department / Category Selection */}
        <div className="space-y-2.5 pb-5 border-b border-slate-100">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Department
          </h4>
          <div className="space-y-1.5">
            {categories.map((cat) => (
              <label
                key={cat.value}
                className="flex items-center gap-2.5 cursor-pointer select-none py-0.5 hover:text-amber-600 transition-colors"
              >
                <input
                  type="radio"
                  name="sidebar-category"
                  checked={selectedCategory === cat.value}
                  onChange={() => setSelectedCategory(cat.value)}
                  className="w-3.5 h-3.5 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                />
                <span
                  className={
                    selectedCategory === cat.value ? 'font-bold text-slate-900' : 'text-slate-600'
                  }
                >
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div className="space-y-2.5 pb-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Brand
            </h4>
            {selectedBrands.length > 0 && (
              <button
                onClick={() => setSelectedBrands([])}
                className="text-[10px] text-amber-600 font-bold hover:underline"
              >
                Clear ({selectedBrands.length})
              </button>
            )}
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2.5 cursor-pointer select-none py-0.5 hover:text-amber-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                />
                <span
                  className={
                    selectedBrands.includes(brand) ? 'font-bold text-slate-900' : 'text-slate-600'
                  }
                >
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Ranges & Custom Go Input */}
        <div className="space-y-2.5 pb-5 border-b border-slate-100">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Price
          </h4>
          <div className="space-y-1.5">
            {priceRanges.map((pr) => (
              <label
                key={pr.value}
                className="flex items-center gap-2.5 cursor-pointer select-none py-0.5 hover:text-amber-600 transition-colors"
              >
                <input
                  type="radio"
                  name="sidebar-price"
                  checked={selectedPriceRange === pr.value}
                  onChange={() => {
                    setSelectedPriceRange(pr.value);
                    setMinInput('');
                    setMaxInput('');
                  }}
                  className="w-3.5 h-3.5 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                />
                <span
                  className={
                    selectedPriceRange === pr.value ? 'font-bold text-slate-900' : 'text-slate-600'
                  }
                >
                  {pr.label}
                </span>
              </label>
            ))}
          </div>

          {/* Custom Price Range (Amazon Min/Max Go style) */}
          <form onSubmit={handleCustomPriceSubmit} className="pt-2 flex items-center gap-2">
            <input
              type="number"
              placeholder="₹ Min"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              placeholder="₹ Max"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs cursor-pointer"
            >
              Go
            </button>
          </form>
        </div>

        {/* Discount Filter */}
        <div className="space-y-2.5 pb-5 border-b border-slate-100">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Discount
          </h4>
          <div className="space-y-1.5">
            {discounts.map((d) => (
              <label
                key={d.value}
                className="flex items-center gap-2.5 cursor-pointer select-none py-0.5 hover:text-amber-600 transition-colors"
              >
                <input
                  type="radio"
                  name="sidebar-discount"
                  checked={selectedDiscount === d.value}
                  onChange={() => setSelectedDiscount(d.value)}
                  className="w-3.5 h-3.5 text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                />
                <span
                  className={
                    selectedDiscount === d.value ? 'font-bold text-slate-900' : 'text-slate-600'
                  }
                >
                  {d.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            Availability
          </h4>
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
            />
            <span className="text-slate-700 font-medium group-hover:text-amber-600">
              In Stock Only
            </span>
          </label>
        </div>

      </div>
    </aside>
  );
}
