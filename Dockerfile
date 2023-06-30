FROM node:18.12.1-alpine
WORKDIR /mesh-server
COPY package*.json .
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]