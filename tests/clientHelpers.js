// Helper functions for client-side code
class MessageValidator {
    static isValidUsername(username) {
        if (!username || typeof username !== 'string') {
            return false;
        }
        const trimmed = username.trim();
        return trimmed.length >= 2 && trimmed.length <= 20;
    }

    static isValidMessage(message) {
        if (!message || typeof message !== 'string') {
            return false;
        }
        return message.trim().length > 0;
    }

    static formatTimestamp() {
        return new Date().toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    static generateUserId() {
        return Math.random().toString(36).substr(2, 9);
    }

    static generateUserColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    static createMessageData(text, userId, username, color) {
        return {
            text: text.trim(),
            userId: userId,
            username: username,
            color: color,
            timestamp: this.formatTimestamp()
        };
    }

    static sanitizeUsername(username) {
        return username.trim().substring(0, 20);
    }
}

class ChatClientHelper {
    constructor() {
        this.currentUsername = '';
        this.userId = MessageValidator.generateUserId();
        this.userColor = MessageValidator.generateUserColor();
        this.isTyping = false;
    }

    setUsername(username) {
        if (!MessageValidator.isValidUsername(username)) {
            throw new Error('ชื่อผู้ใช้ไม่ถูกต้อง');
        }
        this.currentUsername = MessageValidator.sanitizeUsername(username);
        return this.currentUsername;
    }

    createMessage(text) {
        if (!MessageValidator.isValidMessage(text)) {
            throw new Error('ข้อความไม่ถูกต้อง');
        }
        
        if (!this.currentUsername) {
            throw new Error('กรุณาตั้งชื่อผู้ใช้ก่อน');
        }

        return MessageValidator.createMessageData(
            text, 
            this.userId, 
            this.currentUsername, 
            this.userColor
        );
    }

    createUserJoinData() {
        if (!this.currentUsername) {
            throw new Error('กรุณาตั้งชื่อผู้ใช้ก่อน');
        }

        return {
            userId: this.userId,
            username: this.currentUsername,
            color: this.userColor
        };
    }

    createTypingData() {
        if (!this.currentUsername) {
            throw new Error('กรุณาตั้งชื่อผู้ใช้ก่อน');
        }

        return {
            userId: this.userId,
            username: this.currentUsername
        };
    }

    validateIncomingMessage(messageData) {
        if (!messageData) {
            return false;
        }
        return typeof messageData.text === 'string' &&
               typeof messageData.username === 'string' &&
               typeof messageData.userId === 'string' &&
               typeof messageData.timestamp === 'string';
    }
}

module.exports = {
    MessageValidator,
    ChatClientHelper
};
