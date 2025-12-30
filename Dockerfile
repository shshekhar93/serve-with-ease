FROM node:lts-alpine

WORKDIR /app
RUN mkdir -p /config
RUN mkdir -p /sites

# Start with package[-lock].json
COPY package*.json ./
RUN npm ci

COPY . .

VOLUME "/config"
VOLUME "/sites"

EXPOSE 3000

ENTRYPOINT ["node", "index.js"]
CMD ["/config/config.json"]
