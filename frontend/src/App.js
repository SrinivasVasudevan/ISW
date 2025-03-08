import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Table from './Table';
import './App.css'
import Analytics from './Analytics';
import { useState, useEffect } from 'react';
import Pagination from './Pagination';

export default function App() {
  const [liveMode, setLiveMode] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const url = liveMode
      ? `http://127.0.0.1:5000/api/settings?page=${page}&per_page=10&live_mode=true`
      : `http://127.0.0.1:5000/api/settings?live_mode=false`;

    console.log(url)

    fetch(url)
      .then(response => response.json())
      .then(result => {
        console.log(result)
        if (liveMode) setTotalPages(result.total)
      })
      .catch(error => console.error('Error:', error));

    if (liveMode) {

    }
  }, [page, liveMode])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/settings" element={<Table totalPages={totalPages} setTotalPages={setTotalPages} liveMode={liveMode} pageNum={page} setLiveMode={setLiveMode} />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </BrowserRouter>
      {liveMode && <Pagination page={page} onPageChange={setPage} totalPages={totalPages} />}
    </>

  );
}