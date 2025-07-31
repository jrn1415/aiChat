# ใช้ Node.js official image เป็น base
FROM node:18-alpine

# ตั้งค่า working directory ในคอนเทนเนอร์
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json (ถ้ามี)
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install --only=production

# คัดลอกไฟล์โปรเจกต์ทั้งหมด
COPY . .

# เปิดพอร์ต 3000
EXPOSE 3000

# สร้าง non-root user เพื่อความปลอดภัย
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# เปลี่ยนเป็น non-root user
USER nextjs

# คำสั่งรันแอปพลิเคชัน
CMD ["npm", "start"]
