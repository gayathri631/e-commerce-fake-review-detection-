import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  ThumbsUp,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Check,
  Truck,
  RotateCcw,
  Award,
  Lock,
  ChevronRight
} from 'lucide-react';
import { submitReview, voteReviewHelpful } from '../api';

export default function ProductDetailModal({
  product,
  onClose,
  currentUser,
  onAddToCart,
  onBuyNow,
  onReviewSubmitted
}) {
  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null);
  const [localReviews, setLocalReviews] = useState(product?.reviews || []);
  const [votedMap, setVotedMap] = useState({});
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const savings = product.original_price ? product.original_price - product.price : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() || !headline.trim()) return;

    setIsSubmitting(true);
    setSubmitFeedback(null);

    try {
      const res = await submitReview({
        product_id: product.id,
        user_id: currentUser?.id || 1,
        rating: rating,
        headline: headline,
        body: body
      });

      // Pure customer-facing status (NO internal ML jargon shown to users)
      setSubmitFeedback({
        status: res.review.status,
        verified: res.review.is_verified_purchase
      });

      if (res.review.status === 'APPROVED') {
        setLocalReviews([
          {
            id: res.review.id,
            rating: res.review.rating,
            headline: res.review.headline,
            body: body,
            username: currentUser?.username || 'Customer',
            is_verified_purchase: res.review.is_verified_purchase,
            helpful_votes: 0,
            status: 'APPROVED',
            created_at: new Date().toISOString()
          },
          ...localReviews
        ]);
      }

      setHeadline('');
      setBody('');
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (reviewId) => {
    if (votedMap[reviewId]) return;
    try {
      const res = await voteReviewHelpful(reviewId);
      setVotedMap({ ...votedMap, [reviewId]: true });
      setLocalReviews(
        localReviews.map((r) =>
          r.id === reviewId ? { ...r, helpful_votes: res.helpful_votes } : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-sans">
      <div className="bg-white rounded-xl max-w-6xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Header & Breadcrumb */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium truncate">
            <span className="hover:text-amber-600 cursor-pointer">Velmora</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="hover:text-amber-600 cursor-pointer">{product.category}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-slate-900 truncate">{product.brand}</span>
          </nav>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Product Details & Reviews Area */}
        <div className="overflow-y-auto px-5 py-6 space-y-10">
          
          {/* Main 3-Column Amazon Layout: Image | Product Info | Buy Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 1. Left: Product Image (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full aspect-square bg-slate-50 rounded-xl border border-slate-200 p-6 flex items-center justify-center overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Roll over image to zoom in
              </p>
            </div>

            {/* 2. Middle: Product Attributes & Overview (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Brand: {product.brand}
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mt-1">
                  {product.title}
                </h1>
              </div>

              {/* Star Rating & Review Count */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(product.rating_avg || 4.2)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {(product.rating_avg || 4.2).toFixed(1)}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs font-medium text-amber-700 hover:underline cursor-pointer">
                  {(product.rating_count || 18)} ratings
                </span>
              </div>

              {/* Price Details */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-950">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.original_price && (
                    <span className="text-sm text-slate-400 line-through">
                      M.R.P.: ₹{product.original_price.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-sm font-bold text-red-600">
                      -{discount}%
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-xs text-slate-600 font-medium">
                    You save: <strong className="text-red-700 font-bold">₹{savings.toLocaleString('en-IN')} ({discount}%)</strong>
                  </p>
                )}
                <p className="text-[11px] text-slate-500 font-medium">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Velmora Guarantee Badges */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-y border-slate-100 py-3 text-center">
                <div className="flex flex-col items-center">
                  <Truck className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-700 leading-tight">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-700 leading-tight">7 Days Return</span>
                </div>
                <div className="flex flex-col items-center">
                  <Award className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-700 leading-tight">100% Genuine</span>
                </div>
                <div className="flex flex-col items-center">
                  <Lock className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-700 leading-tight">Secure Pay</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  About this item
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* 3. Right: Amazon Buy Box (3 cols) */}
            <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="text-2xl font-black text-slate-950">
                ₹{product.price.toLocaleString('en-IN')}
              </div>

              <div className="text-xs space-y-1 text-slate-700">
                <div className="flex items-center gap-1 text-slate-900 font-bold">
                  <span className="bg-slate-950 text-white text-[9px] font-black px-1 rounded">prime</span>
                  <span>FREE delivery <strong className="text-slate-950 font-bold">Tomorrow, 9 PM</strong></span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Delivering to Bengaluru 560103
                </p>
              </div>

              <div className="text-sm font-bold text-emerald-700">
                In Stock
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Quantity:</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-bold outline-none cursor-pointer"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>

              {/* Add to Cart & Buy Now Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => onAddToCart({ ...product, quantity })}
                  className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onBuyNow) {
                      onBuyNow({ ...product, quantity });
                    } else {
                      onAddToCart({ ...product, quantity });
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Place Order Now</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 space-y-1">
                <div className="flex justify-between">
                  <span>Ships from:</span>
                  <span className="font-semibold text-slate-700">Velmora.in</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold by:</span>
                  <span className="font-semibold text-slate-700">Velmora Retail</span>
                </div>
              </div>
            </div>

          </div>

          <hr className="border-slate-200" />

          {/* Amazon-Class Customer Reviews & Ratings Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Customer Reviews
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic ratings and verified reviews from genuine customers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Rating Summary & 5-Star Breakdown (4 cols) */}
              <div className="md:col-span-4 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900">
                    {(product.rating_avg || 4.2).toFixed(1)}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(product.rating_avg || 4.2)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">out of 5</span>
                </div>

                <p className="text-xs text-slate-500">
                  {product.rating_count || 18} global ratings
                </p>

                {/* 5-Star Bars */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct = product.star_breakdown ? product.star_breakdown[star] || (star === 5 ? 70 : star === 4 ? 20 : 5) : (star === 5 ? 70 : star === 4 ? 20 : 5);
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-12 font-medium text-amber-700 hover:underline cursor-pointer">
                          {star} star
                        </span>
                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <span className="w-10 text-right font-semibold text-slate-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write Customer Review Form (8 cols) */}
              <div className="md:col-span-8 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">
                  Write a Customer Review
                </h3>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">Overall Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Add a headline (e.g. What's most important to know?)"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                    required
                  />

                  <textarea
                    placeholder="Write your review: What did you like or dislike? What did you use this product for?"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows="3"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                    required
                  ></textarea>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">
                      Reviewing as: <strong className="text-slate-700 capitalize">{currentUser?.username || 'Customer'}</strong>
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>

                {/* Pure Customer Confirmation Message (Completely free of backend/ML jargon) */}
                {submitFeedback && (
                  <div
                    className={`p-4 rounded-xl border text-xs sm:text-sm transition-all ${
                      submitFeedback.status === 'APPROVED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${
                        submitFeedback.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'
                      }`} />
                      <div className="space-y-1">
                        <div className="font-bold">
                          {submitFeedback.status === 'APPROVED'
                            ? 'Thank you! Your review has been submitted and posted.'
                            : 'Thank you! Your review has been submitted for moderation.'}
                        </div>
                        <div className="text-xs opacity-90">
                          {submitFeedback.status === 'APPROVED'
                            ? 'Your feedback is now visible to the Velmora shopping community.'
                            : 'Thank you for sharing your feedback. New customer submissions are reviewed before appearing publicly.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* List of Customer Reviews (Amazon Style) */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                Top reviews from India ({localReviews.length})
              </h3>

              {localReviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No customer reviews yet. Be the first to share your thoughts!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {localReviews.map((rev) => (
                    <div key={rev.id} className="py-4 space-y-2">
                      {/* User Info */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                          {rev.username ? rev.username.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-semibold text-slate-900 text-xs sm:text-sm capitalize">
                          {rev.username}
                        </span>
                      </div>

                      {/* Rating & Headline */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-200 text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {rev.headline}
                        </h4>
                      </div>

                      {/* Date & Verified Purchase Badge (Amazon style) */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Reviewed on {new Date(rev.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        {rev.is_verified_purchase && (
                          <>
                            <span>|</span>
                            <span className="font-bold text-amber-700">
                              Verified Purchase
                            </span>
                          </>
                        )}
                      </div>

                      {/* Review Body */}
                      <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                        {rev.body}
                      </p>

                      {/* Helpful Button */}
                      <div className="pt-1 flex items-center gap-3">
                        <button
                          onClick={() => handleVote(rev.id)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                            votedMap[rev.id]
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({rev.helpful_votes || 0})</span>
                        </button>
                        <span className="text-xs text-slate-400 cursor-pointer hover:underline">
                          Report
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
