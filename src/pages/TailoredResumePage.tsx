import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TailoredResumePage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/app/ats', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-slate-500">Redirecting to ATS Analysis...</p>
    </div>
  );
}
