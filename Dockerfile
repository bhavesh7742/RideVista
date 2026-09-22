# ── Stage 1: Build the Frontend [dist folder] ───────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build (Vite outputs to /app/dist)
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build the Backend ───────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy backend package files and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source code
COPY backend/ ./

# Copy dist folder content from frontend-builder into Backend public folder
COPY --from=frontend-builder /app/dist /app/public

EXPOSE 5000


# Run node directly as PID 1 for proper SIGTERM signal handling
CMD ["node", "server.js"]
