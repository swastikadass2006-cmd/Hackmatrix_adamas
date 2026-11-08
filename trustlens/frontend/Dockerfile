FROM node:18-alpine

WORKDIR /app

# Install dependencies in a cache-friendly layer.
# node_modules will be installed inside the container; the volume mount below
# will NOT override them because of the anonymous volume defined in compose.
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install --legacy-peer-deps

# Copy the rest of the source (overridden at runtime by the volume mount).
COPY . .

EXPOSE 3000

# Bind to 0.0.0.0 so that Docker port-mapping exposes the dev server to the host.
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
