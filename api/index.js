const express = require("express");

const app = express();
app.use(express.json());

// متغير لتخزين الرقم
let savedNumber = null;

// GET الأولى
app.get("/hello", (req, res) => {
  res.json({ message: "اهلا جميعا" });
});

// POST لاستقبال الرقم
app.post("/number", (req, res) => {
  const { number } = req.body;

  if (number === undefined) {
    return res.status(400).json({ error: "من فضلك ابعت رقم" });
  }

  savedNumber = number;
  res.json({ message: "تم حفظ الرقم", number });
});

// GET التانية ترجع الرقم
app.get("/number", (req, res) => {
  if (savedNumber === null) {
    return res.json({ message: "لا يوجد رقم محفوظ" });
  }

  res.json({ number: savedNumber });
});

module.exports = app;
