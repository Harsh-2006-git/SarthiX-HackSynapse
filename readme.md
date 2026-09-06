<div align="center">

# 🕉️ DIVYA YATRA

### **SarthiX**

### AI-Powered Smart Pilgrim Experience & Mega-Event Crowd Management Platform

<p>
  <strong>🚀 Built for HackSynapse 2026</strong>
  <br/>
  <strong>🛕 Designed for Ujjain Simhastha Kumbh Mela & Sacred Tourism</strong>
</p>

<br/>

<img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Vite-7.0.6-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-24.14-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express&logoColor=white"/>
<img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>

<br/>


<img width="1875" height="901" alt="Screenshot 2026-09-06 103457" src="https://github.com/user-attachments/assets/adb075d9-484e-48ae-bb60-f7e6daabcf64" />


---

<img src="https://img.shields.io/badge/Google%20Gemini-AI%20Core-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white"/>
<img src="https://img.shields.io/badge/YOLOv8-Computer%20Vision-FF6F00?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/Socket.IO-4.8.3-010101?style=for-the-badge&logo=socket.io&logoColor=white"/>
<img src="https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white"/>

<br/><br/>

<a href="#-features">
<img src="https://img.shields.io/badge/✨%20Features-Explore-FFB000?style=for-the-badge"/>
</a>

<a href="#-architecture">
<img src="https://img.shields.io/badge/🏗️%20Architecture-Explore-6C63FF?style=for-the-badge"/>
</a>

<a href="#-installation">
<img src="https://img.shields.io/badge/🚀%20Installation-Get%20Started-00A67E?style=for-the-badge"/>
</a>

<br/><br/>

> **🕉️ One Platform. One Journey. Complete Pilgrim Safety.**

</div>

---

# 🌟 About The Project

**Divya Yatra | SarthiX** is a next-generation digital ecosystem designed to transform large-scale pilgrimages and mega-events into **safer, smarter, and more seamless experiences**.

Built specifically with the challenges of the **Ujjain Simhastha Kumbh Mela** in mind, Divya Yatra combines:

- 🤖 Artificial Intelligence
- 👁️ Computer Vision
- 🗺️ Smart Maps & Navigation
- 🅿️ P2P Smart Parking
- 👨‍👩‍👧 Family Safety & Geofencing
- 🚨 Emergency SOS
- 🔎 AI-Assisted Lost & Found
- 🎟️ Digital Queue & QR Passes
- 🧠 Multilingual AI Concierge
- ⚡ Real-Time WebSocket Communication

into a single unified platform.

---

# 🧭 The Vision

Mega religious gatherings can bring **millions of pilgrims** into a relatively concentrated geographical area.

This creates challenges such as:

```text
             🛕 MEGA PILGRIMAGE
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
   👥 CROWDS     🚗 PARKING    🧭 NAVIGATION
       │            │            │
       ▼            ▼            ▼
   🚨 SAFETY     🅿️ SHORTAGE   📍 CONFUSION
       │            │            │
       └────────────┼────────────┘
                    ▼
              🕉️ DIVYA YATRA
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
      🤖 AI       🛡️ SAFETY     📊 CONTROL
```

### Our goal

> **Use technology to make every pilgrim's journey safer, simpler and spiritually enriching.**

---

# ✨ Features

## 🕉️ 01 — Live Darshan & Virtual Queue

<div align="center">

<img src="assets/darshan.gif" width="92%" alt="Live Darshan"/>

</div>

### 🎟️ Digital Pilgrim Experience

Divya Yatra provides a unified digital experience for temple visits.

### Features

- 🛕 Live Darshan streams
- 🎟️ Virtual queue booking
- ⏱️ Dynamic time-slot allocation
- 📱 Digital QR entry passes
- 🔐 HMAC-secured booking tokens
- 🌐 Multilingual interface
- 📲 Mobile-friendly pilgrim portal

### Supported Temple Experiences

```text
🛕 Mahakaleshwar
🛕 Kal Bhairav
🛕 Harsiddhi Mata
🛕 Chintaman Ganesh
```

