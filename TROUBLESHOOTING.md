# Farm Marketplace - Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue 1: "Unable to load orders. Please try logging out and back in"

**Symptoms:**
- Orders page shows error message
- Error: "Unable to load orders. Please try logging out and back in."
- Console shows: `parsedUser.id is undefined`

**Root Cause:**
You're using an **old authentication token** that doesn't include the `id` field. The backend was updated to include the user ID in the auth response, but your browser still has the old token cached.

**Solution:**
```javascript
// Option 1: Use the logout button on the error page
Click "Logout & Login Again" button

// Option 2: Manual clear in browser console (F12)
localStorage.clear()
// Then refresh and login again

// Option 3: The Auth page now auto-clears old tokens
Just go to the login page (/) and it will auto-clear old tokens
```

**Prevention:**
The Auth page now automatically detects and clears old token formats, so this shouldn't happen again after you login once with the new system.

---

### Issue 2: Orders Page is Empty (No Error)

**Symptoms:**
- Page loads successfully
- Shows "No orders yet"
- No error messages

**Root Cause:**
No orders have been placed yet. This is **not a bug** - it's expected behavior.

**Solution:**
1. Login as a **buyer**
2. Go to **Products** page
3. Click on a product
4. **Place an order**
5. Go back to **My Orders**
6. ✅ Order now appears!

**Verification:**
```bash
# Check if orders exist in database
mysql -u root -p
USE farm_marketplace;
SELECT * FROM orders;
```

---

### Issue 3: Delivery/Tracking Page is Empty

**Symptoms:**
- Tracking page shows "No deliveries found"
- No error messages
- Orders exist but no deliveries

**Root Cause:**
Deliveries are **only created when an order is SHIPPED**. If all your orders are in PENDING or ACCEPTED status, there will be no deliveries yet.

**Solution:**
1. Login as **farmer**
2. Go to **Farmer Orders**
3. Find an order
4. Update status: PENDING → ACCEPTED → **SHIPPED**
5. ✅ Delivery is auto-created!
6. Logout → Login as **buyer**
7. Go to **Track Delivery**
8. ✅ Delivery now appears!

**Verification:**
```bash
# Check order status
SELECT id, status FROM orders;

# Check deliveries (should only exist for SHIPPED orders)
SELECT * FROM delivery;
```

---

### Issue 4: Backend Not Running / Connection Refused

**Symptoms:**
- All pages show errors
- Console: `ERR_CONNECTION_REFUSED`
- Network tab: Failed to fetch

**Root Cause:**
Backend server is not running on port 8080.

**Solution:**
```bash
# Check if backend is running
lsof -i :8080

# If not running, start it
cd backend
mvn spring-boot:run

# Wait for: "Started FarmMarketplaceApplication"
# Backend should be on: http://localhost:8080
```

**Verification:**
```bash
# Test backend is alive
curl http://localhost:8080/api/products

# Should return JSON array of products
```

---

### Issue 5: Frontend Not Running

**Symptoms:**
- Cannot access http://localhost:5173
- Browser shows "This site can't be reached"

**Solution:**
```bash
# Start frontend
cd frontend
npm run dev

# Should show:
# ➜  Local:   http://localhost:5173/
# Or another port if 5173 is busy
```

---

### Issue 6: Port Already in Use

**Symptoms:**
```
Error: Port 8080 was already in use
```

**Root Cause:**
Backend is already running from a previous session.

**Solution:**
```bash
# Option 1: Find and kill the process
lsof -i :8080
kill -9 <PID>

# Option 2: Use the existing running instance
# Just use the backend that's already running!

# Option 3: Change port in application.properties
server.port=8081
```

---

### Issue 7: 403 Forbidden Errors

**Symptoms:**
- API calls return 403
- Console: `Failed to load resource: 403`
- Error: "Access Denied" or "Forbidden"

**Root Cause:**
1. No authentication token
2. Invalid/expired token
3. Wrong user role for the endpoint

**Solution:**
```javascript
// Check if token exists
console.log(localStorage.getItem('token'));

// If null or undefined, login again
// If exists but getting 403, logout and login again
localStorage.clear();
// Then login
```

---

### Issue 8: Database Connection Error

**Symptoms:**
```
Error: Communications link failure
Unable to connect to MySQL
```

**Root Cause:**
MySQL server is not running or wrong credentials.

**Solution:**
```bash
# Start MySQL
brew services start mysql
# or
sudo systemctl start mysql

# Check connection
mysql -u root -p

# Verify database exists
SHOW DATABASES;
USE farm_marketplace;
```

