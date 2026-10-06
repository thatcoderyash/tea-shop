import { useState } from "react";
import { useCart } from "../context/CartContext";
import ProductModal from "./ProductModal";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <article className="product-card">
        <div className="product-image" onClick={() => setIsModalOpen(true)}>
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-info">
          <p className="product-category">{product.category}</p>

          <h3>{product.name}</h3>

          <p className="product-description">{product.description}</p>

          {product.rating && (
            <p>
              ⭐ {product.rating}
              {product.reviews && ` (${product.reviews})`}
            </p>
          )}

          <div className="product-bottom">
            <span className="product-price">₹{product.price}</span>

            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </article>

      {isModalOpen && (
        <ProductModal product={product} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

export default ProductCard;
