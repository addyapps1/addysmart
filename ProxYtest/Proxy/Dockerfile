FROM nginx:alpine

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the HTML files
COPY index.html /usr/share/nginx/html/index.html
COPY custom_error.html /usr/share/nginx/html/custom_error.html

# Expose port 80 to the outside
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
