import React from 'react';
import { Star, ShoppingCart, Zap, Check } from 'lucide-react';

export default function ProductCard({ product, onSelect, onAddToCart, onBuyNow }) {
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  // Derive badge type like Amazon (Best Seller or Velmora's Choice)
  const isBestSeller = product.price < 5000 && product.rating_avg >= 4.0;
  const isVelmorasChoice = product.rating_avg >= 4.5 && product.price >= 5000;
  const isLimitedDeal = discount >= 30;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer font-sans relative"
    >
      {/* Top Media & Badges */}
      <div className="relative">
        {/* Amazon-style Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {isBestSeller && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
              #1 Best Seller
            </span>
          )}
          {isVelmorasChoice && (
            <span className="bg-slate-950 text-amber-400 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
              <span>Velmora's</span>
              <span className="text-white">Choice</span>
            </span>
          )}
          {isLimitedDeal && !isBestSeller && !isVelmorasChoice && (
            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
              Limited Time Deal
            </span>
          )}
        </div>

        {/* Product Image */}
        <div className="w-full aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-4">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          {/* Brand */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {product.brand}
          </span>

          {/* Title */}
          <h3
            className="font-medium text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Amazon Star Rating & Review Count */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(product.rating_avg || 4.2)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 fill-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700">
              {(product.rating_avg || 4.2).toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              ({(product.rating_count || 18).toLocaleString('en-IN')})
            </span>
          </div>

          {/* Price Block */}
          <div className="pt-1.5 space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-slate-950">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-bold text-red-600">
                  ({discount}% off)
                </span>
              )}
            </div>

            {/* Prime Delivery Tag */}
            <div className="flex items-center gap-1 text-[11px] text-slate-700 pt-0.5">
              <span className="font-black text-slate-950 text-[10px] bg-slate-100 px-1 py-0.2 rounded border border-slate-300">
                prime
              </span>
              <span>FREE delivery by <strong className="text-slate-900 font-bold">Tomorrow, 9 PM</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Amazon Buy Now & Add to Cart) */}
        <div className="pt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="w-full py-2 px-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Add to Shopping Cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onBuyNow) {
                onBuyNow(product);
              } else {
                onAddToCart(product);
              }
            }}
            className="w-full py-2 px-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-full shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Instant Checkout / Place Order"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
