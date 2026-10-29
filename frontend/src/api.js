const BASE_URL = '/api';

export async function fetchProducts(category = '', search = '') {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);

  const res = await fetch(`${BASE_URL}/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function fetchProductDetail(productId) {
  const res = await fetch(`${BASE_URL}/products/${productId}`);
  if (!res.ok) throw new Error('Failed to load product detail');
  return res.json();
}

export async function submitReview(reviewData) {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit review');
  }
  return res.json();
}

export async function voteReviewHelpful(reviewId) {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/vote`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to register vote');
  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchModerationQueue(status = 'FLAGGED') {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.append('status', status);

  const res = await fetch(`${BASE_URL}/moderation/queue?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch moderation queue');
  return res.json();
}

export async function updateReviewStatus(reviewId, newStatus) {
  const res = await fetch(`${BASE_URL}/moderation/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  if (!res.ok) throw new Error('Failed to update review status');
  return res.json();
}

export async function fetchModerationStats() {
  const res = await fetch(`${BASE_URL}/moderation/stats`);
  if (!res.ok) throw new Error('Failed to fetch moderation stats');
  return res.json();
}
