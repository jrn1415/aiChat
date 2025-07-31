const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

class ChatServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server);
        this.connectedUsers = new Map();
        
        this.setupMiddleware();
        this.setupSocketHandlers();
    }

    setupMiddleware() {
        // ให้บริการไฟล์ static จากโฟลเดอร์ public
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupSocketHandlers() {
        // เมื่อมีผู้ใช้เชื่อมต่อ
        this.io.on('connection', (socket) => {
            console.log('ผู้ใช้เชื่อมต่อแล้ว:', socket.id);
            
            // เมื่อผู้ใช้เข้าร่วมด้วยชื่อ
            socket.on('user joined', (userData) => {
                // เก็บข้อมูลผู้ใช้
                this.connectedUsers.set(socket.id, {
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
                this.io.emit('chat message', messageData);
            });
            
            // เมื่อผู้ใช้กำลังพิมพ์
            socket.on('typing', (data) => {
                socket.broadcast.emit('typing', data);
            });
            
            // เมื่อผู้ใช้หยุดพิมพ์
            socket.on('stop typing', () => {
                const userData = this.connectedUsers.get(socket.id);
                if (userData) {
                    socket.broadcast.emit('stop typing', {
                        username: userData.username,
                        userId: userData.userId
                    });
                }
            });
            
            // เมื่อผู้ใช้ตัดการเชื่อมต่อ
            socket.on('disconnect', () => {
                const userData = this.connectedUsers.get(socket.id);
                if (userData) {
                    console.log(`${userData.username} ตัดการเชื่อมต่อ (${socket.id})`);
                    
                    // แจ้งเตือนผู้ใช้อื่นว่ามีคนออกจากแชท
                    socket.broadcast.emit('user left', {
                        userId: userData.userId,
                        username: userData.username
                    });
                    
                    // ลบข้อมูลผู้ใช้
                    this.connectedUsers.delete(socket.id);
                } else {
                    console.log('ผู้ใช้ตัดการเชื่อมต่อ:', socket.id);
                }
            });
        });
    }

    listen(port, callback) {
        return this.server.listen(port, callback);
    }

    close(callback) {
        return this.server.close(callback);
    }

    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    getConnectedUsers() {
        return Array.from(this.connectedUsers.values());
    }
}

module.exports = ChatServer;
