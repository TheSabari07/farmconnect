# FarmConnect - Farm Marketplace

An online marketplace platform connecting farmers directly with buyers. Built with Spring Boot backend and React frontend.

## Project Overview

FarmConnect is a full-stack web application that enables farmers to list their products and manage inventory, while buyers can browse products, place orders, and track deliveries. The platform includes role-based access control with three user types: Farmers, Buyers, and Admins.

## Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.4.11
- Spring Security with JWT authentication
- Spring Data JPA
- MySQL database
- Maven

**Frontend:**
- React 19
- React Router
- Axios
- Tailwind CSS
- Vite
- Leaflet for maps
- Lucide React (icons)
- Framer Motion (animations)
- Modern UI component library

## Features

- User authentication and authorization with JWT
- Role-based access control (Farmer, Buyer, Admin)
- Product management (CRUD operations)
- Inventory tracking and management
- Order placement and management
- Delivery tracking system
- Real-time stock availability checking
- Secure API endpoints
- Modern, responsive UI with professional design
- Smooth animations and transitions
- Skeleton loading states for better UX
- Mobile-friendly navigation with sidebar/drawer

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product (Farmer/Admin)
- `PUT /api/products/{id}` - Update product (Farmer/Admin)
- `DELETE /api/products/{id}` - Delete product (Farmer/Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/buyer/{buyerId}` - Get orders by buyer
- `GET /api/orders/farmer/{farmerId}` - Get orders by farmer
- `PUT /api/orders/{id}/status` - Update order status
- `DELETE /api/orders/{id}` - Cancel order

### Inventory
- `GET /api/inventory` - Get all inventory (Farmer/Admin)
- `GET /api/inventory/{productId}` - Get inventory for product
- `PUT /api/inventory/update/{productId}` - Update inventory (Farmer/Admin)
- `GET /api/inventory/{productId}/check` - Check stock availability
- `POST /api/inventory/sync/{productId}` - Sync inventory (Admin)

### Delivery
- `POST /api/delivery/{orderId}` - Create delivery (Farmer/Admin)
- `GET /api/delivery/{orderId}` - Get delivery by order ID
- `PUT /api/delivery/{orderId}/status` - Update delivery status (Farmer/Admin)
- `GET /api/delivery/tracking/{buyerId}` - Get deliveries for buyer
- `GET /api/delivery/farmer/{farmerId}` - Get deliveries for farmer (Farmer/Admin)
- `GET /api/delivery` - Get all deliveries (Admin)

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Node.js 16+ and npm

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create MySQL database:
```sql
CREATE DATABASE farm_marketplace;
```

3. Update database credentials in `src/main/resources/application.properties`:
```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

4. Build and run the backend:
```bash
./mvnw clean install
./mvnw spring-boot:run
```

Backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update API base URL in `.env` if needed:
```
VITE_API_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Default Configuration

- Backend Port: 8080
- Frontend Port: 5173
- Database: MySQL on localhost:3306
- JWT Token Expiration: 24 hours

## Project Structure

```
end-semester-project/
├── backend/          # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   └── pom.xml
└── frontend/         # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── ui/   # Reusable UI components
    │   │   └── ...
    │   ├── pages/
    │   ├── lib/
    │   └── ...
    ├── public/
    └── package.json
```

## UI/UX Enhancements

The frontend features a completely redesigned modern interface with:

- **Professional Design System**: Reusable UI components (Button, Card, Input, Badge, Alert, Skeleton)
- **Responsive Navigation**: Sidebar for desktop, drawer for mobile with smooth transitions
- **Modern Typography**: Inter font family for clean, professional appearance
- **Smooth Animations**: Page transitions, hover effects, and loading states
- **Enhanced Forms**: Icon-enhanced inputs with real-time validation feedback
- **Loading States**: Skeleton screens for better perceived performance
- **Color Palette**: Green gradient theme with semantic colors for different states
- **Accessibility**: Improved focus states and keyboard navigation
