const { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } = require('@jest/globals');
const ChatServer = require('../ChatServer');
const Client = require('socket.io-client');
const { ChatClientHelper } = require('./clientHelpers');

describe('Integration Tests - Chat Application', () => {
    let chatServer;
    let serverPort;
    let clients = [];

    beforeAll((done) => {
        chatServer = new ChatServer();
        serverPort = 3002; // ใช้พอร์ตแยกสำหรับ integration tests
        
        chatServer.listen(serverPort, () => {
            done();
        });
    });

    beforeEach(() => {
        // Reset connected users ก่อนแต่ละ test
        chatServer.connectedUsers.clear();
        clients = [];
    });

    afterEach((done) => {
        // ปิดการเชื่อมต่อ clients ทั้งหมดหลังแต่ละ test
        Promise.all(clients.map(client => {
            return new Promise((resolve) => {
                if (client.connected) {
                    client.on('disconnect', resolve);
                    client.close();
                } else {
                    resolve();
                }
            });
        })).then(() => {
            clients = [];
            // รอสักนิดให้ server ประมวลผล disconnect เสร็จ
            setTimeout(done, 100);
        });
    });

    afterAll((done) => {
        // ปิดเซิร์ฟเวอร์
        chatServer.close(() => {
            done();
        });
    });
    });

    const createClient = () => {
        const client = new Client(`http://localhost:${serverPort}`);
        clients.push(client);
        return client;
    };

    test('สถานการณ์จริง: ผู้ใช้สองคนเข้าแชทและสนทนากัน', (done) => {
        const client1 = createClient();
        const client2 = createClient();
        const helper1 = new ChatClientHelper();
        const helper2 = new ChatClientHelper();
        
        let connectedCount = 0;
        let aliceReceivedBobMessage = false;
        let bobReceivedAliceMessage = false;
        
        const checkComplete = () => {
            if (aliceReceivedBobMessage && bobReceivedAliceMessage) {
                done();
            }
        };
        
        const checkReady = () => {
            connectedCount++;
            if (connectedCount === 2) {
                // ตั้งชื่อผู้ใช้
                helper1.setUsername('Alice');
                helper2.setUsername('Bob');
                
                // ผู้ใช้เข้าร่วม
                client1.emit('user joined', helper1.createUserJoinData());
                client2.emit('user joined', helper2.createUserJoinData());
                
                // ตั้งค่า message listeners
                client1.on('chat message', (messageData) => {
                    if (messageData.username === 'Bob' && messageData.text === 'Hello Alice!') {
                        aliceReceivedBobMessage = true;
                        // Alice ตอบกลับ
                        const replyMessage = helper1.createMessage('Hi Bob!');
                        client1.emit('chat message', replyMessage);
                    }
                });
                
                client2.on('chat message', (messageData) => {
                    if (messageData.username === 'Alice' && messageData.text === 'Hi Bob!') {
                        bobReceivedAliceMessage = true;
                        checkComplete();
                    }
                });
                
                // เริ่มการสนทนา
                setTimeout(() => {
                    const message = helper2.createMessage('Hello Alice!');
                    client2.emit('chat message', message);
                }, 200);
            }
        };
        
        client1.on('connect', checkReady);
        client2.on('connect', checkReady);
    });

    test('สถานการณ์จริง: การแจ้งเตือนเข้า-ออกของผู้ใช้', (done) => {
        const client1 = createClient();
        const client2 = createClient();
        const helper1 = new ChatClientHelper();
        const helper2 = new ChatClientHelper();
        
        let connectedCount = 0;
        let notifications = [];
        
        const checkReady = () => {
            connectedCount++;
            if (connectedCount === 2) {
                // ตั้งชื่อผู้ใช้
                helper1.setUsername('Charlie');
                helper2.setUsername('David');
                
                // Client2 ฟังการแจ้งเตือน
                client2.on('user joined', (data) => {
                    notifications.push({ type: 'joined', username: data.username });
                });
                
                client2.on('user left', (data) => {
                    notifications.push({ type: 'left', username: data.username });
                    
                    // ตรวจสอบการแจ้งเตือน
                    expect(notifications).toHaveLength(2);
                    expect(notifications[0]).toEqual({ type: 'joined', username: 'Charlie' });
                    expect(notifications[1]).toEqual({ type: 'left', username: 'Charlie' });
                    done();
                });
                
                // Charlie เข้าร่วม
                client1.emit('user joined', helper1.createUserJoinData());
                
                // David เข้าร่วม (ไม่ควรได้รับการแจ้งเตือนตัวเอง)
                setTimeout(() => {
                    client2.emit('user joined', helper2.createUserJoinData());
                    
                    // Charlie ออกจากแชท
                    setTimeout(() => {
                        client1.close();
                    }, 200);
                }, 200);
            }
        };
        
        client1.on('connect', checkReady);
        client2.on('connect', checkReady);
    });

    test('สถานการณ์จริง: การแสดงสถานะพิมพ์', (done) => {
        const client1 = createClient();
        const client2 = createClient();
        const helper1 = new ChatClientHelper();
        const helper2 = new ChatClientHelper();
        
        let connectedCount = 0;
        let typingEvents = [];
        
        const checkReady = () => {
            connectedCount++;
            if (connectedCount === 2) {
                // ตั้งชื่อผู้ใช้
                helper1.setUsername('Eve');
                helper2.setUsername('Frank');
                
                // Client2 ฟังสถานะพิมพ์
                client2.on('typing', (data) => {
                    typingEvents.push({ type: 'typing', username: data.username });
                });
                
                client2.on('stop typing', () => {
                    typingEvents.push({ type: 'stop_typing' });
                    
                    // ตรวจสอบสถานะพิมพ์
                    expect(typingEvents).toHaveLength(2);
                    expect(typingEvents[0]).toEqual({ type: 'typing', username: 'Eve' });
                    expect(typingEvents[1]).toEqual({ type: 'stop_typing' });
                    done();
                });
                
                // เข้าร่วมแชท
                client1.emit('user joined', helper1.createUserJoinData());
                client2.emit('user joined', helper2.createUserJoinData());
                
                // จำลองการพิมพ์
                setTimeout(() => {
                    client1.emit('typing', helper1.createTypingData());
                    
                    setTimeout(() => {
                        client1.emit('stop typing');
                    }, 300);
                }, 200);
            }
        };
        
        client1.on('connect', checkReady);
        client2.on('connect', checkReady);
    });

    test('การทดสอบความเสถียร: การเชื่อมต่อผู้ใช้หลายคน', (done) => {
        const numberOfUsers = 5;
        const connectedClients = [];
        const helpers = [];
        let connectedCount = 0;
        let usersJoined = 0;
        
        const cleanupAndFinish = () => {
            // ปิดการเชื่อมต่อทั้งหมด
            connectedClients.forEach(client => {
                if (client.connected) {
                    client.disconnect();
                }
            });
            done();
        };
        
        for (let i = 0; i < numberOfUsers; i++) {
            const client = createClient();
            const helper = new ChatClientHelper();
            helper.setUsername(`User${i + 1}`);
            
            connectedClients.push(client);
            helpers.push(helper);
            
            client.on('connect', () => {
                connectedCount++;
                
                if (connectedCount === numberOfUsers) {
                    // ผู้ใช้ทุกคนเข้าร่วม
                    connectedClients.forEach((client, index) => {
                        setTimeout(() => {
                            client.emit('user joined', helpers[index].createUserJoinData());
                            usersJoined++;
                            
                            // ตรวจสอบหลังจากผู้ใช้เข้าร่วมครบ
                            if (usersJoined === numberOfUsers) {
                                setTimeout(() => {
                                    expect(chatServer.getConnectedUsersCount()).toBe(numberOfUsers);
                                    cleanupAndFinish();
                                }, 500); // รอให้ server ประมวลผลเสร็จ
                            }
                        }, index * 100);
                    });
                }
            });
        }
    }, 15000); // เพิ่ม timeout สำหรับการทดสอบนี้
});
