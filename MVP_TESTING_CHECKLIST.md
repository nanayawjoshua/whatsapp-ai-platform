# 🧪 MVP Testing Checklist

**Complete this AFTER finishing MVP_LAUNCH_SETUP.md**

---

## Test 1: Website Loads ✅

**URL**: https://beeline.works

**Steps**:
1. Open https://beeline.works in browser
2. Check homepage loads with new terminal cursor logo
3. Click "Get started" button
4. Verify redirects to `/signup`

**Expected**:
- ✅ Homepage loads without errors
- ✅ Logo shows with blinking cursor
- ✅ All sections visible (hero, how it works, pricing)
- ✅ "Get started" redirects to signup

**Status**: [ ] Pass / [ ] Fail

---

## Test 2: Vendor Signup Flow (NEW VENDOR) ✅

**URL**: https://beeline.works/signup

### Step 1: Enter Phone Number

**Actions**:
1. Go to `/signup`
2. Enter phone: `+233 XX XXX XXXX` (use a TEST number)
3. Click "Continue"

**Expected**:
- ✅ Form validates phone number
- ✅ Shows loading state
- ✅ Advances to QR code screen

**Status**: [ ] Pass / [ ] Fail

---

### Step 2: Scan QR Code

**Actions**:
1. Open WhatsApp on your test phone
2. Go to Settings → Linked Devices → Link a Device
3. Scan the QR code shown on screen

**Expected**:
- ✅ QR code displays clearly
- ✅ WhatsApp recognizes QR code
- ✅ Device links successfully
- ✅ Page automatically advances to success screen

**Status**: [ ] Pass / [ ] Fail

---

### Step 3: Dashboard Redirect

**Actions**:
1. Wait for "You're all set!" screen
2. Click "Go to Dashboard"

**Expected**:
- ✅ Redirects to `/dashboard`
- ✅ Dashboard loads with vendor data
- ✅ WhatsApp connection shows "Connected"
- ✅ Sidebar shows: Dashboard, Conversations, Products, AI Assistant, etc.

**Status**: [ ] Pass / [ ] Fail

---

## Test 3: WhatsApp Inventory Commands ✅

**Use the WhatsApp number you just connected**

### Command 1: Add Product

**Send to your WhatsApp**:
```
Add product: Test Shoes, ₵100, 5
```

**Expected Response**:
```
✅ Product Added!

📦 Test Shoes
💰 ₵100.00
📊 5 units in stock

Manage it on your dashboard or send "List products" to see all.
```

**Status**: [ ] Pass / [ ] Fail

---

### Command 2: Check Stock

**Send**:
```
Check stock: Test Shoes
```

**Expected Response**:
```
📦 Test Shoes
✅ In Stock

💰 Price: ₵100.00
📊 Stock: 5 units
```

**Status**: [ ] Pass / [ ] Fail

---

### Command 3: Update Stock

**Send**:
```
Update stock: Test Shoes, add 10
```

**Expected Response**:
```
✅ Updated

📦 Test Shoes
Old: 5 → New: 15 units
```

**Status**: [ ] Pass / [ ] Fail

---

### Command 4: List Products

**Send**:
```
List products
```

**Expected Response**:
```
📦 Your Products (1 total)

1. ✅ Test Shoes
   ₵100.00 × 15 units

💰 Total Inventory Value: ₵1500.00
```

**Status**: [ ] Pass / [ ] Fail

---

## Test 4: Products Dashboard UI ✅

**URL**: https://beeline.works/dashboard/products

**Actions**:
1. Navigate to dashboard
2. Click "Products" in sidebar
3. Verify Test Shoes appears in grid
4. Click "Add Product" button
5. Fill form: Name="Test Bag", Price="200", Quantity="3"
6. Click "Add Product"

**Expected**:
- ✅ Products page loads
- ✅ Shows Test Shoes card with image placeholder
- ✅ Displays price ₵100.00 and "15 in stock"
- ✅ Add product modal opens
- ✅ Form validates inputs
- ✅ New product appears immediately after adding
- ✅ Can see both products in grid

**Status**: [ ] Pass / [ ] Fail

---

## Test 5: Vendor Login (RETURNING VENDOR) ✅

**URL**: https://beeline.works/login

### Logout First

**Actions**:
1. In dashboard, click "Log out" in sidebar

**Expected**:
- ✅ Redirects to `/login`

---

### Login with Phone

**Actions**:
1. Enter the same phone number: `+233 XX XXX XXXX`
2. Click "Sign in"

**Expected**:
- ✅ Looks up vendor successfully
- ✅ Redirects to `/dashboard`
- ✅ Shows same vendor data
- ✅ Products still there (Test Shoes & Test Bag)

**Status**: [ ] Pass / [ ] Fail

---

## Test 6: Google OAuth Signup ✅

**URL**: https://beeline.works/signup

**Actions**:
1. Log out current vendor
2. Go to `/signup`
3. Click "Continue with Google"
4. Sign in with Google account
5. Complete phone number step
6. Scan QR code

