# Stage 1: Build the frontend
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY ../package*.json ./
RUN npm ci

# Copy the rest of the frontend code and build
COPY ../ ./
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: copy custom nginx config if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
