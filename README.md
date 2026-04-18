<div align="center">

```
██╗     ██╗   ██╗███╗   ███╗██╗███████╗██████╗ ███████╗
██║     ██║   ██║████╗ ████║██║██╔════╝██╔══██╗██╔════╝
██║     ██║   ██║██╔████╔██║██║█████╗  ██████╔╝█████╗  
██║     ██║   ██║██║╚██╔╝██║██║██╔══╝  ██╔══██╗██╔══╝  
███████╗╚██████╔╝██║ ╚═╝ ██║██║███████╗██║  ██║███████╗
╚══════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
```

### ✈️ *Discover the World, One Journey at a Time*

---

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blueviolet?style=for-the-badge)](https://opensource.org/licenses/ISC)

</div>

---

## ✈️ Demo

<div align="center">

<table>
<tr>
<td align="center" width="50%">

**✈️ Flight Button**

<video src="https://github.com/user-attachments/assets/30d2becb-6617-4d2e-8ccb-ae9770ba2062" controls autoplay loop muted width="340"></video>

</td>
<td align="center" width="50%">

**📬 Contact Button**

<video src="https://github.com/user-attachments/assets/5c8ec3e0-f68b-4db8-a048-ebe38d491238" controls autoplay loop muted width="340"></video>

</td>
</tr>
</table>

</div>

---

## 🌍 What is Lumiere?

**Lumiere** is a full-stack, database-driven **travel booking & tours management system**. Users can explore beautiful destinations, make bookings, and manage their trips — all from a sleek, modern interface. Admins get a powerful dashboard to control bookings, users, and the destination catalog in real time.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 👤 User Features
- 🔐 Secure Login & Registration
- 🗺️ Browse dynamic tour catalog
- 📅 Book destinations with date & guests
- 📋 Personal dashboard for managing bookings
- ❌ Cancel pending reservations in one click

</td>
<td width="50%">

### 🛡️ Admin Features
- 🔑 Protected admin portal
- 📊 Live stats — Users, Bookings & Revenue
- ✅ Confirm or cancel user bookings
- ➕ Add new travel destinations to the catalog
- 📈 Full bookings overview table

</td>
</tr>
</table>

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js v5 |
| **Database** | MySQL 2 |
| **Templating** | EJS |
| **Authentication** | JWT + bcrypt.js |
| **Styling** | Tailwind CSS v4 + Flowbite |
| **Config** | dotenv |

---

## 📁 Project Structure

```
Lumiereeee/
├── 📄 index.js          # Main Express app & all route handlers
├── 🔌 db.js             # MySQL database connection
├── 🌐 index.html        # Homepage
├── ⚙️  .env             # Environment variables (not committed)
│
├── 📂 Pages/
│   ├── login.html       # User login page
│   ├── register.html    # User registration page
│   ├── dashboard.html   # User bookings dashboard
│   ├── tours.html       # Dynamic tour catalog
│   ├── 📂 tours/        # Individual destination detail pages
│   └── 📂 admin/
│       ├── adminlogin.html  # Admin login
│       └── adminpage.html   # Admin control panel
│
├── 📂 images/           # Destination & site images
└── 📂 styles/           # Global CSS & Tailwind output
```

---

## 🚀 Getting Started

### Prerequisites

- ![Node](https://img.shields.io/badge/-Node.js_v18+-339933?logo=nodedotjs&logoColor=white&style=flat-square) installed
- ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white&style=flat-square) running locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/SkullGAMERSS/Lumiereeee.git
cd Lumiereeee
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up the Database

Create a MySQL database named `lumiere` and ensure the following tables exist:

```sql
-- Core tables required
users, admin, destinations, bookings
```

### 4️⃣ Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=lumiere
JWT_SECRET=your_jwt_secret_key
```

> ⚠️ **Never commit your `.env` file.** It contains sensitive credentials.

### 5️⃣ Start the Server

```bash
node index.js
```

🌐 Open your browser and visit: **[http://localhost:5000](http://localhost:5000)**

---

## 🔑 API Endpoints

<details>
<summary><b>🔓 Auth Routes</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | User login |
| `GET`  | `/api/auth/logout` | User logout |
| `POST` | `/api/auth/admin/login` | Admin login |
| `GET`  | `/api/auth/admin/logout` | Admin logout |

</details>

<details>
<summary><b>📦 Booking Routes</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bookings` | Create a new booking |
| `POST` | `/api/bookings/:id/cancel` | Cancel a booking |

</details>

<details>
<summary><b>🛡️ Admin Routes</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/bookings/:id/confirm` | Confirm a booking |
| `POST` | `/api/admin/bookings/:id/cancel` | Cancel any booking |
| `POST` | `/api/admin/destinations` | Add a new destination |

</details>

---

## 👨‍💻 Authors & Collaborators

<div align="center">

**Vishwakshenan Srinivasan** · [@vishwakshenansrinivasan](https://github.com/vishwakshenansrinivasan)
**Jishnu Priyan** . [@rdjishnu](https://github.com/rdjishnu).

*Built with ❤️ and a lot of ☕*

---

⭐ *If you like this project, drop a star on the repo!* ⭐

</div>
