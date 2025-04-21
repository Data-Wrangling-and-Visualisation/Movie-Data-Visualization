import React, { useEffect, useState } from 'react';
import TrustedPeopleSlider from './TrustedPeopleSlider';

const TrustedSection = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/trusted_people`)
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p>Downloading...</p>;

  return (
    <>
      <TrustedPeopleSlider people={data.topDirectors} title="Top directors:" />
      <TrustedPeopleSlider people={data.topActors} title="Top actors:" />
    </>
  );
};

export default TrustedSection;
