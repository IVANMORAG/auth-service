FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Cambiar ownership de archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Railway asigna el puerto dinámicamente
EXPOSE $PORT

CMD ["npm", "start"]