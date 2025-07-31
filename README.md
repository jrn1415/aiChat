# แอปพลิเคชันแชทเรียลไทม์ 💬

![Tests](https://img.shields.io/badge/tests-32%20passed-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-96.66%25-brightgreen)
![Node](https://img.shields.io/badge/node-18%2B-blue)
![Docker](https://img.shields.io/badge/docker-ready-blue)

แอปพลิเคชันแชทแบบง่ายที่ใช้ Node.js, Express และ Socket.IO สำหรับการสื่อสารแบบเรียลไทม์

## คุณสมบัติ ✨

- � **ตั้งชื่อผู้ใช้เอง** - ใส่ชื่อที่ต้องการก่อนเข้าแชท
- �💬 **แชทเรียลไทม์** - ส่งข้อความได้ทันทีระหว่างผู้ใช้หลายคน
- 🔄 **แสดงสถานะ "กำลังพิมพ์"** - เห็นเมื่อมีคนกำลังพิมพ์พร้อมชื่อผู้ใช้
- 🎨 **UI สวยงามและใช้งานง่าย** - ออกแบบมาให้ใช้งานสะดวก
- 📱 **รองรับ Responsive Design** - ใช้งานได้ดีทั้งคอมและมือถือ
- � **แจ้งเตือนผู้ใช้เข้า-ออก** - รู้เมื่อมีคนเข้าร่วมหรือออกจากแชท
- 🐳 **พร้อม Deploy ด้วย Docker** - รันง่ายในทุกระบบ

## การติดตั้งและรัน

### วิธีที่ 1: รันแบบปกติ

1. ติดตั้ง dependencies:
```bash
npm install
```

2. รันแอปพลิเคชัน:
```bash
npm start
```

3. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### วิธีที่ 2: รันด้วย Docker

#### ใช้ Docker Build และ Run

1. สร้าง Docker image:
```bash
docker build -t simple-chat-app .
```

2. รัน container:
```bash
docker run -p 3000:3000 simple-chat-app
```

#### ใช้ Docker Compose (แนะนำ)

1. รันด้วยคำสั่งเดียว:
```bash
docker-compose up --build
```

2. หยุดการทำงาน:
```bash
docker-compose down
```

## การใช้งาน 🚀

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
2. **ใส่ชื่อของคุณ** - กรอกชื่อที่ต้องการใช้ในการแชท (2-20 ตัวอักษร)
3. คลิก "เข้าร่วม" เพื่อเข้าสู่ห้องแชท
4. เปิดแท็บใหม่หรือใช้เครื่องอื่นเพื่อจำลองผู้ใช้คนที่ 2
5. เริ่มต้นแชทได้เลย! ชื่อของคุณจะแสดงในข้อความที่ส่ง

## เทคโนโลยีที่ใช้ 🛠️

- **Node.js** - รันไทม์ JavaScript
- **Express** - เว็บเฟรมเวิร์ก
- **Socket.IO** - เรียลไทม์ communication
- **HTML5/CSS3** - UI และการตกแต่ง
- **Docker** - การ containerization

## โครงสร้างโปรเจกต์ 📁

```
aiChat/
├── public/
│   ├── index.html      # หน้าเว็บหลัก
│   ├── style.css       # การตกแต่ง
│   └── script.js       # JavaScript ฝั่งไคลเอ็นต์
├── server.js           # เซิร์ฟเวอร์หลัก
├── package.json        # ข้อมูลโปรเจกต์และ dependencies
├── Dockerfile          # คำสั่งสร้าง Docker image
├── docker-compose.yml  # การตั้งค่า Docker Compose
└── README.md          # ไฟล์นี้
```

## การพัฒนาต่อ 🔧

สำหรับการพัฒนา สามารถใช้คำสั่ง:
```bash
npm run dev
```

ซึ่งจะใช้ nodemon เพื่อ restart เซิร์ฟเวอร์อัตโนมัติเมื่อมีการเปลี่ยนแปลงไฟล์

## การทดสอบ 🧪

โปรเจกต์นี้มีการทดสอบครบถ้วนด้วย Jest framework:

### รันการทดสอบ

```bash
# รัน tests ทั้งหมด
npm test

# รัน tests แบบ watch mode
npm run test:watch

# รัน tests พร้อม code coverage
npm run test:coverage

# รัน coverage แบบ watch mode
npm run test:coverage:watch

# รัน coverage และเปิดรายงาน HTML (macOS)
npm run test:coverage:open
```

### รัน Coverage ด้วย Docker

```bash
# สร้างและรัน coverage ใน Docker
docker build -f Dockerfile.coverage -t chat-coverage .
docker run --rm chat-coverage

# หรือใช้ script ที่เตรียมไว้
./scripts/coverage.sh
```

### รายงาน Code Coverage

การทดสอบครอบคลุม:
- ✅ **32 Unit Tests** - ทดสอบฟังก์ชันและคลาสทั้งหมด
- ✅ **Integration Tests** - ทดสอบการทำงานร่วมกันระหว่างส่วนต่างๆ
- ✅ **Server Tests** - ทดสอบ Socket.IO และ Express
- ✅ **Client Tests** - ทดสอบ helper functions และ validation

รายงาน coverage จะถูกสร้างในโฟลเดอร์ `coverage/`:
- `coverage/lcov-report/index.html` - รายงาน HTML แบบละเอียด
- `coverage/coverage-summary.json` - สรุปผลแบบ JSON

### Coverage Thresholds

โปรเจกต์ตั้งเป้าหมาย coverage ดังนี้:
- **Statements**: 85%+
- **Branches**: 80%+
- **Functions**: 85%+
- **Lines**: 85%+

## ข้อกำหนดระบบ 💻

- Node.js 14+ (หากรันแบบปกติ)
- Docker Desktop (หากใช้ Docker)
- เบราว์เซอร์ที่รองรับ WebSocket

## License 📄

MIT License