**Check application.properties:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/farm_marketplace
spring.datasource.username=root
spring.datasource.password=your_password
```

---

### Issue 9: CORS Errors

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Root Cause:**
Frontend and backend on different origins without proper CORS config.

**Solution:**
Backend already has CORS configured in `CorsConfig.java`:
```java
allowedOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
```

If using different port, add it to the list.

---

### Issue 10: "You can only cancel your own orders" (Admin)

**Symptoms:**
- Admin tries to cancel order
- Error: "You can only cancel your own orders"

**Root Cause:**
Backend code was updated but server wasn't restarted.

**Solution:**
```bash
# Restart backend
cd backend
# Stop current process (Ctrl+C)
mvn spring-boot:run
```

The code now allows admins to cancel any order.

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console
```
Press F12 → Console tab
Look for red errors
Check Network tab for failed requests
```

### Step 2: Check Backend Logs
```
Look at terminal running mvn spring-boot:run
Check for errors or exceptions
Look for SQL queries to verify database calls
```

### Step 3: Verify Data Exists
```sql
-- Check users
SELECT id, email, role FROM users;

-- Check products
SELECT id, name, farmer_id, quantity FROM products;

-- Check orders
SELECT id, buyer_id, product_id, status FROM orders;

-- Check deliveries
SELECT id, order_id, delivery_status FROM delivery;

-- Check inventory
SELECT id, product_id, available_quantity FROM inventory;
```

### Step 4: Test API Endpoints
```bash
# Get products
curl http://localhost:8080/api/products

# Login (get token)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@test.com","password":"password123"}'

# Get orders (with token)
curl http://localhost:8080/api/orders/buyer/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🎯 Quick Fixes Checklist

When something doesn't work, try these in order:

- [ ] **Logout and login again** (fixes 80% of issues)
- [ ] **Check backend is running** on port 8080
- [ ] **Check frontend is running** on port 5173+
- [ ] **Clear browser cache** and localStorage
- [ ] **Check browser console** for errors
- [ ] **Verify database is running** and accessible
- [ ] **Restart backend** if code was changed
- [ ] **Check you're using the right user role**
- [ ] **Verify data exists** in database
- [ ] **Check network tab** for failed API calls

---

## 📊 Expected Behavior

### Orders Page
- **Empty**: No orders placed yet → Place an order
- **Error**: Old token or no user ID → Logout and login
- **Shows orders**: Working correctly! ✅

### Delivery Page
- **Empty**: No orders shipped yet → Ship an order
- **Error**: Old token or no user ID → Logout and login
- **Shows deliveries**: Working correctly! ✅

### Products Page
- **Empty**: No products created → Create a product
- **Shows products**: Working correctly! ✅

---

## 🆘 Still Having Issues?

### Check These Files:

**Backend:**
- `application.properties` - Database credentials
- `AuthService.java` - Returns user ID in auth response
- `OrderService.java` - Order operations
- `DeliveryService.java` - Delivery operations

**Frontend:**
- `api.js` - API base URL and interceptors
- `OrdersPage.jsx` - Orders display logic
- `BuyerTrackingPage.jsx` - Delivery tracking
- `Auth.jsx` - Auto-clears old tokens

### Environment Check:
```bash
# Java version
java -version  # Should be 17+

# Node version
node -v  # Should be 18+

# MySQL version
mysql --version  # Should be 8.0+

# Maven version
mvn -v  # Should be 3.6+
```

---

## ✅ Success Indicators

**You know everything is working when:**

1. ✅ Login returns token with user ID
2. ✅ Orders page shows orders after placing them
3. ✅ Deliveries appear after shipping orders
4. ✅ Inventory updates automatically
5. ✅ Admin can manage everything
6. ✅ No console errors
7. ✅ All API calls return 200 status
8. ✅ Database has data in all tables

---

## 🔧 Reset Everything (Nuclear Option)

If all else fails, complete reset:

```bash
# 1. Stop all servers
# Ctrl+C on backend and frontend terminals

# 2. Clear database
mysql -u root -p
DROP DATABASE farm_marketplace;
CREATE DATABASE farm_marketplace;
exit;

# 3. Clear browser data
# In browser: F12 → Application → Clear storage

# 4. Restart backend (recreates tables)
cd backend
mvn clean
mvn spring-boot:run

# 5. Restart frontend
cd frontend
rm -rf node_modules
npm install
npm run dev

# 6. Create fresh test data
# Register new users
# Create products
# Place orders
# Ship orders
```

---

## 📞 Contact & Support

**Check logs in:**
- Browser Console (F12)
- Backend Terminal
- MySQL logs

**Common log locations:**
- Backend: Terminal output
- Frontend: Browser DevTools
- Database: `/var/log/mysql/error.log`

**Happy Debugging! 🐛🔧**
