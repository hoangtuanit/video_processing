FROM node:20

# Cài ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Tạo thư mục app
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài dependencies Node.js
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Expose port (nếu cần)
EXPOSE 4001

# Lệnh chạy service
CMD ["node", "index.js"]