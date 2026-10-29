from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str
    role: str = "customer"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# Review Schemas
class ReviewBase(BaseModel):
    rating: int
    headline: str
    body: str

class ReviewCreate(ReviewBase):
    product_id: int
    user_id: int

class ReviewUpdateStatus(BaseModel):
    status: str  # "APPROVED" or "REJECTED"

class ReviewResponse(ReviewBase):
    id: int
    product_id: int
    user_id: int
    username: Optional[str] = None
    product_title: Optional[str] = None
    is_verified_purchase: bool
    status: str
    ml_prediction: str
    ml_confidence: float
    ml_flag_reason: Optional[str] = None
    helpful_votes: int
    created_at: datetime
    moderated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Product Schemas
class ProductBase(BaseModel):
    title: str
    brand: str
    category: str
    price: float
    original_price: Optional[float] = None
    description: str
    image_url: str
    in_stock: bool = True

class ProductResponse(ProductBase):
    id: int
    rating_avg: float
    rating_count: int
    created_at: datetime
    reviews: List[ReviewResponse] = []

    class Config:
        from_attributes = True


# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class OrderCreate(BaseModel):
    user_id: int
    shipping_address: str
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_title: Optional[str] = None
    quantity: int
    price: float
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    shipping_address: str
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


# ML Inference Schema (Contract between Backend and Friends' ML Microservice)
class MLReviewPredictionRequest(BaseModel):
    review_text: str
    headline: Optional[str] = ""
    rating: int
    product_title: Optional[str] = None
    product_category: str

class MLReviewPredictionResponse(BaseModel):
    is_flagged: bool
    prediction_type: str  # "NORMAL", "IRRELEVANT", "PROMOTIONAL_SPAM", "INAPPROPRIATE"
    confidence: float
    flag_reason: Optional[str] = None
