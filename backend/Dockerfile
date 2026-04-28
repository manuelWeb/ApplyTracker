FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose only document docker container port. Published port is defined in docker-compose.yml ports mapping local:container
EXPOSE 3000

CMD ["npm", "run", "start:dev"]