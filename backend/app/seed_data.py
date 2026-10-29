from sqlalchemy.orm import Session
from . import models, database

def seed_database(db: Session):
    # Check if already seeded with at least 25 products
    count = db.query(models.Product).count()
    if count >= 25:
        return

    # Clear existing products/orders/reviews to ensure fresh catalog
    if count > 0:
        db.query(models.Review).delete()
        db.query(models.OrderItem).delete()
        db.query(models.Order).delete()
        db.query(models.Product).delete()
        db.query(models.User).delete()
        db.commit()

    print("[Velmora Catalog Engine] Initializing enterprise catalog with 25 diverse products...")

    # 1. Accounts
    user1 = models.User(username="rahul_sharma", email="rahul.sharma@velmora.com", role="customer")
    user2 = models.User(username="priya_patel", email="priya.patel@velmora.com", role="customer")
    user3 = models.User(username="arjun_v", email="arjun.v@velmora.com", role="customer")
    user_owner = models.User(username="admin_operations", email="ops@velmora.com", role="owner")
    
    db.add_all([user1, user2, user3, user_owner])
    db.commit()
    db.refresh(user1)
    db.refresh(user2)
    db.refresh(user3)
    db.refresh(user_owner)

    # 2. Enterprise Products Catalog (25 High-Quality Products)
    products = [
        # Electronics
        models.Product(
            title="Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
            brand="Sony",
            category="Electronics",
            price=26990.0,
            original_price=34990.0,
            description="Industry-leading noise canceling with dual processors and 8 microphones. Up to 30-hour battery life with quick charging. Crystal clear hands-free calling with beamforming microphones.",
            image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Apple iPhone 15 Pro (128 GB) - Natural Titanium",
            brand="Apple",
            category="Electronics",
            price=127990.0,
            original_price=134900.0,
            description="Forged in titanium with industry-leading A17 Pro chip. 48MP main camera with multiple focal lengths, customizable Action button, and USB-C with USB 3 speeds.",
            image_url="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Apple iPad 10th Gen 10.9-inch Liquid Retina Display",
            brand="Apple",
            category="Electronics",
            price=34900.0,
            original_price=39900.0,
            description="Striking 10.9-inch Liquid Retina display with True Tone. A14 Bionic chip with 6-core CPU and 4-core GPU. 12MP Ultra Wide front camera with Center Stage. Touch ID for secure authentication.",
            image_url="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Samsung Galaxy S24 Ultra 5G AI Smartphone",
            brand="Samsung",
            category="Electronics",
            price=119999.0,
            original_price=134999.0,
            description="Titanium exterior, 6.8-inch Dynamic AMOLED 2X flat display with Corning Gorilla Armor. Galaxy AI features Live Translate, Circle to Search, and 200MP Quad Telephoto zoom.",
            image_url="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="boAt Airdopes 141 Bluetooth Truly Wireless Earbuds",
            brand="boAt",
            category="Electronics",
            price=1299.0,
            original_price=4490.0,
            description="42H playtime, Beast Mode for low latency audio, ENx Tech for clear calls, ASAP Charge: 5 mins = 75 mins playtime, IPX4 water resistance.",
            image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="JBL Flip 6 Portable Waterproof Bluetooth Speaker",
            brand="JBL",
            category="Electronics",
            price=8999.0,
            original_price=13999.0,
            description="Louder, more powerful sound with 2-way speaker system. IP67 waterproof and dustproof design. Up to 12 hours of playtime on a single charge. PartyBoost compatible.",
            image_url="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Noise ColorFit Pulse 3 AMOLED Smartwatch",
            brand="Noise",
            category="Electronics",
            price=1999.0,
            original_price=4999.0,
            description="1.96-inch HD display, 550 nits peak brightness, Bluetooth calling, 100+ sports modes, 7-day battery life, and IP68 water resistance rating.",
            image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Fastrack Limitless FS1 Pro 1.96 AMOLED Smartwatch",
            brand="Fastrack",
            category="Electronics",
            price=2999.0,
            original_price=7995.0,
            description="UltraVU 1.96-inch curved AMOLED display with 410x502 resolution. SingleSync Bluetooth calling with functional crown navigation and 110+ sports trackers.",
            image_url="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80",
            in_stock=True
        ),

        # Footwear
        models.Product(
            title="Nike Air Zoom Pegasus 40 Road Running Shoes",
            brand="Nike",
            category="Footwear",
            price=8495.0,
            original_price=11495.0,
            description="Responsive cushioning in the Pegasus provides an energized ride for everyday road running. Experience lighter-weight energy return with dual Zoom Air units and a React foam midsole.",
            image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Nike Air Force 1 '07 All-White Classic Sneakers",
            brand="Nike",
            category="Footwear",
            price=7495.0,
            original_price=9995.0,
            description="The radiance lives on with the b-ball OG. Crossing hardwood comfort with off-court flair, stitched overlays, bold details, and the legendary Nike Air cushioning.",
            image_url="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Adidas Ultraboost Light Performance Running Shoes",
            brand="Adidas",
            category="Footwear",
            price=11999.0,
            original_price=18999.0,
            description="Experience epic energy with the lightest Ultraboost yet. The Linear Energy Push system on the outsole boosts stability for an ultra-responsive stride.",
            image_url="https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Adidas Originals Stan Smith Classic Leather Shoes",
            brand="Adidas",
            category="Footwear",
            price=6999.0,
            original_price=8999.0,
            description="Timeless silhouette crafted from high-grade synthetic leather with perforated 3-Stripes and the signature Stan Smith green heel tab.",
            image_url="https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Puma Men Dazzler Classic Low-Top Sneakers",
            brand="Puma",
            category="Footwear",
            price=2199.0,
            original_price=4499.0,
            description="Clean leather-look upper with signature Puma formstrip. SoftFoam+ sockliner provides superior cushioning and optimal comfort for every step of your day.",
            image_url="https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Puma Velocity Nitro 2 Lightweight Road Running Shoes",
            brand="Puma",
            category="Footwear",
            price=5499.0,
            original_price=9999.0,
            description="An all-in-one neutral running shoe for any distance. The Velocity Nitro 2 is a lightweight, responsive update featuring Nitro foam for exceptional cushioning.",
            image_url="https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
            in_stock=True
        ),

        # Fashion & Apparel
        models.Product(
            title="Roadster Men Solid Pure Cotton Casual Shirt",
            brand="Roadster",
            category="Fashion",
            price=899.0,
            original_price=1799.0,
            description="Navy blue solid casual shirt, spread collar, long sleeves, button placket, curved hem, and one patch pocket. 100% breathable combed cotton.",
            image_url="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Levi's Men 511 Slim Fit Mid Rise Stretch Jeans",
            brand="Levi's",
            category="Fashion",
            price=2499.0,
            original_price=3999.0,
            description="Classic blue wash 511 slim fit jeans. Sits below the waist with a slim leg from hip to ankle. Crafted with Levi's Flex stretch denim for maximum comfort.",
            image_url="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Levi's The Original Denim Trucker Jacket",
            brand="Levi's",
            category="Fashion",
            price=4199.0,
            original_price=5999.0,
            description="The original jean jacket since 1967. A blank canvas for self-expression, designed with classic metal shank buttons and tapered V-stitches.",
            image_url="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Allen Solly Men Premium Textured Regular Fit Formal Shirt",
            brand="Allen Solly",
            category="Fashion",
            price=1499.0,
            original_price=2299.0,
            description="Crisp white regular fit textured formal shirt crafted from 100% luxury long-staple cotton. Features an Italian cutaway collar and reinforced pearl buttons.",
            image_url="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Allen Solly Men Classic Flat-Front Slim Fit Formal Trousers",
            brand="Allen Solly",
            category="Fashion",
            price=1899.0,
            original_price=2899.0,
            description="Tailored charcoal grey flat-front trousers with wrinkle-resistant stretch blend, slash pockets, and comfortable flex waistband.",
            image_url="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
            in_stock=True
        ),

        # Home & Kitchen
        models.Product(
            title="Philips Digital Air Fryer HD9252 with Rapid Air Technology",
            brand="Philips",
            category="Home & Kitchen",
            price=7999.0,
            original_price=11995.0,
            description="Healthy frying with Rapid Air technology. 90% less fat, 7 pre-set cooking programs, touch screen display, and dishwasher-safe removable parts.",
            image_url="https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Nespresso Vertuo Pop Espresso and Coffee Maker",
            brand="Nespresso",
            category="Home & Kitchen",
            price=14999.0,
            original_price=19999.0,
            description="Centrifusion extraction technology reads barcode on each capsule to brew five cup sizes from espresso to alto with velvety crema.",
            image_url="https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Dyson V8 Absolute Cord-Free Cordless Vacuum Cleaner",
            brand="Dyson",
            category="Home & Kitchen",
            price=29900.0,
            original_price=39900.0,
            description="Deep cleaning across carpets and hard floors with up to 40 minutes of fade-free suction. Engineered for homes with pets, advanced whole-machine filtration.",
            image_url="https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80",
            in_stock=True
        ),

        # Gaming & Accessories
        models.Product(
            title="Sony PlayStation 5 Slim Console (Disc Edition)",
            brand="Sony",
            category="Gaming",
            price=44990.0,
            original_price=54990.0,
            description="Experience lightning-fast loading with an ultra-high speed 1TB SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.",
            image_url="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Logitech MX Master 3S Wireless Performance Mouse",
            brand="Logitech",
            category="Gaming",
            price=8995.0,
            original_price=10995.0,
            description="Quiet clicks with 8K DPI any-surface tracking including glass. MagSpeed electromagnetic scrolling for 1,000 lines per second speed and precision.",
            image_url="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
            in_stock=True
        ),
        models.Product(
            title="Razer BlackWidow V4 Mechanical RGB Gaming Keyboard",
            brand="Razer",
            category="Gaming",
            price=12499.0,
            original_price=16999.0,
            description="Green mechanical tactile clicky switches with 2-side underglow and per-key RGB lighting. Multi-function roller and 4 dedicated media keys with plush wrist rest.",
            image_url="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
            in_stock=True
        )
    ]

    db.add_all(products)
    db.commit()
    for p in products:
        db.refresh(p)

    # 3. Create Verified Orders for Rahul (user1) and Priya (user2)
    order1 = models.Order(
        user_id=user1.id,
        total_amount=26990.0,
        status="DELIVERED",
        shipping_address="Plot 42, HSR Layout, Sector 2, Bengaluru, Karnataka",
        items=[
            models.OrderItem(product_id=products[0].id, quantity=1, price=26990.0),
            models.OrderItem(product_id=products[4].id, quantity=1, price=1299.0)
        ]
    )
    order2 = models.Order(
        user_id=user2.id,
        total_amount=15494.0,
        status="DELIVERED",
        shipping_address="B-12, Sector 62, Noida, Uttar Pradesh",
        items=[
            models.OrderItem(product_id=products[8].id, quantity=1, price=8495.0),
            models.OrderItem(product_id=products[11].id, quantity=1, price=6999.0)
        ]
    )
    db.add_all([order1, order2])
    db.commit()

    # 4. Initial Product Reviews
    # Review 1: Genuine Positive (Approved, Verified Purchase)
    rev1 = models.Review(
        product_id=products[0].id,
        user_id=user1.id,
        rating=5,
        headline="Outstanding noise cancellation and sound clarity",
        body="The ANC on these Sony headphones is exceptional. Completely cuts out traffic and ambient office noise. Highs and mids are crisp with tight, responsive bass.",
        is_verified_purchase=True,
        status="APPROVED",
        ml_prediction="GENUINE",
        ml_confidence=0.98,
        ml_flag_reason=None,
        helpful_votes=24
    )

    # Review 2: Genuine Critical Negative (Approved - Proves legitimate negative feedback is preserved!)
    rev2 = models.Review(
        product_id=products[0].id,
        user_id=user2.id,
        rating=2,
        headline="Ear cushions get warm after extended use",
        body="Audio quality is great, but the synthetic leather ear cushions cause heat buildup after 45 minutes of continuous use in warm rooms. Expected better breathability at this price point.",
        is_verified_purchase=False,
        status="APPROVED",
        ml_prediction="GENUINE",
        ml_confidence=0.96,
        ml_flag_reason=None,
        helpful_votes=12
    )

    # Review 3: Off-Topic Conversational Chatter (FLAGGED for Admin Moderation)
    rev3 = models.Review(
        product_id=products[0].id,
        user_id=user3.id,
        rating=5,
        headline="Anyone selling secondhand camera gear?",
        body="Hey guys does anyone have a used DSLR or Sony lens for sale in Bangalore? Ping me on WhatsApp or DM on Instagram @tech_guy99 lol",
        is_verified_purchase=False,
        status="FLAGGED",
        ml_prediction="OFF_TOPIC_CHAT",
        ml_confidence=0.95,
        ml_flag_reason="Conversational social chatter detected. Content does not evaluate product features or specifications.",
        helpful_votes=0
    )

    # Review 4: Promotional Spam / Scam (FLAGGED for Admin Moderation)
    rev4 = models.Review(
        product_id=products[8].id,
        user_id=user3.id,
        rating=5,
        headline="Claim 5000 Cashback Bonus",
        body="Earn daily rewards and cashback vouchers! Visit www.reward-promotions-daily.biz or join telegram @freevouchers today. 100% verified payout.",
        is_verified_purchase=False,
        status="FLAGGED",
        ml_prediction="SPAM",
        ml_confidence=0.99,
        ml_flag_reason="Promotional solicitation / external URLs detected.",
        helpful_votes=0
    )

    # Review 5: Genuine Product Review for Running Shoes (Approved)
    rev5 = models.Review(
        product_id=products[8].id,
        user_id=user2.id,
        rating=5,
        headline="Excellent arch support and shock absorption",
        body="Ran several 10K sessions in these Pegasus 40s. Cushioning is responsive and impact on knees is noticeably reduced. True to size fit.",
        is_verified_purchase=True,
        status="APPROVED",
        ml_prediction="GENUINE",
        ml_confidence=0.98,
        ml_flag_reason=None,
        helpful_votes=15
    )

    # Review 6: Genuine Review for iPhone 15 Pro
    rev6 = models.Review(
        product_id=products[1].id,
        user_id=user1.id,
        rating=5,
        headline="Titanium finish feels incredibly lightweight",
        body="Upgraded from the 12 Pro. The weight reduction with titanium is instantly noticeable. The camera zoom and Action Button shortcuts are super handy.",
        is_verified_purchase=True,
        status="APPROVED",
        ml_prediction="GENUINE",
        ml_confidence=0.99,
        ml_flag_reason=None,
        helpful_votes=19
    )

    # Review 7: Genuine Review for iPad
    rev7 = models.Review(
        product_id=products[2].id,
        user_id=user2.id,
        rating=5,
        headline="Silky smooth performance and gorgeous display",
        body="The 10.9-inch Liquid Retina screen is breathtaking for watching media and taking notes. The A14 Bionic chip handles multi-tasking without any lag.",
        is_verified_purchase=False,
        status="APPROVED",
        ml_prediction="GENUINE",
        ml_confidence=0.97,
        ml_flag_reason=None,
        helpful_votes=8
    )

    # Review 8: Off-topic spam on iPad (FLAGGED for Admin)
    rev8 = models.Review(
        product_id=products[2].id,
        user_id=user3.id,
        rating=1,
        headline="Join our crypto signals group",
        body="Trade bitcoin with 99% accuracy! Contact us on WhatsApp +919876543210 or search telegram crypto_king. Free signals everyday!",
        is_verified_purchase=False,
        status="FLAGGED",
        ml_prediction="SPAM",
        ml_confidence=0.99,
        ml_flag_reason="Contains external contact numbers, telegram handles, and promotional spam.",
        helpful_votes=0
    )

    # Review 9: Genuine Review for Philips Air Fryer
    rev9 = models.Review(
        product_id=products[19].id,
        user_id=user2.id,
        rating=5,
        headline="Crispy french fries with almost zero oil!",
        body="Made sweet potato fries and grilled chicken wings. Super easy cleanup, basket is truly non-stick and doesn't smoke up the kitchen.",
        is_verified_purchase=False,
        status="APPROVED",
        ml_prediction="GENUINE",
        ml_confidence=0.98,
        ml_flag_reason=None,
        helpful_votes=14
    )

    # Review 10: Genuine Review for PS5 Slim
    rev10 = models.Review(
        product_id=products[22].id,
        user_id=user1.id,
        rating=5,
        headline="Phenomenal load speeds and sleek form factor",
        body="Loads Spider-Man 2 in 2 seconds. The slim model takes significantly less desk space and runs whisper quiet even during intensive 4K 60fps gameplay.",
        is_verified_purchase=False,
        status="APPROVED",
        ml_prediction="GENUINE",
        ml_confidence=0.99,
        ml_flag_reason=None,
        helpful_votes=31
    )

    all_revs = [rev1, rev2, rev3, rev4, rev5, rev6, rev7, rev8, rev9, rev10]
    db.add_all(all_revs)
    db.commit()

    # Calculate ratings for all products
    for p in products:
        approved = [r for r in all_revs if r.product_id == p.id and r.status == "APPROVED"]
        if approved:
            p.rating_count = len(approved)
            p.rating_avg = round(sum(r.rating for r in approved) / len(approved), 1)
        else:
            # Add reasonable default ratings for catalogue browsing experience
            p.rating_count = 12 + (p.id % 45)
            p.rating_avg = round(4.2 + ((p.id * 7) % 7) * 0.1, 1)

    db.commit()
    print("[Velmora Catalog Engine] Database initialized with 25 verified products and reviews.")
