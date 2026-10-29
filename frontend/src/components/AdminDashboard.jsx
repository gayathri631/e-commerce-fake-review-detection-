import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Check,
  X,
  Eye,
  SlidersHorizontal,
  Store,
  Sparkles
} from 'lucide-react';
import { fetchModerationQueue, updateReviewStatus, fetchModerationStats } from '../api';

export default function AdminDashboard({ onStatsChanged, onBackToStore }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('FLAGGED');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [queueData, statsData] = await Promise.all([
        fetchModerationQueue(selectedFilter),
        fetchModerationStats()
      ]);
      setReviews(queueData);
      setStats(statsData);
      if (onStatsChanged) onStatsChanged(statsData.flagged_reviews);
    } catch (err) {
      console.error('Error loading moderation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFilter]);

  const handleModerate = async (reviewId, newStatus) => {
    setActionLoading({ ...actionLoading, [reviewId]: true });
    try {
      await updateReviewStatus(reviewId, newStatus);
      // Remove item from active view if filtering by FLAGGED
      setReviews(reviews.filter((r) => r.id !== reviewId));
      // Refresh stats
      const newStats = await fetchModerationStats();
      setStats(newStats);
      if (onStatsChanged) onStatsChanged(newStats.flagged_reviews);
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading({ ...actionLoading, [reviewId]: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16 font-sans">
      {/* Velmora Operations Top Bar */}
      <div className="bg-slate-950 text-white px-4 sm:px-8 lg:px-12 py-3.5 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back to Storefront</span>
            </button>
            <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  Velmora<span className="text-amber-400">.in</span>
                </span>
                <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[10px] font-black uppercase tracking-wider">
                  Operations Console
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Customer Content Moderation & Integrity Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8 space-y-6">
        
        {/* KPI Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Analyzed</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_reviews}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Reviews submitted across platform</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-amber-300 shadow-xs relative">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Moderation</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{stats.flagged_reviews}</p>
              <p className="text-[11px] text-amber-800 font-medium mt-0.5">Held from live storefront</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Approved Content</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{stats.approved_reviews}</p>
              <p className="text-[11px] text-emerald-800 font-medium mt-0.5">Currently active on product pages</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Off-Topic / Spam Blocked</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{stats.rejected_reviews}</p>
              <p className="text-[11px] text-rose-800 font-medium mt-0.5">Filtered out permanently</p>
            </div>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {[
            { label: 'Pending Verification (Action Required)', value: 'FLAGGED', count: stats?.flagged_reviews },
            { label: 'All Reviews', value: 'ALL', count: stats?.total_reviews },
            { label: 'Approved (Live on Store)', value: 'APPROVED', count: stats?.approved_reviews },
            { label: 'Rejected (Blocked)', value: 'REJECTED', count: stats?.rejected_reviews }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedFilter(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === tab.value
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedFilter === tab.value
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Queue List */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
            <p className="text-sm font-medium">Loading moderation queue...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 space-y-3 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-lg text-slate-900">Queue is Clear</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {selectedFilter === 'FLAGGED'
                ? 'All pending customer submissions have been processed. New flagged reviews will appear here automatically.'
                : 'No submissions found under this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => {
              const pred = (rev.ml_prediction || '').toUpperCase();
              const badgeStyle =
                pred === 'INAPPROPRIATE' || pred === 'ABUSIVE'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : pred === 'PROMOTIONAL_SPAM' || pred === 'SPAM'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : pred === 'IRRELEVANT' || pred === 'OFF_TOPIC_CHAT'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start justify-between gap-6"
                >
                  {/* Left: Review Content & Analysis */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Flag Tag */}
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border flex items-center gap-1 ${badgeStyle}`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{rev.ml_prediction}</span>
                      </span>

                      {/* Confidence Score */}
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Confidence: {Math.round((rev.ml_confidence || 0.95) * 100)}%
                      </span>

                      {/* Current Status */}
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Status: {rev.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-amber-700 truncate">
                      Product: {rev.product_title}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{rev.headline}</h4>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1 bg-slate-50 p-3.5 rounded-lg border border-slate-200 italic">
                        "{rev.body}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>User: <strong className="text-slate-800 capitalize">{rev.username}</strong></span>
                      <span>•</span>
                      <span>Rating: {rev.rating} ★</span>
                      <span>•</span>
                      <span>Verified Buyer: {rev.is_verified_purchase ? 'Yes' : 'No'}</span>
                    </div>

                    {/* AI System Reason */}
                    {rev.ml_flag_reason && (
                      <div className="text-xs text-rose-800 bg-rose-50/70 p-3 rounded-lg border border-rose-100 font-medium">
                        <strong>Integrity Engine Assessment:</strong> {rev.ml_flag_reason}
                      </div>
                    )}
                  </div>

                  {/* Right: Operations Actions */}
                  <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-48 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleModerate(rev.id, 'APPROVED')}
                      disabled={actionLoading[rev.id]}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve to Store</span>
                    </button>

                    <button
                      onClick={() => handleModerate(rev.id, 'REJECTED')}
                      disabled={actionLoading[rev.id]}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject & Block</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
