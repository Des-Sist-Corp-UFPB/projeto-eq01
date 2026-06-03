# Stage 1: Build Angular Application
FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar códigos fonte
COPY . .

# Compilar aplicação para produção
RUN npm run build -- --configuration production

# Stage 2: Servir com Nginx
FROM nginx:alpine

# Copiar build geSrado no Stage 1 para o diretório padSrão do Nginx
# Observação: A pasta de saída do Angular é dist/view-angular/browser
COPY --from=build /app/dist/view-angular/browser /usr/share/nginx/html

# Copiar configuração customizada do Nginx para suportar HTML5 Routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
