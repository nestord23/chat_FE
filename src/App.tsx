import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/login/Login";
import Register from "./components/login/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
