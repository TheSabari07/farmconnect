# Debug Steps - Orders Not Loading

## Step 1: Check What's in localStorage

Open browser console (F12) and run:

```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check user data
const userData = localStorage.getItem('user');
console.log('User data (raw):', userData);

// Parse and check
const user = JSON.parse(userData);
console.log('User object:', user);
console.log('Has ID?', user.id);
console.log('User ID value:', user.id);
```

**Expected output:**
```javascript
User object: {
  token: "eyJhbGc...",
  id: 4,              // ← This MUST exist!
  email: "buyer@test.com",
  name: "Buyer Name",
  role: "BUYER"
}
```

**If you see:**
```javascript
User object: {
  token: "...",
  email: "...",
  name: "...",
  role: "BUYER"
  // NO id field! ← This is the problem
}
```

## Step 2: Test Login Endpoint

In browser console:

```javascript
// Test login
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'buyer@test.com',
    password: 'your_password'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Login response:', data);
  console.log('Has ID?', data.id);
});
```

**Expected response:**
```json
{
  "token": "eyJhbGc...",
  "id": 4,           // ← Must be here!
  "email": "buyer@test.com",
  "name": "Buyer Name",
  "role": "BUYER"
}
```

## Step 3: Check Backend is Running

```bash
# Test backend
curl http://localhost:8080/api/products

# Should return JSON array of products
```

## Step 4: Force Clear and Re-login

In browser console:

```javascript
// Nuclear option - clear everything
localStorage.clear();
sessionStorage.clear();

// Then refresh page and login again
location.reload();
```

## Step 5: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Login again
4. Look for `/api/auth/login` request
5. Click on it
6. Check **Response** tab
7. Verify response has `id` field

## Step 6: Verify Database User

```sql
-- Check if user exists with correct ID
SELECT id, email, name, role FROM users WHERE email = 'buyer@test.com';

-- Should show:
-- id | email            | name       | role
-- 4  | buyer@test.com   | Buyer Name | BUYER
```

## Common Issues & Fixes

### Issue 1: Backend Not Returning ID

**Check AuthService.java:**
```java
// Should be:
return new AuthResponse(
    token, 
    user.getId(),  // ← This line
    user.getEmail(), 
    user.getName(), 
    user.getRole()
);
```

**Fix:** Restart backend
```bash
cd backend
mvn spring-boot:run
```

### Issue 2: Frontend Not Saving ID

**Check LoginForm.jsx:**
```javascript
// After login, should save:
localStorage.setItem('user', JSON.stringify({
  id: response.data.id,      // ← Must include this
  email: response.data.email,
  name: response.data.name,
  role: response.data.role
}));
```

### Issue 3: Old Token Still Cached

**Force clear:**
```javascript
// In browser console
localStorage.clear();
// Close all tabs
// Open new tab
// Login again
```

## Step 7: Test with cURL

```bash
# Login and get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@test.com","password":"password123"}' \
  | jq .

# Should show:
# {
#   "token": "...",
#   "id": 4,        ← Check this!
#   "email": "...",
#   "name": "...",
#   "role": "BUYER"
# }
```

## Step 8: Check LoginForm Component

The issue might be in how the login response is being saved.

**Check this file:**
`/Users/sabaridossr/Downloads/marketplace/frontend/src/components/LoginForm.jsx`

**Look for:**
```javascript
// After successful login
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data));
```

**Should save the ENTIRE response.data object, which includes id**

## Quick Fix Script

Run this in browser console after logging in:

```javascript
// Check current state
const current = JSON.parse(localStorage.getItem('user'));
console.log('Current user:', current);

// If missing id, manually add it (temporary fix)
if (!current.id) {
  console.log('ID is missing! Fetching from backend...');
  
  // Get user info from backend
  fetch('http://localhost:8080/api/auth/me', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
  .then(r => r.json())
  .then(data => {
    console.log('User from backend:', data);
    // Update localStorage with id
    current.id = data.id;
    localStorage.setItem('user', JSON.stringify(current));
    console.log('Fixed! Refresh page now.');
    location.reload();
  });
}
```

## Expected Flow

1. User enters credentials
2. Frontend calls `/api/auth/login`
3. Backend returns: `{token, id, email, name, role}`
4. Frontend saves to localStorage
5. OrdersPage reads from localStorage
6. Checks if `user.id` exists
7. Calls `/api/orders/buyer/{id}`
8. ✅ Orders load

## If Still Not Working

**Check these files:**
1. `LoginForm.jsx` - How login response is saved
2. `RegisterForm.jsx` - How register response is saved
3. `AuthService.java` - What's being returned
4. `OrdersPage.jsx` - How user.id is being read

**Last resort:**
```bash
# Restart everything
# Kill backend (Ctrl+C)
# Kill frontend (Ctrl+C)

# Clear database and start fresh
mysql -u root -p123123
DROP DATABASE farm_marketplace;
CREATE DATABASE farm_marketplace;
exit;

# Restart backend (recreates tables)
cd backend
mvn spring-boot:run

# Restart frontend
cd frontend
npm run dev

# Register new user
# Login
# Should work now
```
