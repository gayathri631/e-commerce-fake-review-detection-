import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, Truck, Sparkles } from 'lucide-react';

export default function HeroBanner({ onSelectCategory, onQuickFilter }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "VELMORA MEGA SAVINGS DAYS",
      subtitle: "Up to 60% Off on Top Electronics, Smartwatches & Premium Audio",
      badge: "LIMITED TIME OFFER",
      category: "Electronics",
      bgGradient: "from-slate-950 via-slate-900 to-amber-950",
      accent: "text-amber-400",
      btnText: "Explore Electronics",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    },
    {
      title: "VELMORA PRIME FESTIVAL",
      subtitle: "Free Next-Day Delivery & 100% Genuine Certified Guarantee",
      badge: "EXCLUSIVE TO PRIME",
      category: "All",
      bgGradient: "from-slate-950 via-slate-900 to-blue-950",
      accent: "text-cyan-400",
      btnText: "Shop All Deals",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
    },
    {
      title: "NEW ARRIVALS & TRENDS",
      subtitle: "Discover high-performance footwear, fashion & kitchen essentials",
      badge: "TRENDING NOW",
      category: "Fashion",
      bgGradient: "from-slate-950 via-slate-900 to-emerald-950",
      accent: "text-emerald-400",
      btnText: "Shop Fashion & Footwear",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full mb-6 font-sans">
      {/* Main Hero Slider */}
      <div
        className={`w-full rounded-2xl overflow-hidden bg-gradient-to-r ${slide.bgGradient} border border-slate-800 text-white min-h-[220px] sm:min-h-[260px] p-6 sm:p-10 flex flex-col justify-between relative shadow-lg transition-all duration-700`}
      >
        {/* Background glow and subtle product thumbnail */}
        <div className="absolute right-4 sm:right-16 top-1/2 -translate-y-1/2 hidden md:block w-48 lg:w-64 h-48 lg:h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/10 opacity-90">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text and Actions */}
        <div className="max-w-xl space-y-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/10 backdrop-blur-xs border border-white/15 text-amber-400">
            <Zap className="w-3 h-3 fill-amber-400" />
            {slide.badge}
          </span>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {slide.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            {slide.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectCategory(slide.category)}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
            >
              {slide.btnText}
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Free Next-Day Prime Delivery</span>
            </div>
          </div>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="flex items-center justify-between pt-4 z-10 border-t border-white/10 mt-4">
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Amazon Quick-Feature Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[
          {
            title: "Electronics Fest",
            subtitle: "Up to 40% Off",
            category: "Electronics",
            img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&q=80"
          },
          {
            title: "Footwear & Running",
            subtitle: "Starting ₹2,199",
            category: "Footwear",
            img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80"
          },
          {
            title: "Fashion & Denim",
            subtitle: "Min. 30% Off",
            category: "Fashion",
            img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&q=80"
          },
          {
            title: "Home & Kitchen",
            subtitle: "Best Selling Brands",
            category: "Home & Kitchen",
            img: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=300&q=80"
          }
        ].map((card, i) => (
          <div
            key={i}
            onClick={() => onSelectCategory(card.category)}
            className="bg-white rounded-xl p-3 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
          >
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-700">
                {card.title}
              </h4>
              <p className="text-[11px] text-amber-700 font-bold mt-0.5">
                {card.subtitle}
              </p>
              <span className="text-[10px] text-slate-400 group-hover:underline mt-1 block">
                Shop now &rarr;
              </span>
            </div>
            <img
              src={card.img}
              alt={card.title}
              className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0 ml-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

