import os
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from . import models, schemas, crud
from .seed_data import seed_database

# Create tables and auto-seed on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Velmora E-Commerce API with ML Review Moderation",
    description="Lightweight backend implementing Amazon & Myntra review architectures with off-topic chat/spam detection.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "E-Commerce Review Integrity API is running",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "database": "sqlite", "moderation_engine": "active"}

# --- USERS ---
@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return crud.get_users(db)

# --- PRODUCTS ---
@app.get("/api/products")
def get_products(
    category: Optional[str] = Query(None, description="Category filter"),
    search: Optional[str] = Query(None, description="Search keyword"),
    db: Session = Depends(get_db)
):
    products = crud.get_products(db, category=category, search=search)
    return products

@app.get("/api/products/{product_id}")
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get approved reviews for customers
    reviews = crud.get_product_reviews(db, product_id, include_all=False)
    
    # Compute rating star distribution (like Amazon 5-star breakdown)
    star_counts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
    for r in reviews:
        if 1 <= r["rating"] <= 5:
            star_counts[r["rating"]] += 1
            
    total_approved = len(reviews)
    star_percentages = {}
    for star, count in star_counts.items():
        star_percentages[star] = round((count / total_approved * 100), 1) if total_approved > 0 else 0.0

    return {
        "id": product.id,
        "title": product.title,
        "brand": product.brand,
        "category": product.category,
        "price": product.price,
        "original_price": product.original_price,
        "description": product.description,
        "image_url": product.image_url,
        "in_stock": product.in_stock,
        "rating_avg": product.rating_avg,
        "rating_count": product.rating_count,
        "star_breakdown": star_percentages,
        "reviews": reviews
    }

# --- REVIEWS ---
@app.post("/api/reviews")
async def submit_review(review_in: schemas.ReviewCreate, db: Session = Depends(get_db)):
    try:
        review = await crud.create_review(db, review_in)
        return {
            "message": "Review processed successfully",
            "review": {
                "id": review.id,
                "rating": review.rating,
                "headline": review.headline,
                "status": review.status,
                "is_verified_purchase": review.is_verified_purchase,
                "ml_prediction": review.ml_prediction,
                "ml_confidence": review.ml_confidence,
                "ml_flag_reason": review.ml_flag_reason
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@app.post("/api/reviews/{review_id}/vote")
def vote_helpful(review_id: int, db: Session = Depends(get_db)):
    review = crud.vote_helpful(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Helpful vote recorded", "helpful_votes": review.helpful_votes}

# --- ORDERS (MOCK CHECKOUT FOR VERIFIED PURCHASE BADGE) ---
@app.post("/api/orders", response_model=schemas.OrderResponse)
def create_order(order_in: schemas.OrderCreate, db: Session = Depends(get_db)):
    order = crud.create_order(db, order_in)
    return order

# --- STORE OWNER / ADMIN MODERATION ---
@app.get("/api/moderation/queue")
def get_moderation_queue(
    status: Optional[str] = Query("FLAGGED", description="Filter by review status: FLAGGED, APPROVED, REJECTED"),
    db: Session = Depends(get_db)
):
    return crud.get_moderation_queue(db, status=status)

@app.patch("/api/moderation/reviews/{review_id}")
def moderate_review(
    review_id: int,
    action: schemas.ReviewUpdateStatus,
    db: Session = Depends(get_db)
):
    if action.status not in ["APPROVED", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Status must be APPROVED or REJECTED")
    
    updated = crud.update_review_status(db, review_id, action.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": f"Review marked as {action.status}", "id": updated.id, "status": updated.status}

@app.get("/api/moderation/stats")
def get_moderation_stats(db: Session = Depends(get_db)):
    return crud.get_admin_metrics(db)