### Booking Flow

```text
┌──────────────────┐
│  🛕 SELECT TEMPLE │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 🎟️ SELECT DARSHAN │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ ⏰ SELECT TIME SLOT│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 📱 GENERATE QR    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ ✅ DIGITAL PASS   │
└──────────────────┘
```

---

# 👁️ 02 — Real-Time AI Crowd Intelligence

<div align="center">

<img src="assets/crowd-detection.gif" width="92%" alt="YOLOv8 Crowd Detection"/>

</div>

## 🤖 YOLOv8 Vision Engine

The crowd-management engine uses **YOLOv8 + OpenCV + Python** to analyze camera feeds and detect people in real time.

### Pipeline

```text
🎥 LIVE CAMERA / RTSP
          │
          ▼
┌─────────────────────┐
│ 🖼️ FRAME EXTRACTION │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 🤖 YOLOv8 INFERENCE │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 👥 PERSON DETECTION │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 📊 DENSITY ANALYSIS │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 🚦 RISK CLASSIFIER  │
└──────────┬──────────┘
           │
      ┌────┼────┐
      ▼    ▼    ▼
    🟢     🟡     🔴
    LOW   MEDIUM CRITICAL
```

### Crowd Density Formula

$$
D = \frac{N}{A}
$$

Where:

- `D` = Crowd density
- `N` = Number of detected people
- `A` = Monitored area in square meters

| Density | Status | System Response |
|:---:|:---:|:---|
| `< 1.5 people/m²` | 🟢 **SAFE** | Normal monitoring |
| `1.5 – 3.0 people/m²` | 🟡 **MODERATE** | Warning & monitoring |
| `≥ 3.0 people/m²` | 🔴 **CRITICAL** | Emergency response |

> ⚠️ These thresholds are configurable and should be calibrated against real-world site conditions before operational deployment.

---

# 🅿️ 03 — Smart P2P Parking Marketplace

<div align="center">

<img src="assets/parking.png" width="92%" alt="Smart Parking"/>

</div>

## 🚗 Turn Local Spaces Into Smart Parking

Local residents can list unused:

```text
🏠 Driveways
🏢 Private Parking
🚗 Open Spaces
🏚️ Garages
```

Pilgrims can then discover and reserve them through the platform.

### Features

- 📍 Nearby parking discovery
- 🗺️ Interactive map
- 💰 Hourly pricing
- 📸 Parking images
- 🚗 Vehicle-type support
- 🎟️ Instant booking
- 📱 QR confirmation
- 🧭 Navigation assistance

### Parking Flow

```text
👤 HOST
  │
  ▼
🏠 LIST PARKING
  │
  ▼
📍 ADD LOCATION
  │
  ▼
💰 SET PRICE
  │
  ▼
📸 UPLOAD IMAGES
  │
  ▼
✅ PUBLISH SLOT
       │
       ▼
     👨 PILGRIM
       │
       ▼
    🔎 DISCOVER
       │
       ▼
      🎟️ BOOK
       │
       ▼
      📱 QR
```

---

# 🛡️ 04 — Family Mode & Live Geofencing

<div align="center">

<img src="assets/family-mode.png" width="92%" alt="Family Mode"/>

</div>

## 👨‍👩‍👧 Never Lose Your Family In The Crowd

Family Mode provides real-time location coordination using:

**GPS + Socket.IO + Geofencing**

```text
                 👨 FATHER
                    │
                    │
                    ▼
              📍 LOCATION
                    │
                    ▼
        ┌────────────────────┐
        │   🛡️ FAMILY HUB    │
        └────────────────────┘
             ▲          ▲
             │          │
        📍 MOTHER     📍 CHILD
```

### Safety Features

- 📍 Real-time location sharing
- 🗺️ Family map
- 🚧 Geofence alerts
- 🔋 Low-battery warnings
- ⚡ Real-time Socket.IO updates
- 👨‍👩‍👧 Family member management

---

# 🤖 05 — Multilingual AI Concierge

