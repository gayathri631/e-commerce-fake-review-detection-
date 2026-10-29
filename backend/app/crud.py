from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from . import models, schemas
from .ml_client import score_review_with_ml

# --- User CRUD ---
def get_or_create_user(db: Session, username: str, email: str, role: str = "customer") -> models.User:
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        user = models.User(username=username, email=email, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_users(db: Session) -> List[models.User]:
    return db.query(models.User).all()


# --- Product CRUD ---
def get_products(db: Session, category: Optional[str] = None, search: Optional[str] = None) -> List[models.Product]:
    query = db.query(models.Product)
    if category and category.lower() != "all":
        query = query.filter(models.Product.category.ilike(category))
    if search:
        query = query.filter(
            (models.Product.title.ilike(f"%{search}%")) |
            (models.Product.brand.ilike(f"%{search}%")) |
            (models.Product.description.ilike(f"%{search}%"))
        )
    return query.all()

def get_product(db: Session, product_id: int) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def recalculate_product_ratings(db: Session, product_id: int):
    """Calculates average rating and review count from APPROVED reviews only."""
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        return

    approved_reviews = db.query(models.Review).filter(
        models.Review.product_id == product_id,
        models.Review.status == "APPROVED"
    ).all()

    if approved_reviews:
        product.rating_count = len(approved_reviews)
        product.rating_avg = round(sum(r.rating for r in approved_reviews) / len(approved_reviews), 1)
    else:
        product.rating_count = 0
        product.rating_avg = 0.0

    db.commit()
    db.refresh(product)


# --- Order CRUD (Verified Purchase simulation) ---
def create_order(db: Session, order_in: schemas.OrderCreate) -> models.Order:
    total = 0.0
    order_items = []
    
    for item in order_in.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            item_total = product.price * item.quantity
            total += item_total
            order_items.append(
                models.OrderItem(product_id=product.id, quantity=item.quantity, price=product.price)
            )

    order = models.Order(
        user_id=order_in.user_id,
        total_amount=round(total, 2),
        status="DELIVERED",  # Delivered grants Verified Purchase badge
        shipping_address=order_in.shipping_address,
        items=order_items
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

def is_verified_purchaser(db: Session, user_id: int, product_id: int) -> bool:
    """Checks if the user has a delivered order for this product."""
    match = db.query(models.OrderItem).join(models.Order).filter(
        models.Order.user_id == user_id,
        models.OrderItem.product_id == product_id,
        models.Order.status == "DELIVERED"
    ).first()
    return match is not None


# --- Review CRUD with ML Detection ---
async def create_review(db: Session, review_in: schemas.ReviewCreate) -> models.Review:
    product = db.query(models.Product).filter(models.Product.id == review_in.product_id).first()
    if not product:
        raise ValueError("Product not found")

    verified = is_verified_purchaser(db, review_in.user_id, review_in.product_id)

    # Dispatch to ML review analysis
    ml_result = await score_review_with_ml(
        review_text=review_in.body,
        headline=review_in.headline,
        rating=review_in.rating,
        product_title=product.title,
        product_category=product.category
    )

    is_flagged = ml_result.get("is_flagged", False)
    status = "FLAGGED" if is_flagged else "APPROVED"

    review = models.Review(
        product_id=review_in.product_id,
        user_id=review_in.user_id,
        rating=review_in.rating,
        headline=review_in.headline,
        body=review_in.body,
        is_verified_purchase=verified,
        status=status,
        ml_prediction=ml_result.get("prediction_type", "NORMAL"),
        ml_confidence=ml_result.get("confidence", 0.95),
        ml_flag_reason=ml_result.get("flag_reason"),
        helpful_votes=0
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Only update product rating if review was approved
    if status == "APPROVED":
        recalculate_product_ratings(db, review.product_id)

    return review

def get_product_reviews(db: Session, product_id: int, include_all: bool = False) -> List[Dict[str, Any]]:
    """Returns approved reviews for customers, or all reviews if include_all is True."""
    query = db.query(models.Review).filter(models.Review.product_id == product_id)
    if not include_all:
        query = query.filter(models.Review.status == "APPROVED")
    
    reviews = query.order_by(models.Review.created_at.desc()).all()
    result = []
    for r in reviews:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "product_id": r.product_id,
            "user_id": r.user_id,
            "username": user.username if user else "Shopper",
            "rating": r.rating,
            "headline": r.headline,
            "body": r.body,
            "is_verified_purchase": r.is_verified_purchase,
            "status": r.status,
            "ml_prediction": r.ml_prediction,
            "ml_confidence": r.ml_confidence,
            "ml_flag_reason": r.ml_flag_reason,
            "helpful_votes": r.helpful_votes,
            "created_at": r.created_at,
            "moderated_at": r.moderated_at
        })
    return result

def get_moderation_queue(db: Session, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Returns reviews for store owner moderation (defaults to FLAGGED)."""
    query = db.query(models.Review)
    if status:
        query = query.filter(models.Review.status == status)
    else:
        query = query.filter(models.Review.status == "FLAGGED")

    reviews = query.order_by(models.Review.created_at.desc()).all()
    result = []
    for r in reviews:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        prod = db.query(models.Product).filter(models.Product.id == r.product_id).first()
        result.append({
            "id": r.id,
            "product_id": r.product_id,
            "product_title": prod.title if prod else "Unknown Product",
            "user_id": r.user_id,
            "username": user.username if user else "Shopper",
            "rating": r.rating,
            "headline": r.headline,
            "body": r.body,
            "is_verified_purchase": r.is_verified_purchase,
            "status": r.status,
            "ml_prediction": r.ml_prediction,
            "ml_confidence": r.ml_confidence,
            "ml_flag_reason": r.ml_flag_reason,
            "helpful_votes": r.helpful_votes,
            "created_at": r.created_at,
            "moderated_at": r.moderated_at
        })
    return result

def update_review_status(db: Session, review_id: int, new_status: str) -> Optional[models.Review]:
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        return None
    
    review.status = new_status
    review.moderated_at = datetime.utcnow()
    db.commit()
    db.refresh(review)

    # Recalculate product rating to reflect approval or rejection
    recalculate_product_ratings(db, review.product_id)
    return review

def vote_helpful(db: Session, review_id: int) -> Optional[models.Review]:
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        return None
    review.helpful_votes += 1
    db.commit()
    db.refresh(review)
    return review

def get_admin_metrics(db: Session) -> Dict[str, Any]:
    total_products = db.query(models.Product).count()
    total_orders = db.query(models.Order).count()
    total_reviews = db.query(models.Review).count()
    approved_reviews = db.query(models.Review).filter(models.Review.status == "APPROVED").count()
    flagged_reviews = db.query(models.Review).filter(models.Review.status == "FLAGGED").count()
    rejected_reviews = db.query(models.Review).filter(models.Review.status == "REJECTED").count()
    
    # ML categorization stats
    chat_reviews = db.query(models.Review).filter(models.Review.ml_prediction == "OFF_TOPIC_CHAT").count()
    spam_reviews = db.query(models.Review).filter(models.Review.ml_prediction == "SPAM").count()
    genuine_reviews = db.query(models.Review).filter(models.Review.ml_prediction == "GENUINE").count()

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_reviews": total_reviews,
        "approved_reviews": approved_reviews,
        "flagged_reviews": flagged_reviews,
        "rejected_reviews": rejected_reviews,
        "detection_breakdown": {
            "genuine": genuine_reviews,
            "off_topic_chat": chat_reviews,
            "spam": spam_reviews
        }
    }
