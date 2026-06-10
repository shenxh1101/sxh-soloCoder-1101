import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import DocumentDemo from "@/pages/DocumentDemo";
import DesignDemo from "@/pages/DesignDemo";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/demo/document" element={<DocumentDemo />} />
        <Route path="/demo/design" element={<DesignDemo />} />
        <Route path="/demo/course" element={<DocumentDemo />} />
      </Routes>
    </Router>
  );
}