const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("App Engine works!");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
