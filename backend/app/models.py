from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="customer")  # "customer" or "owner"
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="user")
    orders = relationship("Order", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    brand = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=False)
    in_stock = Column(Boolean, default=True)
    rating_avg = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="DELIVERED")  # "PLACED", "SHIPPED", "DELIVERED"
    shipping_address = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    headline = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    is_verified_purchase = Column(Boolean, default=False)
    
    # Review moderation status
    # "APPROVED" -> Visible to customers
    # "FLAGGED"  -> Off-topic / chat / spam caught by ML, waiting for store owner review
    # "REJECTED" -> Blocked by store owner
    status = Column(String, default="APPROVED", index=True)
    
    # ML detection metrics
    ml_prediction = Column(String, default="GENUINE")  # "GENUINE", "OFF_TOPIC_CHAT", "SPAM", "PROMOTIONAL"
    ml_confidence = Column(Float, default=0.95)
    ml_flag_reason = Column(String, nullable=True)

    helpful_votes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    moderated_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
