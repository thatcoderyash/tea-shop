import { useState } from "react";
import { useCart } from "../context/CartContext";

function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return null;
  }

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="product-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close product details"
        >
          ×
        </button>

        <div className="modal-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="modal-content">
          <p className="product-category">{product.category}</p>

          <h2>{product.name}</h2>

          {product.rating && (
            <p className="modal-rating">
              ⭐ {product.rating}
              {product.reviews && ` (${product.reviews} reviews)`}
            </p>
          )}

          <p className="modal-description">{product.description}</p>

          <p className="modal-price">₹{product.price}</p>

          <p className="modal-stock">
            {isOutOfStock ? "Out of stock" : `${product.stock} available`}
          </p>

          {!isOutOfStock && (
            <>
              <div className="modal-quantity">
                <button
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(product.stock, current + 1),
                    )
                  }
                >
                  +
                </button>
              </div>

              <button className="modal-add-btn" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
