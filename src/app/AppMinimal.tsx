import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

const MinimalAttractionDetail = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Attraction Detail Page</h1>
      <p>This is a minimal test page</p>
    </div>
  );
};

const MinimalApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div><h1>Home Page</h1></div>} />
        <Route path="/attraction/:id" element={<MinimalAttractionDetail />} />
        <Route path="*" element={<div><h1>404 Not Found</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default MinimalApp;