FROM nginxinc/nginx-unprivileged:latest

# Remove the default NGINX config file
RUN rm /etc/nginx/conf.d/default.conf

# Copy the nginx config
COPY conf/nginx.conf /etc/nginx/conf.d/

# Copy built app to nginx public directory
COPY content /usr/share/nginx/html

USER 10014

# Expose port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
