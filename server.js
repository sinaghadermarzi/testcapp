const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_MESSAGE_LENGTH = 280;
const MESSAGES_FILE = path.join(__dirname, "data", "messages.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Ensure data directory exists
fs.mkdirSync(path.dirname(MESSAGES_FILE), { recursive: true });

// Initialize messages file if it doesn't exist
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([], null, 2));
}

function readMessages() {
  const data = fs.readFileSync(MESSAGES_FILE, "utf-8");
  return JSON.parse(data);
}

function writeMessages(messages) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Get all messages
app.get("/api/messages", (req, res) => {
  const messages = readMessages();
  res.json(messages);
});

// Add a new message
app.post("/api/messages", (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return res
      .status(400)
      .json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` });
  }

  const messages = readMessages();
  const entry = {
    id: Date.now(),
    message: trimmed,
    timestamp: new Date().toISOString(),
  };
  messages.push(entry);
  writeMessages(messages);

  res.status(201).json(entry);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
