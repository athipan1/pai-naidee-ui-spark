import React, { useState, useEffect } from 'react';
import { getAttractions } from '@/services/attraction.service';
import { AttractionDetail } from '@/shared/types/attraction';

type AttractionTeaser = Pick<AttractionDetail, 'id' | 'name'>;

const AttractionListTest: React.FC = () => {
  const [attractions, setAttractions] = useState<AttractionTeaser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        const response = await getAttractions();
        // The backend seems to return { attractions: [...] }
        setAttractions(response.attractions);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error('Error fetching attractions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, []);

  if (loading) {
    return <div>Loading attractions...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Attractions from HuggingFace Backend</h2>
      {attractions.length === 0 ? (
        <p>No attractions found.</p>
      ) : (
        <ul>
          {attractions.map((attraction) => (
            <li key={attraction.id}>{attraction.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttractionListTest;
