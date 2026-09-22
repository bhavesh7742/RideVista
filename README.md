# RideVista: Premium City Vehicle Rental & Driver-Tour Coordination

RideVista is a full-featured, startup-grade MERN stack application designed for placement demonstrations. It bridges local vehicle rental companies, tourist users, and independent driver-pilots to offer a seamless, self-managed city tourism experience.

---

## 🚀 Key Features
- **Tourist Dashboard**: Real-time fleet booking, flight search, tour guide request tracking, and booking history logs.
- **Rental Business Portal**: Complete fleet management (add, edit, toggle availability), pilot onboarding (approve/reject/manage drivers), booking tracking, and business stats.
- **Driver Pilot Portal**: Accept/reject assigned tourist ride requests, track trip status, and update availability.
- **Admin Command Center**: System-wide dashboard overview, verification queue for new agencies, user management (tourists/drivers/businesses), global booking audit log, feedback manager, and system charts.
- **City Travel Assistant**: Powered by Google Gemini AI with sequential model fallback support to provide guides, itineraries, and localized travel advice.

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas connection string

### 2. Backend Configuration
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   GEMINI_API_KEY=your_gemini_api_key

   # Cloudinary config (for image uploads)
   CLOUDINARY_URL=your_cloudinary_url
   ```
3. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```

### 3. Frontend Configuration
1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Create a `.env` file (Optional - defaults to localhost:5000):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```

### 4. Database Seeding
To populate the database with mock Indian travel data:
```bash
cd backend
npm run seed
```

---

## 🌐 Production Deployment Guide

This guide details how to deploy the **Backend on Render** and the **Frontend on Vercel**.

### Part 1: Backend Deployment on Render

1. Sign in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New** -> **Web Service**.
3. Connect your Git repository containing the RideVista project.
4. Set the following settings:
   - **Name**: `ridevista-api` (or any custom name)
   - **Region**: Select the region closest to your database hosting
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** and add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default, Render sets this automatically)
   - `MONGO_URI`: *Your MongoDB connection string*
   - `JWT_SECRET`: *A secure random string*
   - `GEMINI_API_KEY`: *Your Google AI Studio Gemini API Key*
   - `CLOUDINARY_URL`: *Your Cloudinary connection URL*
6. Click **Create Web Service**. Once the build succeeds, copy the provided Web Service URL (e.g. `https://ridevista-api.onrender.com`).

---

### Part 2: Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your Git repository.
4. Set the following settings:
   - **Framework Preset**: `Vite` or `Other`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: *Your Render backend URL* (e.g. `https://ridevista-api.onrender.com`) followed by `/api` (e.g. `https://ridevista-api.onrender.com/api`)

   > [!IMPORTANT]
   > **Do not forget the `/api` suffix!** The URL must look like `https://your-app.onrender.com/api`. If you omit `/api`, frontend API requests will fail with `404 Not Found` errors.
6. Click **Deploy**.

> [!NOTE]
> The repository includes a `frontend/vercel.json` file. This handles automatic routing rewrites for single-page React router routes, preventing `404 Not Found` errors when refreshing dashboard pages.

---

## ☁️ AWS Production Deployment

RideVista is deployed as a **single unified Docker container** on AWS using ECS Fargate, with the React frontend production build served directly by the Express backend.

### 🚀 Live Demo

[![RideVista Application](./ridevista-alb.png)](http://ridevista-app-alb-402262070.ap-south-1.elb.amazonaws.com/)

**Live URL:** http://ridevista-app-alb-402262070.ap-south-1.elb.amazonaws.com/

---

### Architecture

```
Internet
   ↓
AWS Application Load Balancer  (ridevista-app-alb)
   ↓
Amazon ECS Fargate  (ridevista-cluster / ridevista-service)
   ↓
Single Docker Container  [port 5000]
   ├── React frontend production build  (served as static files by Express)
   └── Node.js / Express backend
        ↓
   MongoDB Atlas  (cloud database)
        ↓
   Gemini API  (AI city travel assistant)
```

All frontend routes (`/`, `/dashboard`, `/login`, etc.) are handled client-side by React Router. API routes (`/api/*`) are handled by Express. There is no Nginx in this deployment — Express does it all.

---

### AWS Infrastructure

| Resource | Value |
|---|---|
| **AWS Region** | `ap-south-1` (Mumbai) |
| **Amazon ECR** | Docker image repository |
| **Amazon ECS** | Fargate (serverless containers) |
| **ECS Cluster** | `ridevista-cluster` |
| **ECS Service** | `ridevista-app-service` |
| **Application Load Balancer** | `ridevista-app-alb` |
| **Target Group** | `ridevista-app-tg` |
| **Container Port** | `5000` |
| **Health Check Endpoint** | `/api/health` |
| **Database** | MongoDB Atlas |
| **AI** | Google Gemini API |
| **Logs** | Amazon CloudWatch |

---

### Deployment Flow

```
Local code changes
   → docker buildx build --platform linux/amd64 -t ridevista-app:latest .
   → docker push  →  Amazon ECR
   → ECS Fargate pulls new image  →  Runs container on port 5000
   → Application Load Balancer routes traffic
   → Live application
```

### Deploying a New Version

```bash
# 1. Authenticate Docker with ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

# 2. Build image for linux/amd64 (required for ECS Fargate)
docker buildx build --platform linux/amd64 -t ridevista-app:latest .

# 3. Tag and push to ECR
docker tag ridevista-app:latest \
  <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/ridevista-backend:latest

docker push \
  <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/ridevista-backend:latest

# 4. Force ECS to pull the new image
aws ecs update-service \
  --cluster ridevista-cluster \
  --service ridevista-service \
  --force-new-deployment \
  --region ap-south-1
```

### Required ECS Task Environment Variables

The following environment variables must be set in the ECS Task Definition (never commit secrets to Git):

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://bhaveshsiwana2004:Bhavesh5708@codtech-projects.1lgwrqw.mongodb.net/ridevista
JWT_SECRET=Bhavesh_ridevista_2026_jodhpur
GEMINI_API_KEY=<your Google AI Studio key>
CLOUDINARY_URL=cloudinary://965745895182663:gK-ctUW2uB_CTbuFfL1vNp6sh1M@of3mnmu3
```