import { useCart } from "../context/CartContext";

const Navbar = ({ onCartClick }) => {
  const { cartCount } = useCart();

  return (
    <header>
      <nav>
        <div className="logo">
          <img src="/images/logo.png" alt="Mistvale Tea Co." />
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#about">About</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="nav-actions">
          <button>Search</button>

          <button onClick={onCartClick}>
            Cart
            {cartCount > 0 && ` (${cartCount})`}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
