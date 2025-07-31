const socket = io();

// Elements
const usernameContainer = document.getElementById('usernameContainer');
const chatContainer = document.getElementById('chatContainer');
const usernameInput = document.getElementById('usernameInput');
const joinButton = document.getElementById('joinButton');
const currentUsernameDisplay = document.getElementById('currentUsername');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesContainer = document.getElementById('messages');
const typingIndicator = document.getElementById('typing');

// Variables
let currentUsername = '';
let isTyping = false;
let typingTimer;
const userId = Math.random().toString(36).substr(2, 9);
const userColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
const userColor = userColors[Math.floor(Math.random() * userColors.length)];

// ฟังก์ชันเข้าร่วมแชท
function joinChat() {
    const username = usernameInput.value.trim();
    if (username.length < 2) {
        alert('กรุณาใส่ชื่ออย่างน้อย 2 ตัวอักษร');
        return;
    }
    if (username.length > 20) {
        alert('ชื่อต้องไม่เกิน 20 ตัวอักษร');
        return;
    }
    
    currentUsername = username;
    currentUsernameDisplay.textContent = currentUsername;
    
    // แสดงหน้าจอแชท
    usernameContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    
    // ส่งข้อมูลผู้ใช้ไปยังเซิร์ฟเวอร์
    socket.emit('user joined', {
        userId: userId,
        username: currentUsername,
        color: userColor
    });
    
    // โฟกัสที่ช่องพิมพ์ข้อความ
    messageInput.focus();
}

// ฟังก์ชันส่งข้อความ
function sendMessage() {
    const message = messageInput.value.trim();
    if (message && currentUsername) {
        const messageData = {
            text: message,
            userId: userId,
            username: currentUsername,
            color: userColor,
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
        
        socket.emit('chat message', messageData);
        messageInput.value = '';
        
        // หยุดการแสดงสถานะกำลังพิมพ์
        if (isTyping) {
            socket.emit('stop typing');
            isTyping = false;
        }
    }
}

// ฟังก์ชันแสดงข้อความ
function displayMessage(messageData, isOwn = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (messageData.type === 'system') {
        messageElement.classList.add('system');
        messageElement.innerHTML = `${messageData.text}`;
    } else {
        messageElement.classList.add(isOwn ? 'own' : 'other');
        
        if (isOwn) {
            messageElement.innerHTML = `
                <div class="message-header">คุณ • ${messageData.timestamp}</div>
                <div class="message-content">${messageData.text}</div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-header" style="color: ${messageData.color};">
                    ${messageData.username} • ${messageData.timestamp}
                </div>
                <div class="message-content">${messageData.text}</div>
            `;
        }
    }
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event Listeners สำหรับหน้าจอใส่ชื่อ
joinButton.addEventListener('click', joinChat);

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinChat();
    }
});

usernameInput.addEventListener('input', () => {
    const username = usernameInput.value.trim();
    joinButton.disabled = username.length < 2 || username.length > 20;
});

// Event Listeners สำหรับการแชท
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    } else if (currentUsername) {
        // แสดงสถานะกำลังพิมพ์
        if (!isTyping) {
            socket.emit('typing', { 
                userId: userId, 
                username: currentUsername 
            });
            isTyping = true;
        }
        
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            socket.emit('stop typing');
            isTyping = false;
        }, 1000);
    }
});

// Socket Event Listeners
socket.on('chat message', (messageData) => {
    const isOwn = messageData.userId === userId;
    displayMessage(messageData, isOwn);
});

socket.on('user joined', (data) => {
    if (data.userId !== userId) {
        displayMessage({ 
            text: `${data.username} เข้าร่วมการแชท`, 
            type: 'system' 
        });
    }
});

socket.on('user left', (data) => {
    displayMessage({ 
        text: `${data.username} ออกจากการแชท`, 
        type: 'system' 
    });
});

socket.on('typing', (data) => {
    if (data.userId !== userId) {
        typingIndicator.textContent = `${data.username} กำลังพิมพ์...`;
    }
});

socket.on('stop typing', () => {
    typingIndicator.textContent = '';
});

// เริ่มต้นแอป
window.addEventListener('load', () => {
    usernameInput.focus();
    joinButton.disabled = true;
});
