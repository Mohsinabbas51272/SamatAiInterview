# Build Stage
FROM node:20.12.2-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# Production Stage
FROM node:20.12.2-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main.js"]
