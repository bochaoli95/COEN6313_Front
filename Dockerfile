FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build argument for API base URL
# This will be overridden by docker-compose.yml build args
ARG VITE_API_BASE_URL=http://20.151.88.17:8006/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
