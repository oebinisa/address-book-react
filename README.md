# Mini Address Book App
This branch builds on the main repo by implementing Continuous Integration (CI) via GitHub Action.

**Contents:**
- Part 1: Basic App: React + Express.js + MySQL (main)
- Part 2: CI Pipeline with GitHub Actions with Compressed/Zipped Artifacts (ci-actions)
- Part 3: Incorporation of Yarn and Jest testing into the app and CI pipeline

## Part 1: BAsic App: React + Express.js + MySQL (main branch)

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
│   ├── db/
│   │   └── schema.sql
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
Script location: `server/db/schema.sql`

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


---
---


## Part 2: CI Pipeline with GitHub Actions with Compressed/Zipped Artifacts (ci-actions)

### Overview
In this project, we’ll build a CI pipeline using GitHub Actions for the address-book-react app, which consists of:
 - A frontend built with React,
 - A backend built with Express.js,
 - A MySQL database.

 This CI pipeline will:
1. Install and build the application.
2. Run tests to verify application integrity.
3. Compress build artifacts.
4. Upload compressed artifacts to an S3 bucket (s3://simartefacts/).
5. Send an email notification upon completion of the CI pipeline.

**Pre-requisites**
1. Access to the address-book-react GitHub repository.
2. AWS S3 bucket credentials for s3://simartefacts/.
3. An email service provider for notifications (e.g., SendGrid or SMTP).


### **Step 1: Setting up GitHub Actions Workflow**

1. **Create a new GitHub Actions Workflow file**:
   - In the *address-book-react* GitHub repository, create a new directory named `.github/workflows`.
   - Inside this directory, create a YAML file (e.g., `ci-pipeline.yml`) for the CI pipeline configuration.

2. **Define Workflow Triggers**:
   ```yaml
   name: CI Pipeline for Address Book App

   on:
     push:
       branches:
         - ci-actions
     pull_request:
       branches:
         - ci-actions
   ```

3. **Define Job Steps**:
   - Add a `jobs` section to define the sequence of tasks:
   ```yaml
   jobs:
     build-and-test:
       runs-on: ubuntu-latest
       steps:
   ```

---

### **Step 2: Installing Dependencies and Building the Application**

1. **Checkout the Repository**:
   ```yaml
    - name: Checkout Repository
      uses: actions/checkout@v3
   ```

2. **Set up Node.js**:
   ```yaml
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
   ```

3. **Install Dependencies**:
   ```yaml
    - name: Install Frontend Dependencies and Run Tests
      working-directory: ./client
      run: |
        npm install
        npm test

    - name: Install Backend Dependencies and Run Tests
      working-directory: ./server
      run: |
        npm install
        npm test
   ```

4. **Build the React Application**:
   ```yaml
    - name: Build Frontend
      working-directory: ./client
      run: npm run build
   ```

5. **Run Tests**:
   ```yaml
    - name: Run Frontend Tests
      working-directory: ./client
      run: npm test || exit 1

    - name: Run Backend Tests
      working-directory: ./server
      run: npm test || exit 1
   ```

---

### **Step 3: Compress Build Artifacts**

1. **Zip the Build Folder**:
   ```yaml
    - name: Zip Artifacts
      run: |
        if [ -d "client/dist" ]; then
          zip -r build-artifacts.zip client/dist
        else
          echo "Error: client/dist directory not found"
          exit 1
        fi
   ```

---

### **Step 4: Upload to AWS S3**

1. **Add AWS Credentials**:
   - Store your AWS access and secret keys in GitHub secrets (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`).

2. **Upload Artifacts to S3**:
   ```yaml
    - name: Configure AWS Credentials
      run: |
          aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
          aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
          aws configure set default.region us-east-1  # Set to your specific region
      env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

    - name: Upload Artifacts to S3
      run: |
          TIMESTAMP=$(date +%Y%m%d%H%M%S)
          aws s3 cp build-artifacts.zip s3://simartefacts/build-artifacts-$TIMESTAMP.zip
   ```

---

### **Step 5: Send Email Notifications**

1. **Define Email Step Using SendGrid or SMTP**:
   - For SendGrid:
     ```yaml
      - name: Send Email Notification
        env:
          SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
        run: |
          curl --request POST \
          --url https://api.sendgrid.com/v3/mail/send \
          --header "Authorization: Bearer $SENDGRID_API_KEY" \
          --header "Content-Type: application/json" \
          --data '{
            "personalizations": [{"to": [{"email": "o.oluwapelumi@gmail.com"}]}],
            "from": {"email": "sender@example.com"},
            "subject": "CI Pipeline Completion",
            "content": [{"type": "text/plain", "value": "CI pipeline for address-book-react completed successfully."}]
          }'
     ```

---

### **Full GitHub Actions Workflow (ci-pipeline.yml)**

Here’s a complete view of the `ci-pipeline.yml` file:

```yaml
name: CI Pipeline for Address Book App

on:
  push:
    branches:
      - ci-actions
  pull_request:
    branches:
      - ci-actions

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Frontend Dependencies and Run Tests
        working-directory: ./client
        run: |
            npm install
            npm test

      - name: Install Backend Dependencies and Run Tests
        working-directory: ./server
        run: |
            npm install
            npm test

      - name: Build Frontend
        working-directory: ./client
        run: npm run build 

      - name: Run Frontend Tests
        working-directory: ./client
        run: npm test || exit 1
          
      - name: Run Backend Tests
        working-directory: ./server
        run: npm test || exit 1

      - name: Zip Artifacts
        run: |
          if [ -d "client/dist" ]; then
            zip -r build-artifacts.zip client/dist
          else
            echo "Error: client/dist directory not found"
            exit 1
          fi

      - name: Configure AWS Credentials
        run: |
            aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
            aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
            aws configure set default.region us-east-1  # Set to your specific region
        env:
            AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
            AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Upload Artifacts to S3
        run: |
            TIMESTAMP=$(date +%Y%m%d%H%M%S)
            aws s3 cp build-artifacts.zip s3://simartefacts/build-artifacts-$TIMESTAMP.zip

      - name: Send Email Notification
        env:
          SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
        run: |
          curl --request POST \
          --url https://api.sendgrid.com/v3/mail/send \
          --header "Authorization: Bearer $SENDGRID_API_KEY" \
          --header "Content-Type: application/json" \
          --data '{
            "personalizations": [{"to": [{"email": "o.oluwapelumi@gmail.com"}]}],
            "from": {"email": "sender@example.com"},
            "subject": "CI Pipeline Completion",
            "content": [{"type": "text/plain", "value": "CI pipeline for address-book-react completed successfully."}]
          }'
