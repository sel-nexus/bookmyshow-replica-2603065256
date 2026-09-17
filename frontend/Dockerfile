FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN NODE_ENV=production node node_modules/next/dist/bin/next build
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
ENV PORT=3000
EXPOSE 3000
CMD ["node","node_modules/next/dist/bin/next","start"]
