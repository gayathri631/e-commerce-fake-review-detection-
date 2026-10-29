import React, { useState } from 'react';
import {
  X,
  Trash2,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  CreditCard,
  Truck,
  PackageCheck,
  ChevronRight
} from 'lucide-react';
import { createOrder } from '../api';

export default function CartModal({
  cartItems,
  onClose,
  currentUser,
  onClearCart,
  onOrderSuccess,
  onRemoveItem
}) {
  const [address, setAddress] = useState(
    'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka, 560103'
  );
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsOrdering(true);
    try {
      const res = await createOrder({
        user_id: currentUser?.id || 1,
        shipping_address: address,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity || 1
        }))
      });

      const randomOrderId = `VEL-${Math.floor(100 + Math.random() * 900)}-${Math.floor(
        1000000 + Math.random() * 9000000
      )}`;
      setOrderId(randomOrderId);
      setOrderConfirmed(true);

      if (onOrderSuccess) onOrderSuccess();
    } catch (err) {
      alert(`Order placement failed: ${err.message}`);
    } finally {
      setIsOrdering(false);
    }
  };

  const handleDoneShopping = () => {
    onClearCart();
    setOrderConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white">
              Velmora<span className="text-amber-400">.in</span>
            </span>
            <span className="text-slate-400">|</span>
            <span className="font-bold text-sm text-slate-200">
              {orderConfirmed ? 'Order Confirmation' : 'Checkout & Place Order'}
            </span>
          </div>

          <button
            onClick={orderConfirmed ? handleDoneShopping : onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {orderConfirmed ? (
            /* Amazon-Style Order Placed Screen */
            <div className="py-6 space-y-6 text-center animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-950">
                  Order placed, thank you!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Confirmation will be sent to{' '}
                  <strong className="text-slate-900 font-semibold">
                    {currentUser?.email || 'your email address'}
                  </strong>
                </p>
                <p className="text-xs text-slate-400 pt-1">
                  Order ID: <span className="font-mono font-bold text-slate-800">{orderId}</span>
                </p>
              </div>

              {/* Delivery Promise Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Truck className="w-4 h-4 text-amber-500" />
                  <span>Guaranteed Delivery: Tomorrow by 9:00 PM</span>
                </div>
                <p className="text-slate-600">
                  Shipping to: <strong className="text-slate-800">{address}</strong>
                </p>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 text-sm">
                  <span>Order Total:</span>
                  <span className="text-slate-950">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDoneShopping}
                className="px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
              >
                Continue Shopping on Velmora
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <ShoppingCart className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">Your Velmora Cart is empty</h4>
              <p className="text-xs text-slate-500">
                Explore our best sellers and daily deals to add items to your cart.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-full cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Step 1: Delivery Address */}
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>1. Delivery Address</span>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Step 2: Payment Method (No Gateways Needed) */}
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span>2. Payment Option</span>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-800 font-semibold">
                    <input
                      type="radio"
                      checked
                      readOnly
                      className="w-4 h-4 text-amber-500 accent-amber-500"
                    />
                    <span>Cash on Delivery / Direct 1-Click Pay (No Payment Gateway Needed)</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Free
                  </span>
                </div>
              </div>

              {/* Step 3: Review Items in Cart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-900">
                  <span>3. Review Items ({cartItems.length})</span>
                  <span className="text-emerald-700 font-semibold normal-case">
                    FREE Velmora Prime Delivery
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="py-3 flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-14 h-14 object-contain rounded-lg border border-slate-200 bg-slate-50 shrink-0 p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          {item.brand}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <div className="text-xs font-black text-slate-950 pt-0.5">
                          ₹{item.price.toLocaleString('en-IN')}
                          {item.quantity && item.quantity > 1 && (
                            <span className="text-slate-400 font-normal ml-2">
                              Qty: {item.quantity}
                            </span>
                          )}
                        </div>
                      </div>

                      {onRemoveItem && (
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Calculation & Place Order CTA */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span className="text-emerald-700 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between font-black text-base text-slate-950 pt-2 border-t border-slate-200">
                    <span>Order Total:</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Signature Amazon-style Amber "Place Your Order" Button */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isOrdering}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-full shadow-md shadow-amber-200 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <PackageCheck className="w-5 h-5 text-slate-950" />
                  <span>{isOrdering ? 'Placing Order...' : 'Place Your Order'}</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