```

This comprehensive setup ensures a robust CI pipeline, pthat handles practical DevOps tasks end-to-end.

---


## Part 3: Incorporation of Yarn and Jest testing into the app and CI pipeline

### Overview
1. **Install and Configure Jest** with Yarn for both client and server.
2. **Add Testing Scripts** in `package.json` files.
3. **Optimize Jest Configurations for Vite** for the frontend.
4. **Configure Vite for Yarn Compatibility**.
5. **Run Tests** with Yarn.


### Step 1: Configure Yarn and Jest in the Frontend (`client`)

1. **Navigate to the client folder:**
   ```bash
   cd address-book-react/client
   ```

2. **Install and Initialize Yarn and Install Jest:**
   ```bash
   npm install -g yarn
   yarn --version
   yarn init -y
   yarn add jest @testing-library/dom @testing-library/react @testing-library/jest-dom babel-jest identity-obj-proxy --dev
   yarn add -D@babel/preset-env @babel/preset-react jest-environment-jsdom
   ```

3. **Add Jest Configurations** to `client/package.json`:

  ```json
  {
  "jest": {
    "testEnvironment": "jsdom",
    "moduleNameMapper": {
      "\\.(css|scss|sass)$": "identity-obj-proxy"
    },
    "setupFilesAfterEnv": [
      "@testing-library/jest-dom",
      "<rootDir>/jest.setup.js"
    ],
    "transform": {
      "^.+\\.[jt]sx?$": "babel-jest"
    },
    "transformIgnorePatterns": [
      "<rootDir>/node_modules/"
    ]
  }
  }
  ```

4. **Update the Babel Configuration** for Jest compatibility. Create a `.babelrc` file in the `client` directory:
   ```json
   {
     "presets": ["@babel/preset-env", "@babel/preset-react"]
   }
   ```

5. **Update `vite.config.js`** in the client folder to work well with Jest:
  ```javascript
  import { defineConfig } from 'vite'
  import react from "@vitejs/plugin-react";
  import react from '@vitejs/plugin-react-swc'

  // https://vitejs.dev/config/
  export default defineConfig({
    plugins: [react()],
    test: {
      environment: "jsdom",
    },
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(
        process.env.VITE_API_URL || "http://localhost:5000"
      ),
    },
  });
  ```

6. **Add a Jest Setup File** `jest.setup.js` file in your project root to mock `import.meta.env`.
```javascript
// client/jest.setup.js
globalThis.importMetaEnv = {
  VITE_API_URL: "http://localhost:5000", // default or testing URL
};

