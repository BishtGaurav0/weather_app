import React from 'react';
import logo from './logo.svg';
import './App.css';
import CityTable from './Component/CityTable';
import { Routes , Route } from 'react-router-dom';
import CityDetail from './Component/weather_page/CityDetail';

function App() {
  return (
    <div className="App">

        <Routes>
         
        <Route path='/' element={<CityTable />} />
        <Route path="/city/:cityName" element={<CityDetail/>} />
       
      </Routes>
    </div>
  );
}

export default App;
