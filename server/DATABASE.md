# MongoDB model — Street Archive

## `products`

เก็บข้อมูลหน้าร้านและสต็อกในระดับตัวเลือกสินค้า (variant) ใน `server/src/models/product.model.js`

```js
{
  name: "Archive Heavy Tee",
  slug: "archive-heavy-tee",             // unique, ใช้ใน URL
  category: "t-shirts",                  // t-shirts | baggy-pants | hoodies | jackets | accessories
  price: 890,
  compareAtPrice: 990,                    // optional: ราคาก่อนลด
  description: "...",
  materials: ["100% heavyweight cotton", "230 GSM"],
  care: ["Machine wash cold", "Do not tumble dry"],
  images: ["https://.../tee-front.jpg"],
  variants: [
    { size: "M", color: "Faded Green", sku: "AHT-FG-M", stock: 12 }
  ],
  featured: true,
  status: "active",                      // draft | active | archived
  createdAt: Date,
  updatedAt: Date
}
```

`slug` มี unique index, `category` และ `featured` มี index เพื่อให้กรองหน้าร้านเร็วขึ้น และ `name` กับ `description` มี text index สำหรับค้นหา.

## Collection ที่ควรเพิ่มเมื่อเริ่มระบบสั่งซื้อ

| Collection | ฟิลด์หลัก | หน้าที่ |
|---|---|---|
| `users` | `email`, `name`, `passwordHash`, `addresses[]`, `role` | ลูกค้าและแอดมิน |
| `carts` | `userId`, `items[{ productId, variantSku, quantity }]` | ตะกร้าที่ยังไม่ checkout |
| `orders` | `orderNumber`, `userId`, `items[]`, `shippingAddress`, `subtotal`, `shippingFee`, `total`, `paymentStatus`, `fulfillmentStatus` | เก็บ snapshot ราคา/ชื่อสินค้า ณ วันที่สั่ง เพื่อไม่เปลี่ยนตามสินค้าในอนาคต |
| `categories` *(ถ้าต้องการให้แอดมินจัดการเอง)* | `name`, `slug`, `description`, `image`, `sortOrder`, `isActive` | แทน enum ใน `products` เมื่อหมวดหมู่เปลี่ยนบ่อย |

สำหรับ `orders.items[]` ควรเก็บ `productId` ควบคู่กับ `name`, `sku`, `size`, `color`, `unitPrice` และ `image` เป็น snapshot เสมอ ไม่ควรอ้างอิงสินค้าอย่างเดียว.

## API ที่เพิ่ม

- `GET /api/products?category=hoodies&featured=true&q=archive`
- `GET /api/products/:slug`
- `POST /api/products`