<div align="center">

<img src="assets/ai-assistant.gif" width="92%" alt="AI Assistant"/>

</div>

## 🧠 Your AI Pilgrimage Companion

Powered by **Google Gemini**.

The AI assistant can understand natural-language questions and help pilgrims plan their journey.

### Example Questions

```text
🗣️ "Mahakal temple kab khulta hai?"

🗣️ "Plan a one-day Ujjain trip."

🗣️ "Nearest parking kaha hai?"

🗣️ "What should I visit after Mahakaleshwar?"

🗣️ "मुझे उज्जैन में एक दिन का यात्रा प्लान बनाओ।"

🗣️ "Where can I find prasadam?"
```

### AI Capabilities

| Capability | Description |
|---|---|
| 🧠 Natural Language | Understands normal human questions |
| 🌐 Multilingual | Supports multiple Indian languages |
| 🗺️ Itinerary Planning | Generates personalized travel plans |
| 💰 Budget Planning | Considers travel budget |
| 👨‍👩‍👧 Family Planning | Considers family size |
| 🔎 Live Search | Retrieves current local information |
| 🎙️ Voice Interaction | Designed for hands-free usage |

---

# 🔎 06 — AI-Assisted Lost & Found

<div align="center">

<img src="assets/lost-found.png" width="92%" alt="Lost and Found"/>

</div>

## 📸 Find Lost Belongings Faster

Pilgrims can report lost items with photographs and relevant information.

```text
📸 UPLOAD ITEM
      │
      ▼
☁️ CLOUDINARY
      │
      ▼
🤖 AI / MATCHING
      │
      ▼
🔎 POTENTIAL MATCH
      │
      ▼
🔐 CLAIM VERIFICATION
      │
      ▼
✅ RESOLVED
```

### Status Lifecycle

```text
🟡 OPEN
   │
   ▼
🔵 MATCHED
   │
   ▼
🟢 RESOLVED
```

---

# 🚨 07 — Emergency SOS System

<div align="center">

<img src="assets/sos.gif" width="92%" alt="Emergency SOS"/>

</div>

## ⚡ One Tap. Immediate Response.

When a pilgrim activates SOS:

```text
📱 PILGRIM
    │
    │ SOS
    ▼
🚨 EMERGENCY SERVICE
    │
    ├──────────────► 👨‍👩‍👧 FAMILY
    │
    ├──────────────► 🛡️ VOLUNTEERS
    │
    ├──────────────► 👮 ADMIN
    │
    └──────────────► 📍 LIVE LOCATION
```

### SOS Payload

```json
{
  "latitude": 23.1765,
  "longitude": 75.7885,
  "timestamp": "2026-09-05T15:00:00Z"
}
```

### Emergency Features

- 🚨 One-tap SOS
- 📍 GPS location relay
- 👨‍👩‍👧 Family notification
- 🛡️ Volunteer notification
- 📊 Admin dashboard alert
- 📧 Email notification
- 📱 Real-time Socket.IO broadcast

---

# 📊 08 — Master Admin Command Console

<div align="center">

<img src="assets/admin-dashboard.gif" width="92%" alt="Admin Dashboard"/>

</div>

## 🎛️ Centralized Event Management

Administrators get a centralized command center for monitoring the pilgrimage ecosystem.

### Dashboard

