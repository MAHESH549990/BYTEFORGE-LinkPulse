# 🔗 LinkPulse — Smart URL Shortener & Link Management Platform

LinkPulse is a full-stack web application that allows users to create and manage short URLs, track link performance, and organize links through campaigns. It provides an authenticated dashboard for managing links and monitoring engagement, while shared short links are designed to redirect visitors to their original destinations without requiring them to log in.

🌐 **Live Demo:** https://linkpulse-es6s.onrender.com

💻 **GitHub Repository:** https://github.com/MAHESH549990/LinkPulse

---

## 📌 Overview

Long URLs can be difficult to share, manage, and track. LinkPulse aims to solve this problem by providing a simple platform for generating short links and monitoring their performance.

Users can create an account, access their dashboard, manage their links, and view click statistics. The campaign feature helps organize links into groups for easier management.

The project was built to practice full-stack web development, authentication, database integration, RESTful routing, and deployment.

## ✨ Features

- **User Authentication:** Register, log in, and log out securely.
- **URL Shortening:** Create shorter links for long destination URLs.
- **Link Management:** View and manage links associated with the logged-in user.
- **Click Tracking:** Track the number of clicks received by links.
- **Dashboard Analytics:** View total links, total clicks, recent links, and campaign counts.
- **Campaign Management:** Organize and manage links through campaigns.
- **Public Link Redirection:** Shared short links should redirect visitors without requiring a LinkPulse account.
- **User Profile:** Access user profile information.
- **Persistent Database:** Store user accounts, links, and campaign data in MongoDB.
- **Cloud Deployment:** Access the application online through Render.

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- Bootstrap
- EJS (Embedded JavaScript Templates)

### Backend

- Node.js
- Express.js
- Passport.js
- Passport Local Strategy
- Express Session
- Connect Flash

### Database

- MongoDB
- Mongoose
- MongoDB Atlas

### Tools & Deployment

- Git
- GitHub
- Visual Studio Code
- Render

## ⚙️ How It Works

1. A user registers or logs in to LinkPulse.
2. The user opens the dashboard to manage their links.
3. The user creates a short link for a destination URL.
4. LinkPulse stores the link and its associated information in MongoDB.
5. The user shares the generated short URL.
6. A visitor opens the short URL and is redirected to the destination without needing to log in.
7. LinkPulse records the visit and updates the link's click count.
8. The dashboard displays link statistics to help the user monitor engagement.

## 📊 Dashboard

The dashboard provides an overview of link activity, including:

- Total links created by the user
- Total clicks across the user's links
- Recent links
- Total campaigns

These statistics help users understand how their links are performing.

## 🚀 Getting Started

Follow these steps to run LinkPulse locally.

### Prerequisites

Install the following before starting:

- [Node.js](https://nodejs.org/)
- npm or Yarn
- A MongoDB database, such as [MongoDB Atlas](https://www.mongodb.com/atlas)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/MAHESH549990/LinkPulse.git
cd LinkPulse
```

### 2. Install dependencies

Using npm:

```bash
npm install
```

Or using Yarn:

```bash
yarn install
```

### 3. Configure environment variables

Create a `.env` file in the project's root directory.

Add the environment variables required by your application:

```env
ATLAS_URI=your_mongodb_connection_string
SECRET=your_long_random_session_secret
```

Replace the example values with your own configuration.

**Important:** Never commit your `.env` file or expose your database credentials and session secret in a public repository.

### 4. Start the application

Use the start command defined in your `package.json`. If the application entry point is `index.js` and no start script is configured, run:

```bash
node index.js
```

Open the local URL shown by your server. For example:

```text
http://localhost:8080
```

The actual port depends on your application's configuration.

## 🔐 Authentication & Security

LinkPulse uses Passport.js for local authentication and Express sessions to maintain login state.

- Authentication protects private dashboard and link-management operations.
- Public short-link redirection should remain accessible without login.
- Environment variables are used for database credentials and session secrets.
- Protected routes should verify that users can only manage their own links.

## ☁️ Deployment

LinkPulse is deployed on Render and uses MongoDB Atlas for cloud database storage.

- **Live Application:** https://linkpulse-es6s.onrender.com
- **Source Code:** https://github.com/MAHESH549990/LinkPulse

When deploying your own instance, configure the required environment variables in your hosting provider and ensure the server listens on the port supplied by the hosting platform.

## 📁 Project Structure

The application uses a modular Express structure. The main files and folders include:

```text
LinkPulse/
├── backend/
│   ├── dashboard.js
│   ├── userOperations.js
│   └── adminroute.js
├── middleware/
│   └── userMiddleware.js
├── models/
│   ├── user.js
│   ├── link.js
│   ├── Campaign.js
│   └── init.js
├── public/
├── views/
│   └── routes/
├── utils/
├── scripts/
├── index.js
├── package.json
└── README.md
```

_Note: This is an overview of the known project structure. Your repository may contain additional files or folders._

## 🎯 Learning Outcomes

Building LinkPulse helped me practice:

- Developing a full-stack application using Node.js and Express.js
- Creating server-rendered interfaces with EJS and Bootstrap
- Implementing user authentication using Passport.js
- Designing MongoDB schemas and working with Mongoose
- Building route handlers and reusable middleware
- Tracking link engagement with database queries
- Managing environment variables and application configuration
- Deploying a Node.js application and connecting it to MongoDB Atlas

## 🔮 Future Improvements

Potential enhancements for future versions include:

- QR code generation for short links
- Custom short URLs
- Link expiration and deactivation
- Advanced analytics and charts
- Campaign-level click analytics
- Improved URL validation and abuse prevention
- Rate limiting and additional security protections
- Unit and integration tests

## 👨‍💻 Team Members

LinkPulse was developed collaboratively by our team:

- **Ashi Gupta**(Team Leader)
- **Kartik Kumar**
- **Mahesh Bhatt** — [GitHub](https://github.com/MAHESH549990)
- **Neeraj Joshi** --[GitHub](https://github.com/svg185)

### 🔗 Project Repository

[LinkPulse on GitHub](https://github.com/MAHESH549990/LinkPulse)

### 🌐 Live Demo

https://linkpulse-es6s.onrender.com

⭐ If you find this project useful, consider giving the repository a star.
