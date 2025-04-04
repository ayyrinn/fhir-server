FROM node:20

# Set working directory di dalam container
WORKDIR /usr/src/app

# Copy package.json dan yarn.lock (atau npm) untuk install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file aplikasi ke dalam container
COPY . .

# Expose port untuk aplikasi
EXPOSE 3000

# Jalankan aplikasi menggunakan Node.js
CMD ["npm", "run", "dev"]
