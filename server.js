const ChatServer = require('./ChatServer');

const chatServer = new ChatServer();
const PORT = process.env.PORT || 3000;

chatServer.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์กำลังทำงานบนพอร์ต ${PORT}`);
});
