import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Spin, AutoComplete, Input } from 'antd';
import { Link } from 'react-router-dom'; // Import Link
import 'antd/dist/reset.css';

interface City {
  City_Name: string;
  country: string;
  timezone: string;
}

const CityTable: React.FC = () => {
  const handleCityNameRightClick = (cityName: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button === 2) {
      // Right click
      e.preventDefault();
      window.open(`https://weather-website.com/${cityName}`, '_blank');
    }
  };
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&rows=20&start=${offset}&sort=name`
      );
      const newData = response.data.records.map((record: any) => ({
        City_Name: record.fields.name,
        country: record.fields.cou_name_en,
        timezone: record.fields.timezone,
      }));
      setCities(prevCities => [...prevCities, ...newData]);
      setOffset(prevOffset => prevOffset + 20);
      setHasMore(newData.length > 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchCities();
    }
  };

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    filterCities(value);
  };

  const filterCities = (value: string) => {
    const filtered = cities.filter(city => city.City_Name.toLowerCase().includes(value.toLowerCase()));
    setFilteredCities(filtered);
  };

  const columns = [
    {
      title: 'City Name',
      dataIndex: 'City_Name',
      key: 'City_Name',
      render: (text: string, record: City) => 
        <Link
          to={`/city/${record.City_Name}`}
          onContextMenu={(e) => handleCityNameRightClick(record.City_Name, e)}
        >
          {text}
        </Link>,
      sorter: (a: City, b: City) => a.City_Name.localeCompare(b.City_Name),
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      sorter: (a: City, b: City) => a.country.localeCompare(b.country),
    },
    {
      title: 'Timezone',
      dataIndex: 'timezone',
      key: 'timezone',
      sorter: (a: City, b: City) => a.timezone.localeCompare(b.timezone),
    },
  ];

  return (
    <div style={{ 

      maxWidth: '100%', 
      overflowX: 'auto', 
      backgroundImage: 'url("/images/backimg.jpg")', 
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      minHeight: '100vh', // Set minimum height to cover the full viewport height
  
     }}>
      <AutoComplete
        style={{ width: '100%', marginBottom: 16 }}
        value={searchTerm}
        onSearch={handleSearch}
        placeholder="Search for a city"
      >
        <Input.Search />
      </AutoComplete>
      <div style={{ maxHeight: '500px', overflowY: 'auto' }} onScroll={handleLoadMore}>
        <Table
          columns={columns}
          dataSource={filteredCities.length > 0 ? filteredCities : cities}
          pagination={false}
          rowKey={(record: City) => record.City_Name}
          loading={loading && hasMore}
          scroll={{ y: 400 }}
        />
        {loading && hasMore && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Spin size="large" tip="Loading..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default CityTable;
