# ----- BUILD STAGE -----
FROM node:18-slim AS build-stage

WORKDIR /app

# Copy package.json and package-lock.json/yarn.lock for optimal caching
COPY package*.json ./

RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# ----- RUN STAGE -----
FROM nginxinc/nginx-unprivileged:latest

# Remove the default NGINX config file
RUN rm /etc/nginx/conf.d/default.conf

# Copy the nginx config
COPY conf/nginx.conf /etc/nginx/conf.d/

# Copy built app to nginx public directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

USER 10014

# Expose port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
