import { useCart } from "../context/CartContext";

function Navbar({ onCartClick }) {
  const { cartCount } = useCart();

  return (
    <header className="header">
      <div className="wrapper">
        <a className="brand" href="#home">
          <img src="/images/logo.png" alt="Mistvale Tea Co." />
        </a>

        <nav className="nav">
          <a href="#home" className="active">
            HOME
          </a>

          <a href="#shop">SHOP</a>

          <a href="#about">ABOUT</a>

          <a href="#contact">CONTACT</a>
        </nav>

        <div className="header-actions">
          <form
            className="search-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              className="search"
              type="search"
              placeholder="Search teas..."
            />
          </form>

          <button
            className="cart-icon"
            onClick={onCartClick}
            aria-label="Open shopping cart"
          >
            🛒
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
