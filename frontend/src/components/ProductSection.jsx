import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import API_BASE_URL from "../api";

function ProductSection({ searchTerm = "" }) {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("featured");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = ["All", "Black", "Green", "Herbal", "Gifts"];

  useEffect(() => {
    fetch(`${API_BASE_URL}8080/api/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load products. Please try again.");
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const search = searchTerm.trim().toLowerCase();

    const name = String(product.name ?? "").toLowerCase();
    const description = String(product.description ?? "").toLowerCase();
    const category = String(product.category ?? "").toLowerCase();

    const matchesSearch =
      !search ||
      name.includes(search) ||
      description.includes(search) ||
      category.includes(search);

    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price;

      case "price-high":
        return b.price - a.price;

      case "name-az":
        return a.name.localeCompare(b.name);

      case "name-za":
        return b.name.localeCompare(a.name);

      case "featured":
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <section id="shop" className="products-section">
        <div className="section-header">
          <p>OUR COLLECTION</p>
          <h2>Find Your Perfect Tea</h2>
          <p>Loading our teas...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="shop" className="products-section">
        <div className="section-header">
          <p>OUR COLLECTION</p>
          <h2>Find Your Perfect Tea</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="shop" className="products-section">
      <div className="section-header">
        <p>OUR COLLECTION</p>
        <h2>Find Your Perfect Tea</h2>
        <p>Explore our carefully selected collection of premium teas.</p>
      </div>

      <div className="product-toolbar">
        <div className="product-sort">
          <label htmlFor="sort-products">Sort by</label>

          <select
            id="sort-products"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-az">Name: A to Z</option>
            <option value="name-za">Name: Z to A</option>
          </select>
        </div>
      </div>

      <div className="product-filters">
        {categories.map((category) => (
          <button
            key={category}
            className={
              selectedCategory === category ? "filter-btn active" : "filter-btn"
            }
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {sortedProducts.length > 0 ? (
        <div className="products-grid">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="no-products">
          <h3>No teas found</h3>
          <p>Try a different search or category.</p>
        </div>
      )}
    </section>
  );
}

export default ProductSection;
