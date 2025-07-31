# คำแนะนำการใช้งาน Docker สำหรับแอปพลิเคชันแชท

## ขั้นตอนการ Deploy และรันแอปพลิเคชัน

### วิธีที่ 1: ใช้ Docker Commands

1. **สร้าง Docker Image:**
```bash
docker build -t simple-chat-app .
```

2. **รันแอปพลิเคชัน:**
```bash
docker run -d -p 3000:3000 --name chat-app simple-chat-app
```

3. **ตรวจสอบสถานะ:**
```bash
docker ps
```

4. **ดูล็อกของแอป:**
```bash
docker logs chat-app
```

5. **หยุดแอป:**
```bash
docker stop chat-app
```

6. **ลบคอนเทนเนอร์:**
```bash
docker rm chat-app
```

### วิธีที่ 2: ใช้ Docker Compose (แนะนำ)

1. **รันแอป:**
```bash
docker-compose up -d
```

2. **ดูล็อก:**
```bash
docker-compose logs -f
```

3. **หยุดแอป:**
```bash
docker-compose down
```

4. **สร้างใหม่และรัน:**
```bash
docker-compose up --build -d
```

## คำสั่งที่มีประโยชน์

### การจัดการ Images
```bash
# ดู images ทั้งหมด
docker images

# ลบ image
docker rmi simple-chat-app

# ลบ images ที่ไม่ใช้
docker image prune
```

### การจัดการ Containers
```bash
# ดู containers ทั้งหมด (รวมที่หยุดแล้ว)
docker ps -a

# เข้าไปใน container
docker exec -it chat-app /bin/sh

# restart container
docker restart chat-app
```

### การแก้ไขปัญหา
```bash
# ดูการใช้ทรัพยากร
docker stats chat-app

# ตรวจสอบ network
docker port chat-app

# ดูข้อมูลรายละเอียด
docker inspect chat-app
```

## การใช้งาน

1. หลังจากรันแอปแล้ว เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`
2. เปิดแท็บใหม่หรือใช้เครื่องอื่นเพื่อทดสอบการแชท
3. เริ่มต้นการสนทนาได้เลย!

## ข้อกำหนด

- Docker Desktop ติดตั้งและรันอยู่
- พอร์ต 3000 ว่าง
- เครื่องสามารถเข้าถึงอินเทอร์เน็ตได้ (สำหรับดาวน์โหลด Node.js image)

## การปรับแต่ง

### เปลี่ยนพอร์ต
หากต้องการใช้พอร์ตอื่น เช่น 8080:
```bash
docker run -d -p 8080:3000 --name chat-app simple-chat-app
```

### ตั้งค่า Environment Variables
```bash
docker run -d -p 3000:3000 -e NODE_ENV=production --name chat-app simple-chat-app
```

### ใช้ Volume สำหรับ Development
```bash
docker run -d -p 3000:3000 -v $(pwd):/app --name chat-app-dev simple-chat-app
```