```text
┌──────────────────────────────────────────────────────────┐
│                 🕉️ DIVYA YATRA CONSOLE                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  👥 VISITORS       🅿️ PARKING       🚨 ACTIVE SOS       │
│     1250              84                 02              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│        📊 CROWD DENSITY         🗺️ LIVE MAP             │
│                                                          │
│             🟢 NORMAL             📍 📍 📍              │
│             🟡 WARNING            📍 📍 🚨              │
│             🔴 CRITICAL           📍 📍 📍              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Admin Capabilities

- 📊 Live crowd analytics
- 🚨 SOS monitoring
- 👥 User management
- 🅿️ Parking monitoring
- 🗺️ Zone monitoring
- 🚧 Gate/zone controls
- 🛡️ Volunteer management
- 📈 Event analytics

---

# 🏗️ Architecture

## System Architecture

```text
                       ┌─────────────────────────┐
                       │       👤 PILGRIM        │
                       │     React Web App       │
                       └────────────┬────────────┘
                                    │
                         REST API + WebSocket
                                    │
                                    ▼
                 ┌──────────────────────────────────┐
                 │       🚀 EXPRESS BACKEND         │
                 │                                  │
                 │ JWT │ REST │ Socket.IO │ CORS   │
                 └──────────────┬───────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
      ┌──────────────┐  ┌──────────────┐  ┌───────────────┐
      │   🗄️ MYSQL   │  │  🤖 AI CORE  │  │ ☁️ CLOUDINARY │
      │   Sequelize  │  │   YOLOv8     │  │    Storage    │
      └──────────────┘  └──────┬───────┘  └───────────────┘
                                │
                                ▼
                         👁️ CROWD ENGINE
                                │
                                ▼
                         📊 DENSITY DATA
                                │
                                ▼
                         🚨 ALERT SYSTEM
```

---

# 🔄 Complete System Flow

```text
                         👤 USER
                           │
                           ▼
                  🌐 REACT FRONTEND
                           │
                           ▼
                     🔐 JWT AUTH
                           │
                           ▼
                  🚀 EXPRESS SERVER
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          🗄️ MYSQL      🤖 AI CORE    ⚡ SOCKET.IO
             │             │             │
             │             ▼             │
             │         👁️ YOLOv8        │
             │             │             │
             │             ▼             │
             │       📊 CROWD DATA       │
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                    📊 ADMIN CONSOLE
```

---

# ⚡ Real-Time WebSocket Events

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `connection` | Client → Server | User Token | Socket registration |
| `update-location` | Client → Server | `{ lat, lng, userId, battery }` | Send GPS |
| `location-broadcast` | Server → Client | `{ memberId, lat, lng }` | Family tracking |
| `sos-trigger` | Client → Server | `{ userId, lat, lng, time }` | Emergency alert |
| `sos-broadcast` | Server → Admin | `{ sosId, name, phone, coords }` | Admin notification |
| `crowd-density-update` | Engine → Server | `{ zoneId, count, status }` | Crowd metrics |

---

# 🛠️ Technology Stack

## 🎨 Frontend

| Technology | Purpose |
|---|---|
| ⚛️ React 19 | Frontend framework |
| ⚡ Vite | Development & build tool |
| 🎨 Tailwind CSS | Styling |
| 🎞️ Framer Motion | Animations |
| 🧩 Radix UI | UI primitives |
| 🗺️ Leaflet | Maps |
| 🧭 Leaflet Routing | Navigation |
| 📡 Axios | API communication |
| 🔀 React Router | Routing |
| 📊 Recharts | Analytics |
| 📱 JSQR | QR processing |
| 🤖 TensorFlow.js | Client-side AI |

---

## 🚀 Backend

| Technology | Purpose |
|---|---|
| 🟢 Node.js | Runtime |
| 🚀 Express.js | REST API |
| 🗄️ Sequelize | ORM |
| 🐬 MySQL | Database |
| 🔌 MySQL2 | Database driver |
| ⚡ Socket.IO | Real-time communication |
| 🔐 JWT | Authentication |
| 🔒 BcryptJS | Password hashing |
| 🛡️ Helmet | HTTP security |
| 🌐 CORS | Cross-origin security |
| 🚦 Express Rate Limit | API protection |
| 📤 Multer | File uploads |
| ☁️ Cloudinary | Media storage |
| 📧 Nodemailer | Email |

---

## 🤖 AI & Machine Learning

| Technology | Purpose |
|---|---|
| 🧠 Google Gemini | AI Concierge |
| 👁️ YOLOv8 | Person detection |
| 🐍 Python | AI engine |
| 📷 OpenCV | Video processing |
| 🔥 PyTorch | ML inference |
| 🔎 SerpAPI | Live web search |
| 🧩 TensorFlow.js | Browser AI |

---

## ☁️ Infrastructure & APIs

```text
☁️ Cloudinary
🗄️ Aiven MySQL
📧 Gmail SMTP / SendGrid
🗺️ Geoapify
🌍 OpenStreetMap
🤖 Google Gemini
```

---

# 🗄️ Database Architecture

## Entity Relationship

```text
                         ┌───────────────┐
                         │    USERS      │
                         │   clients     │
                         └───────┬───────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 │               │               │
                 ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   PARKING    │ │   BOOKINGS   │ │  SOS ALERTS  │
        │    SLOTS     │ │              │ │              │
        └──────────────┘ └──────────────┘ └──────────────┘


                 ┌──────────────┐
                 │    ZONES     │
                 │ Crowd System │
                 └──────────────┘

                 ┌──────────────┐
                 │ LOST & FOUND │
                 └──────────────┘
