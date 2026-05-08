FROM node:20-alpine

WORKDIR /app

# 依存関係を先にコピーしてキャッシュを活用する
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]