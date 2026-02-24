# Skill Swap

**Skill Swap** is a full-stack web application that enables users to exchange skills and knowledge within a connected community.  
Users can register, showcase their skills, find others to collaborate or learn from, and grow together — creating a network of mutual learning.

---

## Tech Stack

| Area | Technologies Used |
|------|-------------------|
| **Frontend** | React (Vite) ⚡, TailwindCSS 🎨, React Router DOM |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (via Mongoose ODM) |
| **Authentication** | JSON Web Tokens (JWT) |
| **Other Tools** | ESLint, Axios, Vite |

---

## Key Features

 **User Authentication** — Secure signup/login using JWT  
 **User Profiles** — Showcase skills, learning interests, and achievements  
 **Skill Search** — Find people with specific skills you want to learn  
 **Skill Exchange System** — Request swaps and collaborate  
 **Dashboard** — View and manage all your active skill swaps  
 **Responsive UI** — Built with TailwindCSS for seamless design  

---

## Installation and Setup

Follow these steps to run the project locally 👇

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/skill-swap.git
cd skill-swap
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create Environment File

Create a `.env` file in the root directory with your configuration:

```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5001
```

### 4️⃣ Start the Backend Server

```bash
node server.js
```

or (for auto-restart during development)

```bash
npx nodemon server.js
```

### 5️⃣ Start the Frontend

```bash
npm run dev
```

Your app will be available at 👉 **[http://localhost:5173](http://localhost:5173)**
Backend runs on 👉 **[http://localhost:5001](http://localhost:5001)**

---

## Project Structure

```
skill-swap/
├── middleware/         # Authentication and validation middleware
├── models/             # MongoDB schema definitions
├── routes/             # API endpoints (auth, users, skills, etc.)
├── public/             # Static assets
├── src/                # React frontend (pages, components, contexts)
├── server.js           # Express backend entry point
├── package.json        # Project dependencies and scripts
├── .env                # Environment variables (ignored in Git)
├── .gitignore          # Ignored files and folders
└── README.md
```

---

## Future Enhancements

* Chat or messaging system between users
* Skill categories and tagging
* Ratings and reviews for skill exchanges
* Scheduling system for meetups

---

## Contributors

 **<Sanjana S Aithal>**
 [[sanjanaaithal28@gmail.com](mailto:sanjanaaithal28@gmail.com)]
 [https://www.linkedin.com/in/sanjana-s-aithal-7aaa59337/]

 **<Sameeksha P Kumar>**
 [[sameekshakumar03@gmail.com](mailto:sameekshakumar03@gmail.com)]

 **<Sejal Siddapuram>**
 [[sejal.siddapuram@gmail.com](mailto:sejal.siddapuram@gmail.com)]

---

## License

This project is licensed under the **MIT License** — feel free to use and modify it.

---

### “Learn. Teach. Grow Together.”

> Skill Swap — because everyone has something valuable to share. 🌱