```

---

# 📋 Core Database Models

## 👤 Users

```javascript
{
  client_id: INTEGER,
  name: STRING,
  email: STRING,
  password: STRING,
  phone: STRING,
  role: ENUM,
  profile_image: STRING
}
```

Roles:

```text
devotee
admin
host
volunteer
```

---

## 🅿️ Parking Slots

```javascript
{
  slot_id: INTEGER,
  host_id: INTEGER,
  title: STRING,
  address: TEXT,
  latitude: DECIMAL,
  longitude: DECIMAL,
  parkingType: ENUM,
  pricePerHour: FLOAT,
  totalSlots: INTEGER,
  availableSlots: INTEGER,
  images: JSON
}
```

---

## 🎟️ Bookings

```javascript
{
  booking_id: INTEGER,
  user_id: INTEGER,
  slot_id: INTEGER,
  vehicleNumber: STRING,
  startTime: DATE,
  endTime: DATE,
  totalAmount: FLOAT,
  qrCode: TEXT,
  status: ENUM
}
```

Statuses:

```text
CONFIRMED
CANCELLED
COMPLETED
```

---

## 🔎 Lost & Found

```javascript
{
  id: INTEGER,
  item_name: STRING,
  category: STRING,
  location_lost: STRING,
  date_lost: DATE,
  description: TEXT,
  contact_number: STRING,
  image_url: STRING,
  status: ENUM
}
```

---

## 🚨 SOS Alerts

```javascript
{
  id: INTEGER,
  user_id: INTEGER,
  user_name: STRING,
  user_phone: STRING,
  latitude: DECIMAL,
  longitude: DECIMAL,
  status: ENUM
}
```

---

## 📊 Zones

```javascript
{
  zone_id: INTEGER,
  name: STRING,
  maxCapacity: INTEGER,
  currentCount: INTEGER,
  densityLevel: ENUM
}
```

---

# 🔌 REST API

## 🔐 Authentication

### Register

```http
POST /api/v1/auth/register
```

```json
{
  "name": "Amit Manmode",
  "email": "devotee@example.com",
  "password": "SecurePassword123",
  "phone": "+919876543210"
}
```

---

### Login

```http
POST /api/v1/auth/login
```

```json
{
  "email": "devotee@example.com",
  "password": "SecurePassword123"
}
```

---

# 🅿️ Parking API

### Get Parking

```http
GET /api/v1/parking
```

### Create Parking Listing

```http
POST /api/v1/parking/host
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

### Book Parking

```http
POST /api/v1/parking/book
Authorization: Bearer <JWT_TOKEN>
```

```json
{
  "slot_id": 1,
  "vehicleNumber": "MP 13 AB 1234",
  "startTime": "2026-09-05T15:00:00.000Z",
  "endTime": "2026-09-05T18:00:00.000Z"
}
```

---

# 🔎 Lost & Found API

```http
POST /api/v1/lost-found
Content-Type: multipart/form-data
```

Example:

```text
item_name: "Gold Bracelet"
category: "Jewelry"
location_lost: "Triveni Sangam Ghat"
date_lost: "2026-09-05"
contact_number: "9876543210"
image: [File]
```

