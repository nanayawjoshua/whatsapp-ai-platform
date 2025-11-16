# Supermarket Google Sheets Database Schema

For MVP, we'll use **4 Google Sheets** in one spreadsheet.

## Sheet 1: Product Catalog

| Column | Type | Example | Notes |
|--------|------|---------|-------|
| product_id | Text | PROD-001 | Unique identifier |
| name | Text | Fresh Tomatoes | Product name |
| category | Text | Fresh Produce | From business config |
| price | Number | 5.50 | Price per unit in GHC |
| unit | Text | per kg | kg, piece, pack, liter |
| stock_quantity | Number | 150 | Current stock level |
| min_stock_threshold | Number | 20 | Alert when below this |
| description | Text | Fresh local tomatoes | Short description |
| is_available | Boolean | TRUE | TRUE/FALSE |
| image_url | Text | https://... | Optional product image |
| last_updated | Timestamp | 2025-01-15 14:30 | Auto-updated |

**Sample Data:**
```
PROD-001, Fresh Tomatoes, Fresh Produce, 5.50, per kg, 150, 20, Fresh local tomatoes, TRUE, "", 2025-01-15 14:30
PROD-002, Milk (1L), Dairy & Eggs, 12.00, per liter, 80, 15, Fresh whole milk, TRUE, "", 2025-01-15 14:30
PROD-003, White Bread, Bakery, 8.00, per loaf, 50, 10, Freshly baked daily, TRUE, "", 2025-01-15 14:30
```

---

## Sheet 2: Customers

| Column | Type | Example | Notes |
|--------|------|---------|-------|
| customer_id | Text | CUST-001 | Auto-generated |
| phone_number | Text | +233241234567 | WhatsApp number (unique) |
| name | Text | Kwame Mensah | Customer name |
| delivery_address | Text | 123 Oxford St, Osu | Default address |
| delivery_zone | Text | Zone A | A, B, or C |
| favorite_items | Text | PROD-001, PROD-003 | Comma-separated product IDs |
| total_orders | Number | 15 | Lifetime order count |
| total_spent | Number | 1250.00 | Lifetime spend |
| last_order_date | Date | 2025-01-14 | Last order |
| created_at | Timestamp | 2025-01-01 10:00 | Registration date |
| loyalty_tier | Text | Gold | Bronze/Silver/Gold |

---

## Sheet 3: Orders

| Column | Type | Example | Notes |
|--------|------|---------|-------|
| order_id | Text | ORD-20250115-001 | Format: ORD-YYYYMMDD-XXX |
| customer_id | Text | CUST-001 | Foreign key |
| customer_name | Text | Kwame Mensah | Denormalized for speed |
| customer_phone | Text | +233241234567 | WhatsApp contact |
| items_json | JSON Text | [{"product_id":"PROD-001","qty":2}] | Order items array |
| items_summary | Text | 2x Tomatoes, 1x Bread | Human-readable |
| subtotal | Number | 75.00 | Before delivery |
| delivery_fee | Number | 10.00 | Based on zone |
| discount | Number | 0.00 | Promo/loyalty discount |
| total | Number | 85.00 | Final amount |
| payment_method | Text | Mobile Money | From config |
| payment_status | Text | Pending | Pending/Paid/Failed |
| delivery_type | Text | Delivery | Delivery/Pickup |
| delivery_address | Text | 123 Oxford St | Full address |
| delivery_zone | Text | Zone A | For fee calculation |
| delivery_time_requested | Text | 3:00 PM | Customer preference |
| delivery_time_actual | Timestamp | 2025-01-15 15:15 | When delivered |
| order_status | Text | Processing | New/Processing/Ready/Out for Delivery/Delivered/Cancelled |
| special_instructions | Text | Call when arriving | Customer notes |
| created_at | Timestamp | 2025-01-15 13:00 | Order time |
| updated_at | Timestamp | 2025-01-15 15:15 | Last status change |

---

## Sheet 4: Transactions (Payment Tracking)

| Column | Type | Example | Notes |
|--------|------|---------|-------|
| transaction_id | Text | TXN-20250115-001 | Unique ID |
| order_id | Text | ORD-20250115-001 | Links to order |
| customer_id | Text | CUST-001 | For reporting |
| amount | Number | 85.00 | Transaction amount |
| payment_method | Text | MTN Mobile Money | Specific provider |
| payment_reference | Text | MP250115XYZ123 | From payment gateway |
| status | Text | Success | Success/Pending/Failed |
| verified_by | Text | System/Manual | Automation flag |
| notes | Text | Auto-verified via API | Additional info |
| created_at | Timestamp | 2025-01-15 13:05 | Payment time |

---

## Google Sheets Formulas & Automation

### Product Sheet Auto-Alerts
In column M (stock_alert):
```excel
=IF(F2<G2, "LOW STOCK ⚠️", "OK")
```

### Customer Loyalty Tier (based on spend)
In column K (loyalty_tier):
```excel
=IF(I2>=1000, "Gold", IF(I2>=500, "Silver", "Bronze"))
```

### Order Total Calculation
In column L (total):
```excel
=H2+I2-J2
```
(subtotal + delivery_fee - discount)

### Daily Revenue Dashboard (separate sheet)
```excel
=SUMIFS(Orders!L:L, Orders!R:R, ">=TODAY()", Orders!M:M, "Paid")
```

---

## Integration with n8n Workflows

### Workflow 1: New Order Processing
1. Customer sends WhatsApp message
2. AI agent parses intent → product search
3. n8n queries Google Sheets (Product Catalog)
4. Returns available items + prices
5. Customer builds cart
6. n8n creates new row in Orders sheet
7. Updates stock in Product Catalog
8. Sends invoice
9. Awaits payment confirmation
10. Updates Transaction sheet
11. Notifies staff for fulfillment

### Workflow 2: Low Stock Alert
1. Google Sheets triggers when stock < threshold
2. n8n sends WhatsApp alert to shop owner
3. Owner can restock or mark item unavailable

### Workflow 3: Delivery Tracking
1. Staff updates order_status in Sheets
2. n8n detects change (polling every 2 mins)
3. Sends automated WhatsApp update to customer

---

## Sample n8n → Google Sheets Nodes

**Read Products:**
- Node: Google Sheets (Read)
- Operation: Get Many
- Sheet: Product Catalog
- Filters: `is_available = TRUE AND stock_quantity > 0`

**Create Order:**
- Node: Google Sheets (Append)
- Sheet: Orders
- Fields: Mapped from AI conversation

**Update Stock:**
- Node: Google Sheets (Update)
- Sheet: Product Catalog
- Find by: product_id
- Update: stock_quantity = stock_quantity - ordered_qty

---

## Migration Path (When You Scale)

**Month 1-3:** Google Sheets (MVP)
**Month 4-6:** PostgreSQL + keep Sheets as backup
**Month 7+:** Full database with caching (Redis) + admin dashboard

For now, Sheets is perfect. It's:
- ✅ Free
- ✅ Real-time updates
- ✅ Shop owner can edit directly
- ✅ Built-in backup (version history)
- ✅ Easy to visualize with charts
- ✅ No SQL knowledge needed

---

## Next Steps

1. Create Google Sheet with this structure
2. Populate 20-30 sample products
3. Build n8n workflow to query/update sheets
4. Test with real WhatsApp conversation
