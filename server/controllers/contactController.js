const db = require("../config/db");

// Get all contacts
exports.getContacts = (req, res) => {
  db.query("SELECT * FROM contacts", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

// Create a new contact
exports.createContact = (req, res) => {
  const { name, email, phone, address } = req.body;
  db.query(
    "INSERT INTO contacts (name, email, phone, address) VALUES (?, ?, ?, ?)",
    [name, email, phone, address],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ id: results.insertId, ...req.body });
    }
  );
};