---

# 🚨 Emergency API

```http
POST /api/v1/location/sos
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

```json
{
  "latitude": 23.1765,
  "longitude": 75.7885
}
```

---

# 👑 Admin API

```http
GET /api/v1/admin/stats
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

Example:

```json
{
  "totalUsers": 1250,
  "totalBookings": 450,
  "activeSOSAlerts": 0,
  "crowdStatus": "NORMAL",
  "totalParkingEarnings": 22500
}
```

---

# 👁️ AI Vision Engine

## YOLOv8 Detection Pipeline

```python
import cv2
from ultralytics import YOLO

model = YOLO("yolov8s.pt")

cap = cv2.VideoCapture(0)

while cap.isOpened():

    ret, frame = cap.read()

    if not ret:
        break

    results = model(frame, classes=[0])

    headcount = len(results[0].boxes)

    cv2.putText(
        frame,
        f"Pilgrim Count: {headcount}",
        (20, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.imshow(
        "Divya Yatra Vision Guard",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
```

---

# 🔐 Security

Divya Yatra implements multiple security layers.

### 🔑 Authentication

JWT-based authentication with expiration checks.

### 🔒 Password Security

Passwords are hashed using Bcrypt.

### 🛡️ HTTP Security

Helmet provides secure HTTP headers.

### 🌐 CORS

Only approved frontend origins are allowed.

### 🚦 Rate Limiting

API requests are rate-limited to reduce abuse.

### 🗄️ SQL Injection Protection

Sequelize parameterized queries protect database operations.

### ☁️ Secret Management

Sensitive credentials are stored in environment variables.

> **Never commit `.env` files, API keys, database passwords, OAuth secrets, SMTP credentials or Cloudinary secrets to GitHub.**

---

# 🌐 Environment Configuration

Create a `.env` file inside the backend environment.

```env
# ==========================================
# DATABASE
# ==========================================

DB_MODE=local

DB_USER_LOCAL=root
DB_PASSWORD_LOCAL=YOUR_MYSQL_PASSWORD
DB_HOST_LOCAL=localhost
DB_PORT_LOCAL=3306
DB_NAME_LOCAL=ujjain


# ==========================================
# JWT
# ==========================================

JWT_SECRET=YOUR_JWT_SECRET
REFRESH_TOKEN_SECRET=YOUR_REFRESH_TOKEN_SECRET


# ==========================================
# SMTP
# ==========================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

ADMIN_EMAIL=admin@example.com


# ==========================================
# GOOGLE AUTH
# ==========================================

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET


# ==========================================
# GEMINI
# ==========================================

GEMINI_API_KEY=YOUR_GEMINI_API_KEY


# ==========================================
# SERP API
# ==========================================

SERP_API_KEY=YOUR_SERP_API_KEY


# ==========================================
# FRONTEND
# ==========================================

VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_API_URL=http://localhost:3001


# ==========================================
# GEOAPIFY
# ==========================================

GEOAPIFY_API_KEY=YOUR_GEOAPIFY_KEY


# ==========================================
# CLOUDINARY
# ==========================================

CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
```

---

# 🚀 Installation

## Prerequisites

Make sure you have installed:

```text
Node.js >= 18
MySQL >= 8
Python >= 3.10
Git
npm
```

---

# 1️⃣ Clone Repository

```bash
git clone https://github.com/Harsh-2006-git/SarthiX-HackSynapse.git

cd SarthiX-HackSynapse
```

---

# 2️⃣ Backend Setup

```bash
cd Backend

npm install
```

Create the database:

```bash
mysql -u root -p
```

Then:

```sql
CREATE DATABASE IF NOT EXISTS ujjain;
```

Exit MySQL:

```sql
exit;
```

Configure your `.env` file.

Then run:

```bash
npm run seed
```

Start backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:3001
```

---

# 3️⃣ Frontend Setup

Open another terminal:

```bash
cd Frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 4️⃣ AI Vision Engine

