require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const nodeCleanup = require("node-cleanup");
const { initCampaign } = require("./loops/campaignBeta.js");
const { runCampaign } = require("./loops/campaignLoop.js");
const { init, cleanup } = require("./helper/addon/qr");
const { warmerLoopInit } = require("./helper/addon/qr/warmer/index.js");

const app = express();

// ✅ CORS middleware early
app.use(cors({
  origin: process.env.FRONTENDURI || "*",
  credentials: true,
}));

// ✅ Body parsers and file upload
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(fileUpload());

// ✅ Routes
app.use("/api/user", require("./routes/user"));
app.use("/api/web", require("./routes/web"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/phonebook", require("./routes/phonebook"));
app.use("/api/chat_flow", require("./routes/chatFlow"));
app.use("/api/inbox", require("./routes/inbox"));
app.use("/api/templet", require("./routes/templet"));
app.use("/api/chatbot", require("./routes/chatbot"));
app.use("/api/broadcast", require("./routes/broadcast"));
app.use("/api/v1", require("./routes/apiv2"));
app.use("/api/agent", require("./routes/agent"));
app.use("/api/qr", require("./routes/qr"));
app.use("/api/ai", require("./routes/ai"));

// ✅ Serve React static files
const currentDir = process.cwd();
app.use(express.static(path.resolve(currentDir, "./client/public")));

app.get("*", function (req, res) {
  res.sendFile(path.resolve(currentDir, "./client/public", "index.html"));
});

// ✅ Start server
const server = app.listen(process.env.PORT || 3010, () => {
  console.log(`CloudSaaS server is running on port ${process.env.PORT || 3010}`);
  init();
  setTimeout(() => {
    runCampaign();
    warmerLoopInit();
    initCampaign();
  }, 1000);
});

// ✅ Initialize WebSocket
const io = require("./socket").initializeSocket(server);
module.exports = io;

// ✅ Cleanup handler
nodeCleanup(cleanup);
