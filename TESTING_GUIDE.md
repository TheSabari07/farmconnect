# Farm Marketplace - Complete Testing Guide

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on: `http://localhost:8080`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 👥 Test Users

### Create Test Accounts

**Farmer Account:**
- Email: `farmer@test.com`
- Password: `password123`
- Role: FARMER

**Buyer Account:**
- Email: `buyer@test.com`
- Password: `password123`
- Role: BUYER

**Admin Account:**
- Email: `admin@test.com`
- Password: `password123`
- Role: ADMIN

---

## 📋 Complete Testing Flow

### **STEP 1: Farmer - Create Products**

1. **Login as Farmer** (`farmer@test.com`)
2. **Go to Products** → Click "Add New Product"
3. **Create Product:**
   - Name: `Organic Tomatoes`
   - Description: `Fresh organic tomatoes`
   - Price: `5.00`
   - Quantity: `50`
   - Location: `Farm Valley`
4. **Click "Add Product"**
5. ✅ Product created with inventory automatically initialized

**Expected Result:**
- Product appears in product list
- Inventory shows 50 units available
- Product visible to all users

---

### **STEP 2: Buyer - Place Order**

1. **Logout** → **Login as Buyer** (`buyer@test.com`)
2. **Go to Products** → Browse available products
3. **Click on "Organic Tomatoes"** → View details
4. **Place Order:**
   - Quantity: `5`
   - Click "Place Order"
5. ✅ Order created with status: PENDING

**Expected Result:**
- Order appears in "My Orders" page
- Order status: PENDING (yellow badge)
- Inventory automatically decreased: 50 → 45
- Cancel button visible (can cancel PENDING orders)

**Why Orders Page Shows Data:**
- Orders are created immediately when buyer places order
- No need to wait for shipping
- Should see orders right away

---

### **STEP 3: Farmer - Accept Order**

1. **Logout** → **Login as Farmer** (`farmer@test.com`)
2. **Go to "Farmer Orders"**
3. **Find the order** from buyer
4. **Update Status:**
   - Change dropdown: PENDING → ACCEPTED
5. ✅ Order status updated

**Expected Result:**
- Order status: ACCEPTED (blue badge)
- Buyer sees updated status in "My Orders"

---

### **STEP 4: Farmer - Ship Order (Creates Delivery)**

1. **Still as Farmer** in "Farmer Orders"
2. **Update Status:**
   - Change dropdown: ACCEPTED → SHIPPED
3. ✅ **Delivery automatically created!**

**Expected Result:**
- Order status: SHIPPED (purple badge)
- **Delivery record created** with status: PENDING
- Buyer can now see delivery in "Track Delivery" page
- Farmer can see delivery in "Deliveries" page

**Why Delivery Pages NOW Show Data:**
- Deliveries are ONLY created when order is SHIPPED
- Before shipping, delivery pages will be empty
- This is the critical step!

---

### **STEP 5: Buyer - Track Delivery**

1. **Logout** → **Login as Buyer** (`buyer@test.com`)
2. **Go to "Track Delivery"** (from Dashboard)
3. ✅ **Now you see deliveries!**

**Expected Result:**
- Delivery list shows shipped order
- Status: PENDING
- Timeline shows: PENDING (current) → IN_TRANSIT → DELIVERED
- Auto-refresh every 10 seconds
- Can toggle auto-refresh ON/OFF

---

### **STEP 6: Farmer - Update Delivery Status**

1. **Logout** → **Login as Farmer** (`farmer@test.com`)
2. **Go to "Deliveries"** (from Dashboard)
3. **Select delivery** from list
4. **Update Delivery:**
   - Status: PENDING → IN_TRANSIT
   - Tracking Location: `Distribution Center`
   - Notes: `Package dispatched for delivery`
   - Click "Update Delivery"
5. ✅ Delivery status updated

**Expected Result:**
- Delivery status: IN_TRANSIT
- Timeline shows progress
- Buyer sees update in real-time (auto-refresh)

---

### **STEP 7: Farmer - Mark as Delivered**

1. **Still as Farmer** in "Deliveries"
2. **Update Delivery:**
   - Status: IN_TRANSIT → DELIVERED
   - Tracking Location: `Customer Address`
   - Notes: `Successfully delivered`
   - Click "Update Delivery"
3. ✅ Delivery completed!

