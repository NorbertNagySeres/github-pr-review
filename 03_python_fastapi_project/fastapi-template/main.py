from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import Product, Cart, CartItem, create_tables, get_db


class ProductDTO(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int


class ProductCreate(BaseModel):
    name: str
    price: float
    description: str | None = None
    stock: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    stock: Optional[int] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    description: str | None = None
    stock: int
    available_stock: int = None  # Stock minus reserved items

    class Config:
        from_attributes = True


class CartItemRequest(BaseModel):
    product_id: int
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse]
    total_items: int
    total_price: float

    class Config:
        from_attributes = True


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_reserved_stock(db: AsyncSession, product_id: int) -> int:
    """Get total quantity reserved in all carts for a product"""
    result = await db.execute(
        select(CartItem.quantity).filter(CartItem.product_id == product_id)
    )
    quantities = result.scalars().all()
    return sum(quantities) if quantities else 0


async def get_available_stock(db: AsyncSession, product_id: int) -> int:
    """Get available stock (total stock - reserved in carts)"""
    product_result = await db.execute(select(Product.stock).filter(Product.id == product_id))
    total_stock = product_result.scalar_one_or_none()
    if total_stock is None:
        return 0
    
    reserved = await get_reserved_stock(db, product_id)
    return max(0, total_stock - reserved)


async def get_or_create_cart(db: AsyncSession, cart_id: str) -> Cart:
    """Get existing cart or create new one"""
    result = await db.execute(select(Cart).filter(Cart.id == cart_id))
    cart = result.scalar_one_or_none()
    
    if cart is None:
        cart = Cart(id=cart_id)
        db.add(cart)
        await db.flush()  # Get the ID without committing
    
    return cart


@app.post("/products/", response_model=ProductResponse)
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    db_product = Product(
        name=product.name,
        price=product.price,
        description=product.description,
        stock=product.stock
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@app.get("/products/", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product))
    products = result.scalars().all()
    
    # Add available stock information
    products_with_available_stock = []
    for product in products:
        available = await get_available_stock(db, product.id)
        product_dict = ProductResponse.model_validate(product).model_dump()
        product_dict['available_stock'] = available
        products_with_available_stock.append(ProductResponse(**product_dict))
    
    return products_with_available_stock


@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Add available stock information
    available = await get_available_stock(db, product.id)
    product_dict = ProductResponse.model_validate(product).model_dump()
    product_dict['available_stock'] = available
    
    return ProductResponse(**product_dict)


@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, product_update: ProductUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    return product


@app.delete("/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted successfully"}


# Cart endpoints
@app.get("/cart/{cart_id}", response_model=CartResponse)
async def get_cart(cart_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Cart).filter(Cart.id == cart_id)
    )
    cart = result.scalar_one_or_none()
    
    if cart is None:
        # Return empty cart
        return CartResponse(id=cart_id, items=[], total_items=0, total_price=0.0)
    
    # Load cart items with products
    cart_items_result = await db.execute(
        select(CartItem).filter(CartItem.cart_id == cart_id)
    )
    cart_items = cart_items_result.scalars().all()
    
    items_with_products = []
    total_price = 0.0
    total_items = 0
    
    for item in cart_items:
        product_result = await db.execute(select(Product).filter(Product.id == item.product_id))
        product = product_result.scalar_one()
        
        available = await get_available_stock(db, product.id)
        product_dict = ProductResponse.model_validate(product).model_dump()
        product_dict['available_stock'] = available
        product_response = ProductResponse(**product_dict)
        
        item_response = CartItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            product=product_response
        )
        items_with_products.append(item_response)
        total_price += product.price * item.quantity
        total_items += item.quantity
    
    return CartResponse(
        id=cart_id,
        items=items_with_products,
        total_items=total_items,
        total_price=total_price
    )


@app.post("/cart/{cart_id}/items")
async def add_to_cart(cart_id: str, item_request: CartItemRequest, db: AsyncSession = Depends(get_db)):
    # Check if product exists
    product_result = await db.execute(select(Product).filter(Product.id == item_request.product_id))
    product = product_result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check available stock
    available_stock = await get_available_stock(db, item_request.product_id)
    if item_request.quantity > available_stock:
        raise HTTPException(
            status_code=400, 
            detail=f"Not enough stock. Available: {available_stock}, Requested: {item_request.quantity}"
        )
    
    # Get or create cart
    cart = await get_or_create_cart(db, cart_id)
    
    # Check if item already exists in cart
    existing_item_result = await db.execute(
        select(CartItem).filter(
            CartItem.cart_id == cart_id,
            CartItem.product_id == item_request.product_id
        )
    )
    existing_item = existing_item_result.scalar_one_or_none()
    
    if existing_item:
        # Update existing item
        new_quantity = existing_item.quantity + item_request.quantity
        if new_quantity > available_stock + existing_item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough stock. Available: {available_stock + existing_item.quantity}, Requested: {new_quantity}"
            )
        existing_item.quantity = new_quantity
    else:
        # Add new item
        cart_item = CartItem(
            cart_id=cart_id,
            product_id=item_request.product_id,
            quantity=item_request.quantity
        )
        db.add(cart_item)
    
    await db.commit()
    return {"message": "Item added to cart successfully"}


@app.put("/cart/{cart_id}/items/{item_id}")
async def update_cart_item(
    cart_id: str, 
    item_id: int, 
    item_request: CartItemRequest, 
    db: AsyncSession = Depends(get_db)
):
    # Get cart item
    item_result = await db.execute(
        select(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart_id
        )
    )
    item = item_result.scalar_one_or_none()
    
    if item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if item_request.quantity <= 0:
        # Remove item
        await db.delete(item)
    else:
        # Check available stock (excluding current item's quantity)
        available_stock = await get_available_stock(db, item.product_id)
        available_stock += item.quantity  # Add back current quantity
        
        if item_request.quantity > available_stock:
            raise HTTPException(
                status_code=400, 
                detail=f"Not enough stock. Available: {available_stock}, Requested: {item_request.quantity}"
            )
        
        item.quantity = item_request.quantity
    
    await db.commit()
    return {"message": "Cart item updated successfully"}


@app.delete("/cart/{cart_id}/items/{item_id}")
async def remove_from_cart(cart_id: str, item_id: int, db: AsyncSession = Depends(get_db)):
    item_result = await db.execute(
        select(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart_id
        )
    )
    item = item_result.scalar_one_or_none()
    
    if item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    await db.delete(item)
    await db.commit()
    return {"message": "Item removed from cart successfully"}


@app.delete("/cart/{cart_id}")
async def clear_cart(cart_id: str, db: AsyncSession = Depends(get_db)):
    cart_result = await db.execute(select(Cart).filter(Cart.id == cart_id))
    cart = cart_result.scalar_one_or_none()
    
    if cart is None:
        return {"message": "Cart not found or already empty"}
    
    await db.delete(cart)  # Cascade will delete cart items
    await db.commit()
    return {"message": "Cart cleared successfully"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
