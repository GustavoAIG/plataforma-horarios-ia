# Usar la imagen de Node.js ligera
FROM node:18-alpine

# Crear el directorio de trabajo
WORKDIR /app

# Copiar dependencias e instalarlas
COPY package*.json ./
RUN npm install --production

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar el servidor
CMD ["npm", "start"]
