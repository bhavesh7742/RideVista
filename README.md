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

## ☁️ AWS Production Deployment

RideVista is deployed as a **single unified Docker container** on AWS using ECS Fargate. The React frontend production build is bundled into the Docker image and served directly by the Express backend as static files — no separate frontend hosting service is required.

**AWS Region:** `ap-south-1` (Mumbai)

---

### 🚀 Live Demo

[![RideVista Application](./ridevista-alb.png)](http://ridevista-app-alb-402262070.ap-south-1.elb.amazonaws.com/)

**Live URL:** http://ridevista-app-alb-402262070.ap-south-1.elb.amazonaws.com/

---

### Architecture Overview

```
Internet
   |
   v
Internet-facing Application Load Balancer  (ridevista-app-alb)  :80
   |
   v
Target Group  (ridevista-app-tg)  IP type
   |
   +-------------------------------+
   |                               |
   v                               v
ECS Fargate Task              ECS Fargate Task
Private Subnet (AZ-a)         Private Subnet (AZ-b)
port 5000                     port 5000
   |                               |
   +---------------+---------------+
                   |
                   v
             NAT Gateway
                   |
                   v
          Internet Gateway
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
 MongoDB Atlas  Cloudinary  Gemini API
```

The React frontend production build and all `/api/*` endpoints are served by the same Express application inside the container. There is no Nginx and no separate frontend hosting service.

---

### AWS Infrastructure Summary

| Component | Resource / Value | Purpose |
|---|---|---|
| **AWS Region** | `ap-south-1` (Mumbai) | All resources deployed here |
| **Amazon ECR** | `ridevista-backend` repository | Private Docker image registry |
| **ECS Cluster** | `ridevista-cluster` | Logical grouping of ECS workloads |
| **ECS Service** | `ridevista-app-service` | Maintains running tasks, integrates with ALB |
| **ECS Task Definition** | Blueprint for the container | Image, port, env vars, CPU/memory, logging |
| **Compute** | AWS Fargate | Serverless — no EC2 instances to manage |
| **ALB** | `ridevista-app-alb` | Internet-facing load balancer, HTTP :80 |
| **Target Group** | `ridevista-app-tg` | IP type, port 5000, `/api/health` health check |
| **Container Port** | `5000` | Express listens on this port |
| **VPC** | Custom VPC | Isolated network for all AWS resources |
| **Public Subnets** | `ap-south-1a`, `ap-south-1b` | ALB and NAT Gateway placement |
| **Private Subnets** | `ap-south-1a`, `ap-south-1b` | ECS Fargate tasks — no public IPs |
| **NAT Gateway** | In public subnet | Outbound internet for private ECS tasks |
| **Database** | MongoDB Atlas | External managed cloud database |
| **Image Storage** | Cloudinary | External CDN for vehicle/driver images |
| **AI** | Google Gemini API | City travel assistant |
| **Logs** | Amazon CloudWatch | Container stdout/stderr log streaming |

---

### 1. Docker and Amazon ECR

Amazon ECR (Elastic Container Registry) is the private Docker image registry used in this deployment. ECS Fargate pulls the container image from ECR when starting a task. ECR stores versioned images and integrates natively with ECS without additional authentication configuration at runtime.

The image is built for `linux/amd64` because ECS Fargate runs Linux containers on x86-64 hardware. Building without specifying the platform on an ARM machine (e.g., Apple Silicon or some Windows setups) produces an image that fails with `exec format error` on ECS.

**Manual image deployment workflow:**

```bash
# Step 1 — Authenticate Docker client with your ECR registry
# This generates a temporary ECR login token (valid 12 hours)
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

# Step 2 — Build the image targeting linux/amd64
# The multi-stage Dockerfile compiles the React frontend (Vite) in Stage 1
# and packages it with the Express backend in Stage 2.
docker buildx build --platform linux/amd64 -t ridevista-app:latest .

# Step 3 — Tag the local image with the full ECR repository URI
docker tag ridevista-app:latest \
  <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/ridevista-backend:latest

# Step 4 — Push the image to ECR
docker push \
  <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/ridevista-backend:latest

# Step 5 — Trigger a rolling deployment on ECS
# ECS pulls the new image from ECR, starts a new task,
# waits for the ALB health check to pass, then stops the old task.
aws ecs update-service \
  --cluster ridevista-cluster \
  --service ridevista-app-service \
  --force-new-deployment \
  --region ap-south-1
```

---

### 2. ECS Cluster

**Cluster:** `ridevista-cluster`

An ECS Cluster is the logical grouping of ECS services and tasks. This cluster uses **AWS Fargate** as the compute capacity provider. Fargate is serverless — there are no EC2 worker nodes to provision, patch, or scale. AWS manages the underlying infrastructure; you only define what the container needs (CPU, memory, image).

---

### 3. ECS Task Definition

The Task Definition is the **blueprint** that describes how the RideVista container should run.

| Configuration | Value |
|---|---|
| **Container image** | ECR URI (`ridevista-backend:latest`) |
| **Container port** | `5000` |
| **Network mode** | `awsvpc` (required for Fargate) |
| **Logging** | Amazon CloudWatch Logs |
| **Environment variables** | Set in Task Definition (see below) |

**Key concepts:**

| Term | Meaning |
|---|---|
| **Task Definition** | Blueprint — how the container should run |
| **Task** | One running instance of a Task Definition |
| **Service** | Maintains the desired number of running Tasks |

**Environment variables** (set in Task Definition — never in source code or Git):

```
NODE_ENV=production
PORT=5000
MONGO_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<your JWT secret key>
GEMINI_API_KEY=<your Google AI Studio key>
CLOUDINARY_URL=<your Cloudinary URL>
```

---

### 4. ECS Service

**Service:** `ridevista-app-service`

The ECS Service is responsible for:
- Launching tasks from the Task Definition
- Maintaining the desired number of running tasks
- Automatically replacing failed or unhealthy tasks
- Integrating with the ALB Target Group so the load balancer routes traffic only to healthy tasks
- Performing rolling deployments — a new task starts and passes health checks before the old task is stopped, ensuring zero downtime

**Current deployment:** 1 running task (single-task configuration).

#### Recommended Production Configuration

For higher availability, running **2 tasks across 2 Availability Zones** is recommended:

```
Desired tasks: 2
  Task 1 → Private Subnet ap-south-1a
  Task 2 → Private Subnet ap-south-1b
```

This ensures the application remains available even if one Availability Zone experiences an issue.

---

### 5. ECS Service Auto Scaling

> **Note:** Auto scaling is not currently configured. The following describes the recommended setup.

Because this application runs on **Fargate**, the appropriate scaling mechanism is **ECS Service Auto Scaling** — not an EC2 Auto Scaling Group.

**How ECS Service Auto Scaling works:**

```
ECS Service Auto Scaling
    ↓
changes desired task count
    ↓
Fargate launches or stops tasks automatically
```

**Recommended configuration:**

| Setting | Value |
|---|---|
| Minimum tasks | 2 |
| Desired tasks | 2 |
| Maximum tasks | 4 |
| Scaling metric | Average CPU utilization |

**Important distinction for AWS interviews:**

| | EC2 Auto Scaling Group | ECS Service Auto Scaling |
|---|---|---|
| **Scales** | EC2 instances | ECS Tasks |
| **Uses** | Launch Template | Task Definition |
| **Launch type** | ECS EC2 mode | ECS Fargate ✅ |
| **Infrastructure** | You manage EC2 nodes | AWS manages infrastructure |

---

### 6. VPC and Subnet Architecture

```
VPC
 |
 +-- Public Subnets (ap-south-1a, ap-south-1b)
 |      |
 |      +-- Internet-facing ALB
 |      +-- NAT Gateway
 |                        \
 |                   Internet Gateway
 |
 +-- Private Subnets (ap-south-1a, ap-south-1b)
        |
        +-- ECS Fargate Task 1  (ap-south-1a)
        +-- ECS Fargate Task 2  (ap-south-1b)
```

| Subnet type | Used for | Internet route |
|---|---|---|
| **Public** | ALB, NAT Gateway | Direct route to Internet Gateway |
| **Private** | ECS Fargate tasks | No direct inbound route — tasks have no public IPs |

ECS tasks in private subnets can still reach the internet (MongoDB Atlas, Cloudinary, Gemini API) via the NAT Gateway.

---

### 7. NAT Gateway

The NAT Gateway sits in a **public subnet** and allows ECS tasks in **private subnets** to make outbound internet connections — without exposing the tasks directly to inbound internet traffic.

**Outbound flow from a private ECS task:**

```
ECS Fargate task (private subnet)
    ↓
Private route table  →  NAT Gateway
    ↓
Internet Gateway
    ↓
MongoDB Atlas / Cloudinary / Gemini API
```

| Component | Direction | Traffic |
|---|---|---|
| **ALB** | Inbound | User → application |
| **NAT Gateway** | Outbound | Application → external APIs/services |

Without the NAT Gateway, private ECS tasks cannot reach MongoDB Atlas, Cloudinary, or the Gemini API.

---

### 8. Application Load Balancer

**ALB:** `ridevista-app-alb` — Internet-facing, HTTP listener on port **80**

The ALB is the single stable public endpoint for the application. Its DNS name does not change when tasks restart or new tasks are deployed.

```
User
 ↓
ALB :80
 ↓
Listener rule (forward all)
 ↓
Target Group  →  Fargate Task :5000
```

---

### 9. Target Group

**Target Group:** `ridevista-app-tg`

| Setting | Value |
|---|---|
| **Target type** | IP |
| **Target port** | `5000` |
| **Health check path** | `/api/health` |

The target type is **IP** because Fargate tasks use `awsvpc` networking — each task gets its own private IP address and network interface. The ALB forwards traffic directly to `<task-private-IP>:5000`.

The ALB periodically sends a GET request to `/api/health` on each registered task IP. Tasks that return a `200 OK` response receive traffic. Tasks that fail health checks are removed from rotation until they recover.

---

### 10. Security Groups

Two security groups control network access:

**ALB Security Group**

| Rule | Protocol | Port | Source |
|---|---|---|---|
| Inbound | TCP | 80 | `0.0.0.0/0` (public internet) |

**ECS Task Security Group**

| Rule | Protocol | Port | Source |
|---|---|---|---|
| Inbound | TCP | 5000 | ALB Security Group |

The ECS task security group allows inbound traffic on port 5000 **only from the ALB security group** — not from the public internet. Container port 5000 is never directly accessible from outside AWS.

```
Internet
   ↓  (TCP 80)
ALB Security Group
   ↓
ALB
   ↓  (TCP 5000, source = ALB SG)
ECS Task Security Group
   ↓
Container :5000
```

---

### 11. Full Runtime Request Flow

```
User Browser
    ↓  HTTP
Internet
    ↓
Application Load Balancer :80
    ↓
ALB Listener → forward rule
    ↓
Target Group (ridevista-app-tg)
    ↓
Healthy Fargate Task  <private-ip>:5000
    ↓
Node.js / Express
    ├── GET /            → serve React index.html (SPA entry point)
    ├── GET /assets/*    → serve compiled React JS/CSS bundles
    └── /api/*           → Express route handlers
                              ↓
                     MongoDB Atlas  (database queries)
                     Cloudinary     (image uploads/retrieval)
                     Gemini API     (AI travel assistant)
                              ↓
                        JSON response
    ↓
Fargate Task
    ↓
ALB
    ↓
User Browser
```

The React frontend production build (`/app/public/`) and the Express API (`/api/*`) are served by the same Node.js process inside the same container. The Express SPA fallback middleware returns `index.html` for any non-API GET request, allowing React Router to handle client-side navigation.