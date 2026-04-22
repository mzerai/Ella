FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_PUBLIC_API_URL=https://ella-backend-322382658983.us-central1.run.app
ENV NEXT_PUBLIC_SUPABASE_URL=https://ztussesyqqutbuaommqs.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_o2PjJhaUfLDBctDpkMGabQ_vBU5ak5o
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