**Expected**:
- ✅ Google OAuth popup opens
- ✅ Redirects back after Google signin
- ✅ Asks for phone number
- ✅ Generates QR code
- ✅ After scan, creates vendor account
- ✅ Dashboard shows Google email

**Status**: [ ] Pass / [ ] Fail

---

## Test 7: Low Stock Alerts ✅

### Create Low Stock Product

**Send via WhatsApp**:
```
Add product: Low Stock Item, ₵50, 2
```

### Check Dashboard

**Actions**:
1. Go to `/dashboard/products`

**Expected**:
- ✅ Yellow "Low Stock Alert" banner appears at top
- ✅ Shows "Low Stock Item (2 left)"
- ✅ Product card has yellow "⚠️ LOW STOCK" badge

**Status**: [ ] Pass / [ ] Fail

---

### Check via WhatsApp

**Send**:
```
Low stock
```

**Expected Response**:
```
⚠️ Low Stock Alert
1 product needs restocking:

1. Low Stock Item
   Only 2 units left!
   💰 ₵50.00
```

**Status**: [ ] Pass / [ ] Fail

---

## Test 8: Remove Product ✅

**Send via WhatsApp**:
```
Remove product: Low Stock Item
```

**Expected Response**:
```
✅ Removed "Low Stock Item" from your inventory.
```

**Verify in Dashboard**:
- ✅ Product no longer appears in products list
- ✅ Low stock alert disappears

**Status**: [ ] Pass / [ ] Fail

---

## Test 9: Multi-Vendor Isolation ✅

**Get a second test phone number**

### Sign Up Vendor 2

**Actions**:
1. Open https://beeline.works/signup in incognito window
2. Enter different phone: `+233 YY YYY YYYY`
3. Scan QR with second phone
4. Add product via WhatsApp: `Add product: Vendor 2 Item, ₵300, 8`

**Expected**:
- ✅ Vendor 2 account created
- ✅ Vendor 2 dashboard shows only their product
- ✅ Does NOT see Vendor 1's products

---

### Verify Vendor 1

**Actions**:
1. Log in as Vendor 1 again
2. Check products page

**Expected**:
- ✅ Vendor 1 sees ONLY their products (Test Shoes, Test Bag)
- ✅ Does NOT see Vendor 2's product

**Status**: [ ] Pass / [ ] Fail

---

## Test 10: Admin Dashboard Access ✅

**URL**: https://beeline.works/admin/login

**Actions**:
1. Go to `/admin/login`
2. Enter admin credentials
3. Check admin dashboard loads

**Expected**:
- ✅ Admin login page loads
- ✅ Email/password form shows
- ✅ (If admin account exists) Can log in
- ✅ (If doesn't exist) Shows error message

**Note**: Admin account may not be created yet - that's OK for MVP

**Status**: [ ] Pass / [ ] Fail / [ ] N/A

---

## Test 11: Mobile Responsiveness ✅

**Test on phone**:
1. Open https://beeline.works on mobile
2. Navigate through signup, dashboard, products

**Expected**:
- ✅ Homepage responsive
- ✅ Signup flow works on mobile
- ✅ Dashboard sidebar collapses
- ✅ Products grid stacks on mobile
- ✅ All buttons tappable

**Status**: [ ] Pass / [ ] Fail

---

## 🐛 Known Issues / Edge Cases

### Things to Monitor:

1. **QR Code Timeout**:
   - QR codes expire after ~30 seconds
   - If user doesn't scan quickly, may need to refresh

2. **WhatsApp Session Reconnect**:
   - If bridge restarts, vendors need to scan QR again
   - This is expected behavior

3. **Product Image Upload**:
   - Currently no UI to upload images
   - Images can be added later via API
   - WhatsApp image support not yet implemented

4. **Duplicate Products**:
   - System allows duplicate product names
   - No uniqueness constraint (intentional)

---

## ✅ Final Pre-Launch Checklist

Before going live:

- [ ] All 11 tests passed
- [ ] At least 2 vendor accounts tested
- [ ] Inventory commands working
- [ ] Products dashboard functional
- [ ] Login/logout works
- [ ] No console errors on any page
- [ ] Mobile responsive
- [ ] WhatsApp bridge stable (check `pm2 logs`)

---

## 🎉 Launch Criteria

**MVP is ready to launch when**:
- ✅ 9/11 tests pass (admin can be skipped for MVP)
- ✅ No critical bugs
- ✅ WhatsApp inventory working
- ✅ Multi-vendor isolation verified

---

## 📊 Test Results Summary

**Date**: ___________
**Tester**: ___________

**Passed**: ___ / 11
**Failed**: ___ / 11
**Blocked**: ___ / 11

**Critical Issues**:
1. ___________
2. ___________
3. ___________

**Ready to Launch**: [ ] YES / [ ] NO

**If NO, blockers**:
- ___________
- ___________