Navigate to:

```bash
cd Backend/AI_Core
```

Create virtual environment:

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv

source venv/bin/activate
```

Install dependencies:

```bash
pip install opencv-python ultralytics Flask pyttsx3 torch
```

Run:

```bash
python crowd_engine.py
```

---

# 📁 Project Structure

```text
SarthiX-HackSynapse/
│
├── 📄 README.md
├── 🔐 .env
│
├── Backend/
│   │
│   ├── 📄 index.js
│   │
│   ├── config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── parkingController.js
│   │   └── lostFoundController.js
│   │
│   ├── models/
│   │   ├── client.js
│   │   ├── parkingSlot.js
│   │   ├── booking.js
│   │   ├── LostFound.js
│   │   ├── SOSAlert.js
│   │   └── zone.js
│   │
│   ├── routes/
│   │
│   ├── middlewares/
│   │
│   ├── socket/
│   │
│   └── AI_Core/
│       ├── crowd_engine.py
│       └── yolov8s.pt
│
├── Frontend/
│   │
│   ├── vite.config.js
│   ├── index.html
│   │
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       │
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── Footer.jsx
│       │   ├── AIAssistant.jsx
│       │   └── SOSButton.jsx
│       │
│       ├── pages/
│       │   ├── index1.jsx
│       │   ├── auth.jsx
│       │   ├── FamilyMode.jsx
│       │   ├── MapPage.jsx
│       │   ├── LostAndFound.tsx
│       │   └── AdminPage.jsx
│       │
│       └── config/
│
└── assets/
    ├── hero.gif
    ├── darshan.gif
    ├── crowd-detection.gif
    ├── parking.png
    ├── family-mode.png
    ├── ai-assistant.gif
    ├── lost-found.png
    ├── sos.gif
    └── admin-dashboard.gif
```

---

# 🔄 Application Architecture

```text
                        🕉️ DIVYA YATRA
                              │
                              ▼
                   ┌────────────────────┐
                   │   ⚛️ REACT CLIENT   │
                   └─────────┬──────────┘
                             │
                    REST + WebSocket
                             │
                             ▼
                   ┌────────────────────┐
                   │  🚀 EXPRESS API    │
                   └─────────┬──────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
     🗄️ DATABASE         🤖 AI ENGINE       ⚡ SOCKET.IO
          │                  │                  │
          │                  ▼                  │
          │              👁️ YOLOv8             │
          │                  │                  │
          │                  ▼                  │
          │              📊 CROWD              │
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                             ▼
                      👑 ADMIN CONSOLE
```

---

# 📡 Data Flow

```text
USER ACTION
    │
    ▼
REACT UI
    │
    ▼
AXIOS
    │
    ▼
EXPRESS ROUTE
    │
    ▼
CONTROLLER
    │
    ▼
SEQUELIZE
    │
    ▼
MYSQL
    │
    ▼
RESPONSE
    │
    ▼
REACT UI
```

For real-time features:

```text
CLIENT
   │
   ▼
SOCKET.IO
   │
   ▼
NODE SERVER
   │
   ▼
EVENT BROADCAST
   │
   ├────► 👨‍👩‍👧 FAMILY
   │
   ├────► 👑 ADMIN
   │
   ├────► 🛡️ VOLUNTEERS
   │
   └────► 📊 MONITORING
```

---

# 🗺️ Roadmap

### ✅ Phase 1 — Core Platform

- [x] Authentication
- [x] Live Darshan
- [x] Virtual Queue
- [x] QR Pass
- [x] P2P Parking

### ✅ Phase 2 — Safety

- [x] Socket.IO
- [x] Family Mode
- [x] GPS Tracking
- [x] Geofencing
- [x] SOS Alerts

### ✅ Phase 3 — Intelligence

- [x] Gemini AI Assistant
- [x] Multilingual Support
- [x] Lost & Found
- [x] Live Search

### ✅ Phase 4 — Computer Vision

- [x] YOLOv8
- [x] Person Detection
- [x] Crowd Counting
- [x] Density Analysis
- [x] Evacuation Simulation

### 🔮 Phase 5 — Future

- [ ] 🚁 Drone Feed Integration
- [ ] 🧠 Edge AI Deployment
- [ ] 📡 Offline Gate Counting
- [ ] 📱 WhatsApp Bot
- [ ] 🎟️ WhatsApp QR Pass Delivery
- [ ] 📊 Advanced Predictive Crowd Analytics

---

# 🧪 Example Use Cases

## 👨‍👩‍👧 Family Pilgrimage

```text
Family arrives in Ujjain
          ↓
