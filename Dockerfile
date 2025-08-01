# Build step
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY .npmrc ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:1.25-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -q --spider http://localhost || exit 1

USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