**Expected Result:**
- Delivery status: DELIVERED (green)
- **Order status automatically updated to DELIVERED**
- Actual delivery date recorded
- Timeline shows all green checkmarks
- Form disabled (can't update completed delivery)

---

## 🔍 Troubleshooting: Why Pages Are Empty

### **Orders Page Empty?**

**Possible Reasons:**
1. ❌ **No orders placed yet**
   - Solution: Login as buyer and place an order
   
2. ❌ **Wrong user logged in**
   - Buyers see their own orders
   - Farmers see orders for their products
   - Admins see all orders
   
3. ❌ **User ID missing from token**
   - Solution: Logout and login again
   - Check browser console for errors

**How to Fix:**
```javascript
// Check in browser console:
console.log(localStorage.getItem('user'));
// Should show: {"id":1,"name":"...","email":"...","role":"BUYER"}
// If no "id" field, logout and login again
```

---

### **Delivery/Tracking Page Empty?**

**Possible Reasons:**
1. ❌ **No orders shipped yet** ⚠️ MOST COMMON
   - Deliveries are ONLY created when order status = SHIPPED
   - Solution: Farmer must ship the order first
   
2. ❌ **Orders still in PENDING or ACCEPTED status**
   - Solution: Farmer must update to SHIPPED
   
3. ❌ **Wrong user logged in**
   - Buyers see their deliveries
   - Farmers see deliveries for their products
   
4. ❌ **Backend not running**
   - Check: `http://localhost:8080/api/delivery/tracking/{buyerId}`

**Step-by-Step Fix:**
1. Login as Farmer
2. Go to "Farmer Orders"
3. Find order with ACCEPTED status
4. Change status to SHIPPED
5. Logout → Login as Buyer
6. Go to "Track Delivery"
7. ✅ Now you see deliveries!

---

## 🎯 Admin Testing

### **Admin Can Do Everything**

1. **Login as Admin** (`admin@test.com`)

2. **Products:**
   - Browse ALL products (from all farmers)
   - Edit ANY product
   - Delete ANY product

3. **Orders:**
   - Go to "All Orders" (admin-orders page)
   - See ALL orders from all users
   - Update ANY order status
   - Cancel/Delete ANY order
   - Filter by status

4. **Inventory:**
   - View ALL inventory
   - Update stock for ANY product

5. **Deliveries:**
   - View ALL deliveries
   - Update delivery status for any order

---

## 📊 Testing Checklist

### ✅ Products Module
- [ ] Farmer can create product
- [ ] Inventory auto-created with product
- [ ] Product shows in browse page
- [ ] Buyer can view product details
- [ ] Out-of-stock products show red badge
- [ ] Low-stock products show yellow badge
- [ ] Admin can edit any product
- [ ] Admin can delete any product

### ✅ Orders Module
- [ ] Buyer can place order
- [ ] Order shows in "My Orders"
- [ ] Inventory decreases automatically
- [ ] Farmer sees order in "Farmer Orders"
- [ ] Farmer can update order status
- [ ] Buyer can cancel PENDING/ACCEPTED orders
- [ ] Cannot cancel SHIPPED/DELIVERED orders
- [ ] Admin can see all orders
- [ ] Admin can cancel any order

### ✅ Delivery Module
- [ ] Delivery auto-created when order SHIPPED
- [ ] Buyer sees delivery in "Track Delivery"
- [ ] Farmer sees delivery in "Deliveries"
- [ ] Timeline shows current status
- [ ] Auto-refresh works (10 seconds)
- [ ] Farmer can update delivery status
- [ ] Order status syncs with delivery
- [ ] Actual delivery date recorded
- [ ] Admin can manage all deliveries

### ✅ Inventory Module
- [ ] Shows stock levels with color coding
- [ ] Farmer sees only their products
- [ ] Admin sees all products
- [ ] Can update stock manually
- [ ] Auto-updates on order/cancel
- [ ] Statistics show correctly

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to load orders"
**Solution:**
```bash
# Check backend is running
curl http://localhost:8080/api/orders/buyer/1

# If 403 error, logout and login again
# If 404 error, check user ID is correct
```

### Issue 2: "No deliveries found"
**Solution:**
- Orders must be SHIPPED first
- Check order status in "My Orders"
- Farmer must update status to SHIPPED
- Then deliveries will appear

### Issue 3: "You can only cancel your own orders"
**Solution:**
- Backend updated to allow admin
- Restart backend: `mvn spring-boot:run`
- Admin can now cancel any order

### Issue 4: Empty pages after login
**Solution:**
```javascript
// Clear localStorage and re-login
localStorage.clear();
// Then login again to get new token
```

### Issue 5: Auto-refresh not working
**Solution:**
- Check toggle is ON (green)
- Check browser console for errors
- Verify backend is running
- Check network tab for API calls

---

## 🎨 Visual Indicators Guide

### Order Status Colors
- 🟡 **PENDING** - Yellow (just placed)
- 🔵 **ACCEPTED** - Blue (farmer accepted)
- 🟣 **SHIPPED** - Purple (on the way)
- 🟢 **DELIVERED** - Green (completed)
- 🔴 **CANCELLED** - Red (cancelled)

### Stock Status Colors
- 🔴 **0 units** - Red background, "Out of Stock"
- 🟡 **1-9 units** - Yellow background, "Low Stock"
- ⚪ **10+ units** - Gray background, normal

### Delivery Timeline
- ✅ **Green** - Completed step
- 🔵 **Blue (pulsing)** - Current step
- ⚪ **Gray** - Pending step
- 🔴 **Red** - Failed delivery

---

## 🚀 Quick Test Script

Run this complete flow in 5 minutes:

```bash
# 1. Start servers
cd backend && mvn spring-boot:run &
cd frontend && npm run dev &

# 2. Open browser: http://localhost:5173

# 3. Create farmer account → Add product
# 4. Create buyer account → Place order
# 5. Login as farmer → Ship order
# 6. Login as buyer → Track delivery
# 7. Login as farmer → Update to delivered
# 8. Login as admin → Manage everything
```

---

## 📞 Need Help?

Check browser console (F12) for errors:
- Red errors = API issues
- Yellow warnings = Non-critical
- Network tab = See API calls

Check backend logs for:
- SQL queries
- Error messages
- Authentication issues

---

## ✨ Success Criteria

**You know it's working when:**
1. ✅ Orders appear immediately after placing
2. ✅ Deliveries appear after shipping
3. ✅ Timeline updates in real-time
4. ✅ Inventory syncs automatically
5. ✅ Admin can manage everything
6. ✅ No console errors
7. ✅ All status updates work
8. ✅ Auto-refresh works

**Happy Testing! 🎉**
