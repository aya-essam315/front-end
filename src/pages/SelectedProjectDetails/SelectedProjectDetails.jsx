import React, { useState, useEffect } from 'react';

const SelectedProjectDetails = () => {
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // هنا هتجيب البيانات من الـ API بناءً على المشروع المختار
    const fetchProjectDetails = async () => {
      try {
        // استبدل العنوان ده بعنوان الـ API الفعلي
        const response = await fetch('https://api.example.com/projects/details');
        const data = await response.json();
        setProjectDetails(data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!projectDetails) {
    return <div>No project details available.</div>;
  }

  return (
    <div>
      <h2>{projectDetails.name}</h2>
      <p>{projectDetails.description}</p>
      {/* هنا ممكن تضيف تفاصيل تانية بناءً على الـ response من الـ API */}
    </div>
  );
};

export default SelectedProjectDetails;
