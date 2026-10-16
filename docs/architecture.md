# Mistvale Tea Co. Architecture

## 1. High-level request flow

```mermaid
flowchart TD
    Browser[Browser]
    React[React 19 + Vite]
    Controllers[Spring REST controllers]
    Security[Spring Security filter chain]
    Services[Service layer]
    Repositories[Spring Data JPA]
    PostgreSQL[(PostgreSQL)]

    Browser --> React
    React -->|HTTP JSON| Controllers
    Controllers --> Security
    Security --> Services
    Services --> Repositories
    Repositories --> PostgreSQL
    PostgreSQL --> Repositories
    Repositories --> Services
    Services --> Controllers
    Controllers -->|JSON response| React
```

## 2. Main backend layers

```mermaid
flowchart TB
    ProductController[ProductController]
    OrderController[OrderController]
    AdminAuthController[AdminAuthController]
    AdminOrderController[AdminOrderController]

    OrderService[OrderService]
    ProductRepository[ProductRepository]
    OrderRepository[OrderRepository]

    ProductEntity[Product entity]
    OrderEntity[Order entity]
    OrderItemEntity[OrderItem entity]

    ProductController --> ProductRepository
    OrderController --> OrderService
    AdminAuthController --> JwtService[JwtService]
    AdminOrderController --> OrderService
    OrderService --> ProductRepository
    OrderService --> OrderRepository
    ProductRepository --> ProductEntity
    OrderRepository --> OrderEntity
    OrderEntity --> OrderItemEntity
```

## 3. JWT admin authentication

```mermaid
sequenceDiagram
    actor Admin
    participant UI as React admin UI
    participant Auth as POST /api/auth/login
    participant JWT as JWT service
    participant API as Protected admin endpoint

    Admin->>UI: Enter username and password
    UI->>Auth: Submit login credentials
    Auth->>JWT: Validate credentials and issue token
    JWT-->>UI: Return access token
    UI->>API: Request with Authorization: Bearer token
    API->>API: Validate token and ADMIN role
    API-->>UI: Return authorized response or 401/403
```

## 4. Checkout flow

```mermaid
flowchart TD
    Start[Customer submits checkout] --> Validate[Validate request fields]
    Validate --> Items[Load products from database]
    Items --> Check[Check duplicate items, quantity limit and stock]
    Check --> Coupon{Coupon supplied?}
    Coupon -->|Yes| CouponRules[Validate WELCOME10 eligibility]
    Coupon -->|No| Totals[Calculate subtotal and shipping]
    CouponRules --> Totals
    Totals --> Inventory[Deduct inventory in transaction]
    Inventory --> Save[Save order and order items]
    Save --> Response[Return order response and tracking token]
```

## 5. Entity relationships

```mermaid
erDiagram
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        bigint id PK
        string customerName
        string email
        string phone
        string address
        string status
        decimal subtotal
        decimal discount
        decimal shipping
        decimal total
        datetime createdAt
        string trackingToken UK
    }
    ORDER_ITEM {
        bigint id PK
        bigint order_id FK
        bigint productId
        string productName
        decimal price
        int quantity
    }
    PRODUCT {
        bigint id PK
        string name
        string category
        decimal price
        int stock
        string description
    }
```

**Note:** `OrderItem` stores a product ID and a snapshot of the product's name and price. The current entity model does not declare a JPA relationship from `OrderItem` to `Product`; its JPA relationship is to `Order`.

## Important implementation notes

- The application uses stateless Spring Security with a JWT authentication filter.
- The configured admin user is created from environment-provided credentials and held in an in-memory user details manager. Admin accounts are not currently persisted in a database table.
- The current CORS configuration allows `http://localhost:5173`, which is suitable for local development.
- Inventory and order creation are handled in a transactional service method; the product repository includes a locked product lookup for checkout.
- These diagrams document the uploaded source snapshot. Update them when the implementation changes.