Create Family Group
          ↓
Set Safety Geofence
          ↓
Visit Temple
          ↓
Track Members Live
          ↓
Receive Alerts
          ↓
Complete Darshan Safely
```

---

## 🚗 Parking

```text
Pilgrim searches parking
          ↓
Nearby slots appear
          ↓
Compare prices
          ↓
Select parking
          ↓
Book
          ↓
Receive QR
          ↓
Navigate
```

---

## 🚨 Emergency

```text
Pilgrim presses SOS
          ↓
GPS captured
          ↓
Node.js receives alert
          ↓
Socket.IO broadcasts
          ↓
Admin receives alert
          ↓
Family receives notification
          ↓
Volunteer responds
```

---

## 👁️ Crowd Management

```text
Camera Feed
     ↓
YOLOv8
     ↓
Person Count
     ↓
Density Calculation
     ↓
Risk Classification
     ↓
Admin Dashboard
     ↓
Operational Response
```

---

# 🏆 Why This Project Matters

Divya Yatra is not just a travel website.

It is designed as a **digital infrastructure layer for mega pilgrimages**.

```text
                 🕉️ PILGRIM
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
       🤖 AI       🛡️ SAFETY     🗺️ MOBILITY
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
               📊 INTELLIGENCE
                     │
                     ▼
             🚨 EVENT RESPONSE
                     │
                     ▼
                🕉️ SAFE YATRA
```

### Our core philosophy

> **Technology should disappear into the experience while safety, accessibility and convenience remain visible.**

---

# 🤝 Contributing

Contributions are welcome!

### 1. Fork the repository

```bash
git fork
```

### 2. Create a branch

```bash
git checkout -b feature/AmazingFeature
```

### 3. Make your changes

```bash
git add .
```

### 4. Commit

```bash
git commit -m "Add AmazingFeature"
```

### 5. Push

```bash
git push origin feature/AmazingFeature
```

### 6. Open a Pull Request

---

# ⚠️ Security Notice

This repository uses environment variables for sensitive configuration.

**Never commit:**

```text
.env
API Keys
JWT Secrets
OAuth Secrets
SMTP Passwords
Cloudinary Secrets
Database Passwords
Private Certificates
```

Add this to `.gitignore`:

```gitignore
.env
.env.*
!.env.example

node_modules/
venv/
__pycache__/

*.pem
*.key

dist/
build/
```

---

# 📜 License

This project is distributed under the **ISC License**.

---

# 🙏 Acknowledgments

Special thanks to:

- 🏆 HackSynapse 2026
- 🤖 Google Gemini
- 👁️ Ultralytics YOLO
- ⚛️ React
- ⚡ Vite
- 🚀 Express.js
- 🗄️ MySQL
- 🔌 Socket.IO
- 🗺️ OpenStreetMap
- 📍 Geoapify
- ☁️ Cloudinary
- 🐍 Python & OpenCV
- ❤️ Open-source contributors

---

# 👨‍💻 Team SarthiX

<div align="center">

### 🕉️ **DIVYA YATRA | SARTHIX**

**Built with ❤️, ☕ and 🕉️**

### *For Devotees. For Families. For Safer Pilgrimages.*

<br/>

```text
        🕉️
       /   \
      /     \
   🙏       🙏
      DIVYA
      YATRA
   SARTHIX
```

<br/>

**HackSynapse 2026**

<br/>

⭐ **If you like this project, give it a star!**

</div>
