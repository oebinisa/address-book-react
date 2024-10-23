# Mini Address Book App

## React + Express.js + MySQL

This is a walkthrough on how to create a **React** and **Express.js** Address Book application with **MySQL** as the database, using Vite for the React frontend. The app will consist of a navigation bar with two pages:

- **Form Input Page**: Allows users to submit their name, email, phone, and address.
- **Data Display Page**: Shows all the records entered into the MySQL database.

We will follow best practices to "hide" sensitive information such as the MySQL password using a `.env` file.

### Framework Selection:
During the setup of the Vite project, select the following:
Framework: React
Variant: Javascript + SWC

Execute in the base project folder as indicated in the project structure.

```bash
npm create vite@latest client --template react
```

Once the project is scaffolded, navigate to the project directory:

```bash
cd client
npm install
```

### Project Structure

```
address-book-react/
├── client/                     # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── ContactForm.jsx
│   │   │   ├── ContactList.jsx
│   │   ├── pages/               # Separate pages for form and list
│   │   │   ├── FormPage.jsx
│   │   │   ├── ListPage.jsx
│   │   ├── App.jsx              # Main App with Navigation
│   │   ├── index.jsx            # Entry point
│   ├── .env                     # Frontend environment variables
│   ├── package.json
│   ├── vite.config.js
├── server/                      # Backend (Express.js)
│   ├── config/
│   │   └── db.js                # MySQL connection
│   ├── controllers/
│   │   └── contactController.js  # Logic for CRUD operations
│   ├── routes/
│   │   └── contactRoutes.js      # Routes for the API
│   ├── server.js                 # Main server file
│   ├── .env                      # Backend environment variables
│   ├── package.json
└── README.md
```

---

### Step 1: Backend (Express.js)

1. **Install dependencies** in the `server` folder:

```bash
cd .. # navigate to the project root folder
mkdir server
cd server
npm init -y
npm install express mysql2 cors dotenv
```

2. **Create the `.env` file** in the `server/` directory for sensitive MySQL credentials:

```plaintext
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Pa55word
DB_NAME=address_book
PORT=5000
```

3. **Set up MySQL Connection** in `server/config/db.js`:

```js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

module.exports = connection;
```

4. **Create controllers** for handling CRUD operations in `server/controllers/contactController.js`:

```js
const db = require('../config/db');

// Get all contacts
exports.getContacts = (req, res) => {
  db.query('SELECT * FROM contacts', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

// Create a new contact
exports.createContact = (req, res) => {
  const { name, email, phone, address } = req.body;
  db.query(
    'INSERT INTO contacts (name, email, phone, address) VALUES (?, ?, ?, ?)',
    [name, email, phone, address],
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ id: results.insertId, ...req.body });
    }
  );
};
```

5. **Define API routes** in `server/routes/contactRoutes.js`:

```js
const express = require('express');
const { getContacts, createContact } = require('../controllers/contactController');
const router = express.Router();

router.get('/contacts', getContacts);
router.post('/contacts', createContact);

module.exports = router;
```

6. **Main Server File** (`server/server.js`):

```js
const express = require('express');
const cors = require('cors');
const contactRoutes = require('./routes/contactRoutes');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### Step 2: Frontend (React.js)

1. **Navigate to the `client` directory** and install dependencies:

```bash
cd ..
cd client
npm install axios react-router-dom
```

2. **Create a `.env` file** in the `client/` directory to handle frontend variables (e.g., API URL):

```plaintext
VITE_API_URL=http://localhost:5000/api
```

3. **Set up the `ContactForm` component** for form input (`client/src/components/ContactForm.jsx`):

```jsx
import { useState } from 'react';
import axios from 'axios';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${import.meta.env.VITE_API_URL}/contacts`, formData);
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
      <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
      <input type="text" placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required />
      <button type="submit">Add Contact</button>
    </form>
  );
};

export default ContactForm;
```

4. **Set up `ContactList` component** to display the data (`client/src/components/ContactList.jsx`):

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/contacts`);
      setContacts(response.data);
    };
    fetchContacts();
  }, []);

  return (
    <ul>
      {contacts.map((contact) => (
        <li key={contact.id}>
          {contact.name} - {contact.email} - {contact.phone} - {contact.address}
        </li>
      ))}
    </ul>
  );
};

export default ContactList;
```

5. **Create pages for the form and list** in `client/src/pages/`:

- **FormPage.jsx**:

```jsx
import ContactForm from '../components/ContactForm';

const FormPage = () => {
  return (
    <div>
      <h2>Add a New Contact</h2>
      <ContactForm />
    </div>
  );
};

export default FormPage;
```

- **ListPage.jsx**:

```jsx
import ContactList from '../components/ContactList';

const ListPage = () => {
  return (
    <div>
      <h2>Contact List</h2>
      <ContactList />
    </div>
  );
};

export default ListPage;
```

6. **Set up React Router** in `client/src/App.jsx` for navigation between pages:

```jsx
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import FormPage from './pages/FormPage';
import ListPage from './pages/ListPage';

function App() {
  return (
    <Router>
      <div>
        <h1>Address Book</h1>
        <h3>React + Express.js + MySQL</h3>
      </div>
      <nav>
        <Link to="/">Add Contact</Link>
        <span>&nbsp; &nbsp; &nbsp; | &nbsp; &nbsp; &nbsp; </span>
        <Link to="/list">View Contacts</Link>
      </nav>

      <Routes>
        <Route path="/" element={<FormPage />} />
        <Route path="/list" element={<ListPage />} />
      </Routes>
    </Router>
  );
}

export default App;
```

7. **Update `client/src/index.jsx` and `client/src/index.css` to render the `App` component**:

index.jsx:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

index.css:

```css
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Centralize */
html, body, #root {
  margin: 0;
  padding: 0;
  justify-content: center; /* Horizontal alignment */
  align-items: center;     /* Vertical alignment */
  height: 100vh;           /* Full view height */
  text-align: center;      /* Center align text */
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}

```
---

### Step 3: Final Setup

1.

1. **Run the backend** in the `server` directory:

```bash
cd server
node server.js
```

Ensure MySQL is running and your database is set up. Create the database and table if they don't exist yet:

```
mysql -u root -p
```

```sql
CREATE DATABASE address_book;
USE address_book;

CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) NOT NULL
);
```

2. **Run the frontend** in the `client` directory:

```bash
cd client
npm run dev
```

Your application should now be running, allowing you to:

- **Add new contacts** through the form on the first page.
- **View all contacts** on the second page.

---

This setup provides a **simple Address Book** application using React, Express.js, and MySQL, following standard practices to manage sensitive credentials in a `.env` file and ensuring smooth communication between the frontend and backend via API routes. The project structure is clean, and the navigation bar allows easy access to the two functionalities (adding and displaying contacts).