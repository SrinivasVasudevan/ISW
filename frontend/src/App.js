import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Table from './Table';
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/settings" element={<Table />} />
      </Routes>
    </BrowserRouter>
  );
}