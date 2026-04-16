# Bank CRM - Backend API

Bank CRM tizimi uchun RESTful API (Node.js + Express + MongoDB)

## Texnologiyalar

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-Origin Resource Sharing

## O'rnatish

### 1. Dependencies'larni o'rnatish

```bash
cd server
npm install
```

### 2. MongoDB'ni o'rnatish

**Lokal MongoDB:**
```bash
# MongoDB'ni o'rnating: https://www.mongodb.com/try/download/community
# Windows'da MongoDB Compass ham o'rnatiladi
```

**Yoki MongoDB Atlas (Cloud):**
1. https://www.mongodb.com/cloud/atlas/register ga boring
2. Bepul cluster yarating
3. Connection string oling

### 3. Environment Variables

`.env` faylini yarating (`.env.example` dan nusxa oling):

```bash
cp .env.example .env
```

`.env` faylini tahrirlang:

```env
# MongoDB - Lokal
MONGODB_URI=mongodb://localhost:27017/bank_crm

# Yoki MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bank_crm

PORT=5000
NODE_ENV=development
JWT_SECRET=bank_crm_super_secret_jwt_key_2024

ADMIN_USERNAME=Nodir
ADMIN_PASSWORD=Ipoteka

# Frontend URL (CORS uchun)
CORS_ORIGIN=http://localhost:5173
```

### 4. Server'ni ishga tushirish

**Development rejimida (auto-restart):**
```bash
npm run dev
```

**Production rejimida:**
```bash
npm start
```

Server ishga tushganda:
- 🚀 API: http://localhost:5000
- 🏥 Health check: http://localhost:5000/health

## API Endpoints

### Authentication

#### Operator Login
```http
POST /api/auth/operator/login
Content-Type: application/json

{
  "login": "401",
  "password": "1234"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "operatorId": "401",
    "role": "operator"
  }
}
```

#### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "login": "Nodir",
  "password": "Ipoteka"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "username": "Nodir",
    "role": "admin"
  }
}
```

#### Token Verify
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### Clients (Mijozlar)

#### Barcha mijozlarni olish (Admin)
```http
GET /api/clients
Authorization: Bearer <admin_token>
```

#### Operator mijozlarini olish
```http
GET /api/clients/operator
Authorization: Bearer <operator_token>
```

#### Bitta mijozni olish
```http
GET /api/clients/:id
Authorization: Bearer <token>
```

#### Yangi mijoz qo'shish
```http
POST /api/clients
Authorization: Bearer <operator_token>
Content-Type: application/json

{
  "ism": "Ali",
  "familya": "Valiyev",
  "telefon": "+998901234567",
  "hudud": "Toshkent",
  "garov": "Uy-joy",
  "summa": 50000000,
  "status": "Jarayonda",
  "comment": "Izoh"
}
```

#### Mijozni yangilash
```http
PUT /api/clients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "ism": "Ali",
  "familya": "Valiyev",
  "status": "Tasdiqlangan",
  ...
}
```

#### Mijozni o'chirish (Admin)
```http
DELETE /api/clients/:id
Authorization: Bearer <admin_token>
```

#### Statistika olish
```http
GET /api/clients/statistics?operatorId=401&period=today
Authorization: Bearer <token>

Query Parameters:
- operatorId: "401" yoki "all" (ixtiyoriy)
- period: "today" | "week" | "month" | "all" (ixtiyoriy)
```

### Operators

#### Barcha operatorlarni olish
```http
GET /api/operators
Authorization: Bearer <token>
```

#### Top operatorlar
```http
GET /api/operators/top?limit=5
Authorization: Bearer <token>

Query Parameters:
- limit: raqam (default: 5)
```

#### Bitta operatorni olish
```http
GET /api/operators/:id
Authorization: Bearer <token>
```

#### Operatorni yangilash (Admin)
```http
PUT /api/operators/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Operator 401",
  "status": "active"
}
```

## Database Schema

### Client (Mijoz)
```javascript
{
  ism: String (required),
  familya: String (required),
  telefon: String (required),
  hudud: String (required),
  garov: String (required),
  summa: Number (required),
  operatorRaqam: String (required),
  status: String (enum: ['Jarayonda', 'Tasdiqlangan', 'Rad etilgan']),
  comment: String,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Operator
```javascript
{
  operatorId: String (unique, required),
  name: String (required),
  status: String (enum: ['active', 'inactive']),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Authentication

API JWT (JSON Web Token) dan foydalanadi. Har bir so'rovda token yuborish kerak:

```
Authorization: Bearer <your_jwt_token>
```

Token 7 kun amal qiladi.

## Error Handling

Barcha xatolar quyidagi formatda qaytariladi:

```json
{
  "success": false,
  "message": "Xato xabari"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Vercel'ga Deploy qilish

### 1. `vercel.json` yarating (server papkasida):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. MongoDB Atlas'ni sozlang
- MongoDB Atlas'da cluster yarating
- Connection string oling
- IP Whitelist'ga `0.0.0.0/0` qo'shing (yoki Vercel IP'larini)

### 3. Vercel Environment Variables
Vercel dashboard'da quyidagi o'zgaruvchilarni qo'shing:
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `CORS_ORIGIN` (frontend URL)

### 4. Deploy
```bash
cd server
vercel
```

## Development Tips

### MongoDB Compass bilan ishlash
1. MongoDB Compass'ni oching
2. Connection string: `mongodb://localhost:27017`
3. Database: `bank_crm`
4. Collections: `clients`, `operators`

### API'ni test qilish (Thunder Client / Postman)
1. VS Code'ga Thunder Client extension'ni o'rnating
2. Yoki Postman'dan foydalaning
3. Endpointlarni test qiling

## Muammolarni hal qilish

### MongoDB ulanmayapti
```bash
# Windows'da MongoDB service'ni ishga tushiring
net start MongoDB

# yoki MongoDB Compass orqali tekshiring
```

### Port band
```bash
# .env faylida PORT'ni o'zgartiring
PORT=5001
```

### CORS xatosi
```bash
# .env faylida CORS_ORIGIN'ni to'g'ri sozlang
CORS_ORIGIN=http://localhost:5173
```

## Support

Muammolar yuzaga kelsa:
1. MongoDB ishlab turganligini tekshiring
2. `.env` fayli to'g'ri sozlanganligini tekshiring
3. `npm install` qaytadan ishga tushiring
4. Server loglarini ko'rib chiqing

## License

MIT