// Mock import.meta.env
Object.defineProperty(global, "import", {
  value: {
    meta: {
      env: globalThis.importMetaEnv,
    },
  },
});
```

7. **Add a Sample Test** in `client/src/components/ContactForm.test.jsx`:
   ```javascript
   import { render, screen } from '@testing-library/react';
   import ContactForm from './ContactForm';

   test('renders ContactForm component', () => {
     render(<ContactForm />);
     expect(screen.getByText(/submit/i)).toBeInTheDocument();
   });
   ```

---

### Step 2: Configure Yarn and Jest in the Backend (`server`)

1. **Navigate to the server folder:**
   ```bash
   cd ../server
   ```

2. **Initialize Yarn and Install Jest:**
   ```bash
   yarn init -y
   yarn add jest supertest --dev
   yarn add -D @babel/preset-env @testing-library/dom @babel/preset-react jest-environment-jsdom
```

3. **Add Jest Configurations** to `server/package.json`:
   ```json
   {
     "jest": {
       "testEnvironment": "node"
     },
     "scripts": {
       "test": "jest"
     }
   }
   ```

4. **Add a Sample Test** in `server/tests/contactRoutes.test.js`:
   - Create the `tests` directory and add a test for the `contactRoutes.js`.
   ```javascript
   const request = require('supertest');
   const app = require('../server');

   describe('GET /contacts', () => {
     it('responds with a list of contacts', async () => {
       const response = await request(app).get('/contacts');
       expect(response.statusCode).toBe(200);
       expect(Array.isArray(response.body)).toBe(true);
     });
   });
   ```

---

### Step 3: Root Level Yarn Configuration

1. **Return to the root directory** of your project:
   ```bash
   cd ..
   ```

2. **Install Jest Globally** for the root to ensure both `client` and `server` tests can be run:
   ```bash
   yarn add jest --dev
   ```

3. **Add a Root-Level Testing Script** to `address-book-react/package.json`:
   - Add `workspaces` to enable root-level Yarn commands for both `client` and `server`.
   - Add a `test` script to run both tests at once.
   ```json
   {
     "private": true,
     "workspaces": ["client", "server"],
     "scripts": {
       "test": "yarn workspace client test && yarn workspace server test"
     }
   }
   ```

---

### Step 4: Running the Tests

From the root of your project, you can now run all tests in both the frontend and backend by executing:

```bash
yarn test
```

This command will run Jest tests for both `client` and `server` directories, allowing you to confirm that the application is working as expected.

--- 

### Summary

This setup ensures:
- **Frontend (client)** uses Jest and Testing Library for React testing.
- **Backend (server)** uses Jest and Supertest for API route testing.
- **Unified Testing Command** from the project’s root using Yarn.


