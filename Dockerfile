# Base stage with Node.js
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only package.json and lockfile first for better caching
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build the Next.js app
RUN pnpm build


# Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install pnpm globally in the runner stage
RUN npm install -g pnpm

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy only needed files from build stage
COPY --from=deps /app/public ./public
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.next ./.next

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["pnpm", "start"]
