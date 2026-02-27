FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start development server, binding to 0.0.0.0 for Docker accessibility
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
