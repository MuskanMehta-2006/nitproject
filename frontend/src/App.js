import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Pages
import Pyqs from "./pages/Pyq";
import LostFound from "./pages/LostFound";
import Confession from "./pages/Confession";
import Notes from "./pages/Notes";

function App() {
  return (
    <Router>
      <div style={{ fontFamily: "Arial" }}>
        {/* Navbar */}
        <nav style={{
          background: "#007bff",
          color: "white",
          padding: "15px 40px",
          display: "flex",
          gap: "20px"
        }}>
          <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>PYQS Portal</Link>
          <Link to="/lostfound" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Lost & Found</Link>
          <Link to="/confession" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Confession Room</Link>
           <Link to="/notes" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>Notes Room </Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Pyqs />} />
          <Route path="/lostfound" element={<LostFound />} />
          <Route path="/confession" element={<Confession />} />
          <Route path="/notes" element={<Notes />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;