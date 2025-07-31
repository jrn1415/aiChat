const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const ChatServer = require('../ChatServer');
const Client = require('socket.io-client');

describe('ChatServer', () => {
    let chatServer;
    let serverPort;
    let clientSocket1;
    let clientSocket2;

    beforeEach((done) => {
        // สร้างเซิร์ฟเวอร์ใหม่
        chatServer = new ChatServer();
        serverPort = 3001; // ใช้พอร์ตอื่นเพื่อไม่ให้ขัดแย้งกับเซิร์ฟเวอร์หลัก
        
        chatServer.listen(serverPort, () => {
            done();
        });
    });

    afterEach((done) => {
        // ปิดการเชื่อมต่อ clients
        if (clientSocket1) {
            clientSocket1.close();
        }
        if (clientSocket2) {
            clientSocket2.close();
        }
        
        // ปิดเซิร์ฟเวอร์
        chatServer.close(() => {
            done();
        });
    });

    test('ควรสามารถสร้างเซิร์ฟเวอร์ได้', () => {
        expect(chatServer).toBeDefined();
        expect(chatServer.getConnectedUsersCount()).toBe(0);
    });

    test('ควรสามารถเชื่อมต่อไคลเอ็นต์ได้', (done) => {
        clientSocket1 = new Client(`http://localhost:${serverPort}`);
        
        clientSocket1.on('connect', () => {
            expect(clientSocket1.connected).toBe(true);
            done();
        });
    });

    test('ควรจัดการการเข้าร่วมของผู้ใช้ได้', (done) => {
        clientSocket1 = new Client(`http://localhost:${serverPort}`);
        
        clientSocket1.on('connect', () => {
            const userData = {
                userId: 'test123',
                username: 'TestUser',
                color: '#FF6B6B'
            };
            
            clientSocket1.emit('user joined', userData);
            
            // รอสักครู่แล้วตรวจสอบ
            setTimeout(() => {
                expect(chatServer.getConnectedUsersCount()).toBe(1);
                const users = chatServer.getConnectedUsers();
                expect(users[0].username).toBe('TestUser');
                done();
            }, 100);
        });
    });

    test('ควรส่งข้อความระหว่างผู้ใช้ได้', (done) => {
        clientSocket1 = new Client(`http://localhost:${serverPort}`);
        clientSocket2 = new Client(`http://localhost:${serverPort}`);
        
        let connectedCount = 0;
        
        const checkReady = () => {
            connectedCount++;
            if (connectedCount === 2) {
                // ผู้ใช้ 1 เข้าร่วม
                clientSocket1.emit('user joined', {
                    userId: 'user1',
                    username: 'User1',
                    color: '#FF6B6B'
                });
                
                // ผู้ใช้ 2 เข้าร่วม
                clientSocket2.emit('user joined', {
                    userId: 'user2',
                    username: 'User2',
                    color: '#4ECDC4'
                });
                
                // ผู้ใช้ 2 รอรับข้อความ
                clientSocket2.on('chat message', (messageData) => {
                    expect(messageData.text).toBe('Hello from User1');
                    expect(messageData.username).toBe('User1');
                    done();
                });
                
                // ผู้ใช้ 1 ส่งข้อความ
                setTimeout(() => {
                    clientSocket1.emit('chat message', {
                        text: 'Hello from User1',
                        userId: 'user1',
                        username: 'User1',
                        color: '#FF6B6B',
                        timestamp: '10:30'
                    });
                }, 100);
            }
        };
        
        clientSocket1.on('connect', checkReady);
        clientSocket2.on('connect', checkReady);
    });

    test('ควรแจ้งเตือนเมื่อผู้ใช้เข้าร่วม', (done) => {
        clientSocket1 = new Client(`http://localhost:${serverPort}`);
        clientSocket2 = new Client(`http://localhost:${serverPort}`);
        
        let connectedCount = 0;
        
        const checkReady = () => {
            connectedCount++;
            if (connectedCount === 2) {
                // clientSocket2 รอรับการแจ้งเตือน
                clientSocket2.on('user joined', (data) => {
                    expect(data.username).toBe('User1');
                    expect(data.userId).toBe('user1');
                    done();
                });
                
                // clientSocket1 เข้าร่วม
                clientSocket1.emit('user joined', {
                    userId: 'user1',
                    username: 'User1',
                    color: '#FF6B6B'
                });
            }
        };
        
        clientSocket1.on('connect', checkReady);
        clientSocket2.on('connect', checkReady);
    });

    test('ควรจัดการการพิมพ์ได้', (done) => {
        clientSocket1 = new Client(`http://localhost:${serverPort}`);
        clientSocket2 = new Client(`http://localhost:${serverPort}`);
        
        let connectedCount = 0;
        
        const checkReady = () => {
            connectedCount++;
            if (connectedCount === 2) {
                // clientSocket2 รอรับสถานะพิมพ์
                clientSocket2.on('typing', (data) => {
                    expect(data.username).toBe('User1');
                    expect(data.userId).toBe('user1');
                    done();
                });
                
                // clientSocket1 เริ่มพิมพ์
                clientSocket1.emit('typing', {
                    userId: 'user1',
                    username: 'User1'
                });
            }
        };
        
        clientSocket1.on('connect', checkReady);
        clientSocket2.on('connect', checkReady);
    });

    test('ควรแจ้งเตือนเมื่อผู้ใช้ออกจากแชท', (done) => {
        clientSocket1 = new Client(`http://localhost:${serverPort}`);
        clientSocket2 = new Client(`http://localhost:${serverPort}`);
        
        let connectedCount = 0;
        
        const checkReady = () => {
            connectedCount++;
            if (connectedCount === 2) {
                // ผู้ใช้ทั้งสองเข้าร่วม
                clientSocket1.emit('user joined', {
                    userId: 'user1',
                    username: 'User1',
                    color: '#FF6B6B'
                });
                
                clientSocket2.emit('user joined', {
                    userId: 'user2',
                    username: 'User2',
                    color: '#4ECDC4'
                });
                
                // clientSocket2 รอรับการแจ้งเตือนการออก
                clientSocket2.on('user left', (data) => {
                    expect(data.username).toBe('User1');
                    expect(data.userId).toBe('user1');
                    done();
                });
                
                // clientSocket1 ออกจากแชท
                setTimeout(() => {
                    clientSocket1.close();
                }, 200);
            }
        };
        
        clientSocket1.on('connect', checkReady);
        clientSocket2.on('connect', checkReady);
    });
});
