import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import FormPage from "./pages/FormPage";
import ListPage from "./pages/ListPage";

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
