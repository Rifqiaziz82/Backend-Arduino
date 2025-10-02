const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Status global
let currentLampStatus = false; // false = OFF
let currentArusValue = 0.0;

// Buka port serial
const port = new SerialPort({
  path: "/dev/ttyACM0", // GANTI SESUAI SISTEMMU (Windows: "COM3")
  baudRate: 115200
}, (err) => {
  if (err) {
    console.error('❌ Gagal buka port serial:', err.message);
    return;
  }
  console.log('✅ Serial port siap');
});

// Parse per baris
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

parser.on("data", (line) => {
  const data = line.trim();
  console.log("📦 Dari Arduino:", data);

  // Handle status LED
  if (data === "LED_ON") {
    currentLampStatus = true;
    io.emit("lamp_status", { lamp: true });
  } else if (data === "LED_OFF") {
    currentLampStatus = false;
    io.emit("lamp_status", { lamp: false });
  }
  // Handle data arus
  else if (data.startsWith("CURRENT:")) {
    const valueStr = data.substring(8); // Ambil setelah "CURRENT:"
    const arus = parseFloat(valueStr);
    if (!isNaN(arus)) {
      currentArusValue = arus;
      console.log("⚡ Arus:", arus.toFixed(2), "A");
      io.emit("current_update", { current: arus });
    }
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🔌 Client terhubung:", socket.id);

  // Kirim status terkini ke client baru
  socket.emit("lamp_status", { lamp: currentLampStatus });
  socket.emit("current_update", { current: currentArusValue });

  // Terima perintah lampu
  socket.on("set_led", (command) => {
    if (command === "ON" || command === "OFF") {
      console.log(`📩 Perintah lampu: ${command}`);
      port.write(command + "\n");
    } else {
      socket.emit("error", { message: "Perintah harus 'ON' atau 'OFF'" });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client terputus:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server jalan di port ${PORT}`);
});