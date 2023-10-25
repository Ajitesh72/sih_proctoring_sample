import React, { useEffect, useState } from "react";

const Cheating = () => {
  const [cheatingImages, setCheatingImages] = useState([]);

  useEffect(() => {
    // Function to load images dynamically
    const importImages = async () => {
      const importedImages = [];

      for (let i = 1; i <= 7; i++) {
        try {
          const image = await import(`./cheating/${i}.jpg`);
          importedImages.push(image.default);
        } catch (error) {
          console.error(`Error importing image ${i}.jpg:`, error);
        }
      }

      setCheatingImages(importedImages);
    };

    importImages();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white w-full max-w-xl p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-blue-500">Cheating Instances Found</h1>
       {cheatingImages.length>0 && <div className="grid grid-cols-2 gap-4">
          {cheatingImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Cheating ${index + 1}`}
              className="max-w-full max-h-48 mb-2"
            />
          ))}
        </div>}
      </div>
    </div>
  );
};

export default Cheating;
