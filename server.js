const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// เก็บข้อมูลผู้ใช้ที่เชื่อมต่ออยู่
const connectedUsers = new Map();

// ให้บริการไฟล์ static จากโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));

// เมื่อมีผู้ใช้เชื่อมต่อ
io.on('connection', (socket) => {
    console.log('ผู้ใช้เชื่อมต่อแล้ว:', socket.id);
    
    // เมื่อผู้ใช้เข้าร่วมด้วยชื่อ
    socket.on('user joined', (userData) => {
        // เก็บข้อมูลผู้ใช้
        connectedUsers.set(socket.id, {
            userId: userData.userId,
            username: userData.username,
            color: userData.color
        });
        
        console.log(`${userData.username} เข้าร่วมการแชท (${socket.id})`);
        
        // แจ้งเตือนผู้ใช้อื่นว่ามีคนเข้าร่วม
        socket.broadcast.emit('user joined', {
            userId: userData.userId,
            username: userData.username
        });
    });
    
    // เมื่อได้รับข้อความ
    socket.on('chat message', (messageData) => {
        console.log(`ข้อความจาก ${messageData.username}: ${messageData.text}`);
        // ส่งข้อความไปยังผู้ใช้ทุกคน
        io.emit('chat message', messageData);
    });
    
    // เมื่อผู้ใช้กำลังพิมพ์
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });
    
    // เมื่อผู้ใช้หยุดพิมพ์
    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing');
    });
    
    // เมื่อผู้ใช้ตัดการเชื่อมต่อ
    socket.on('disconnect', () => {
        const userData = connectedUsers.get(socket.id);
        if (userData) {
            console.log(`${userData.username} ตัดการเชื่อมต่อ (${socket.id})`);
            
            // แจ้งเตือนผู้ใช้อื่นว่ามีคนออกจากแชท
            socket.broadcast.emit('user left', {
                userId: userData.userId,
                username: userData.username
            });
            
            // ลบข้อมูลผู้ใช้
            connectedUsers.delete(socket.id);
        } else {
            console.log('ผู้ใช้ตัดการเชื่อมต่อ:', socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์กำลังทำงานบนพอร์ต ${PORT}`);
});
