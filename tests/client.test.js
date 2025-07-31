const { describe, test, expect, beforeEach } = require('@jest/globals');
const { MessageValidator, ChatClientHelper } = require('./clientHelpers');

describe('MessageValidator', () => {
    describe('isValidUsername', () => {
        test('ควรยอมรับชื่อผู้ใช้ที่ถูกต้อง', () => {
            expect(MessageValidator.isValidUsername('John')).toBe(true);
            expect(MessageValidator.isValidUsername('สมชาย')).toBe(true);
            expect(MessageValidator.isValidUsername('User123')).toBe(true);
            expect(MessageValidator.isValidUsername('AB')).toBe(true); // ความยาวขั้นต่ำ
        });

        test('ควรปฏิเสธชื่อผู้ใช้ที่ไม่ถูกต้อง', () => {
            expect(MessageValidator.isValidUsername('')).toBe(false);
            expect(MessageValidator.isValidUsername('A')).toBe(false); // สั้นเกินไป
            expect(MessageValidator.isValidUsername('A'.repeat(21))).toBe(false); // ยาวเกินไป
            expect(MessageValidator.isValidUsername(null)).toBe(false);
            expect(MessageValidator.isValidUsername(undefined)).toBe(false);
            expect(MessageValidator.isValidUsername('   ')).toBe(false); // เฉพาะ whitespace
        });
    });

    describe('isValidMessage', () => {
        test('ควรยอมรับข้อความที่ถูกต้อง', () => {
            expect(MessageValidator.isValidMessage('Hello')).toBe(true);
            expect(MessageValidator.isValidMessage('สวัสดี')).toBe(true);
            expect(MessageValidator.isValidMessage('123')).toBe(true);
            expect(MessageValidator.isValidMessage('  Hello  ')).toBe(true); // มี whitespace
        });

        test('ควรปฏิเสธข้อความที่ไม่ถูกต้อง', () => {
            expect(MessageValidator.isValidMessage('')).toBe(false);
            expect(MessageValidator.isValidMessage('   ')).toBe(false); // เฉพาะ whitespace
            expect(MessageValidator.isValidMessage(null)).toBe(false);
            expect(MessageValidator.isValidMessage(undefined)).toBe(false);
        });
    });

    describe('generateUserId', () => {
        test('ควรสร้าง user ID ที่ไม่ซ้ำกัน', () => {
            const id1 = MessageValidator.generateUserId();
            const id2 = MessageValidator.generateUserId();
            
            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(id1.length).toBeGreaterThan(0);
        });
    });

    describe('generateUserColor', () => {
        test('ควรสร้างสีที่อยู่ในรายการที่กำหนด', () => {
            const validColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
            const color = MessageValidator.generateUserColor();
            
            expect(validColors).toContain(color);
        });
    });

    describe('createMessageData', () => {
        test('ควรสร้างข้อมูลข้อความที่ถูกต้อง', () => {
            const messageData = MessageValidator.createMessageData(
                'Hello World',
                'user123',
                'TestUser',
                '#FF6B6B'
            );

            expect(messageData.text).toBe('Hello World');
            expect(messageData.userId).toBe('user123');
            expect(messageData.username).toBe('TestUser');
            expect(messageData.color).toBe('#FF6B6B');
            expect(messageData.timestamp).toMatch(/\d{2}:\d{2}/);
        });

        test('ควร trim ข้อความ', () => {
            const messageData = MessageValidator.createMessageData(
                '  Hello World  ',
                'user123',
                'TestUser',
                '#FF6B6B'
            );

            expect(messageData.text).toBe('Hello World');
        });
    });

    describe('sanitizeUsername', () => {
        test('ควร trim และตัดชื่อให้อยู่ในขนาดที่กำหนด', () => {
            expect(MessageValidator.sanitizeUsername('  John  ')).toBe('John');
            expect(MessageValidator.sanitizeUsername('A'.repeat(25))).toBe('A'.repeat(20));
        });
    });
});

