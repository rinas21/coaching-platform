FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm config set fetch-retries 5 \
  && npm ci --no-audit --prefer-offline

COPY . .

RUN chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production
RUN npm run build

EXPOSE 1337

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
