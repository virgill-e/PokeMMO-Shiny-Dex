# syntax=docker/dockerfile:1
FROM node:24.22.1-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24.22.1-alpine AS production
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

COPY --from=build /app/.output ./.output

# Unprivileged user shipped with the official node image. The server only
# reads .output (left owned by root, so it can't be modified at runtime).
USER node

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