describe('ChatClientHelper', () => {
    let chatHelper;

    beforeEach(() => {
        chatHelper = new ChatClientHelper();
    });

    describe('setUsername', () => {
        test('ควรตั้งชื่อผู้ใช้ได้', () => {
            const username = chatHelper.setUsername('TestUser');
            expect(username).toBe('TestUser');
            expect(chatHelper.currentUsername).toBe('TestUser');
        });

        test('ควรโยน error เมื่อชื่อผู้ใช้ไม่ถูกต้อง', () => {
            expect(() => chatHelper.setUsername('')).toThrow('ชื่อผู้ใช้ไม่ถูกต้อง');
            expect(() => chatHelper.setUsername('A')).toThrow('ชื่อผู้ใช้ไม่ถูกต้อง');
        });

        test('ควร sanitize ชื่อผู้ใช้', () => {
            const username = chatHelper.setUsername('  TestUser  ');
            expect(username).toBe('TestUser');
        });
    });

    describe('createMessage', () => {
        beforeEach(() => {
            chatHelper.setUsername('TestUser');
        });

        test('ควรสร้างข้อความได้', () => {
            const message = chatHelper.createMessage('Hello World');
            
            expect(message.text).toBe('Hello World');
            expect(message.username).toBe('TestUser');
            expect(message.userId).toBeDefined();
            expect(message.color).toBeDefined();
            expect(message.timestamp).toMatch(/\d{2}:\d{2}/);
        });

        test('ควรโยน error เมื่อไม่มีชื่อผู้ใช้', () => {
            const newHelper = new ChatClientHelper();
            expect(() => newHelper.createMessage('Hello')).toThrow('กรุณาตั้งชื่อผู้ใช้ก่อน');
        });

        test('ควรโยน error เมื่อข้อความไม่ถูกต้อง', () => {
            expect(() => chatHelper.createMessage('')).toThrow('ข้อความไม่ถูกต้อง');
            expect(() => chatHelper.createMessage('   ')).toThrow('ข้อความไม่ถูกต้อง');
        });
    });

    describe('createUserJoinData', () => {
        test('ควรสร้างข้อมูลการเข้าร่วมได้', () => {
            chatHelper.setUsername('TestUser');
            const joinData = chatHelper.createUserJoinData();
            
            expect(joinData.username).toBe('TestUser');
            expect(joinData.userId).toBeDefined();
            expect(joinData.color).toBeDefined();
        });

        test('ควรโยน error เมื่อไม่มีชื่อผู้ใช้', () => {
            expect(() => chatHelper.createUserJoinData()).toThrow('กรุณาตั้งชื่อผู้ใช้ก่อน');
        });
    });

    describe('createTypingData', () => {
        test('ควรสร้างข้อมูลการพิมพ์ได้', () => {
            chatHelper.setUsername('TestUser');
            const typingData = chatHelper.createTypingData();
            
            expect(typingData.username).toBe('TestUser');
            expect(typingData.userId).toBeDefined();
        });

        test('ควรโยน error เมื่อไม่มีชื่อผู้ใช้', () => {
            expect(() => chatHelper.createTypingData()).toThrow('กรุณาตั้งชื่อผู้ใช้ก่อน');
        });
    });

    describe('validateIncomingMessage', () => {
        test('ควรยอมรับข้อความที่ถูกต้อง', () => {
            const validMessage = {
                text: 'Hello',
                username: 'TestUser',
                userId: 'user123',
                timestamp: '10:30'
            };
            
            expect(chatHelper.validateIncomingMessage(validMessage)).toBe(true);
        });

        test('ควรปฏิเสธข้อความที่ไม่ถูกต้อง', () => {
            expect(chatHelper.validateIncomingMessage(null)).toBe(false);
            expect(chatHelper.validateIncomingMessage({})).toBe(false);
            expect(chatHelper.validateIncomingMessage({ text: 'Hello' })).toBe(false); // ข้อมูลไม่ครบ
        });
    });
});
