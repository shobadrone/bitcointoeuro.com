'use client';

import { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components - this only happens on the client side
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartInnerProps {
  data: any;
  options: any;
}

export function PriceChartInner({ data, options }: PriceChartInnerProps) {
  const [chartReady, setChartReady] = useState(false);
  
  // Make sure we're really on the client side
  useEffect(() => {
    setChartReady(true);
    console.log('[DEBUG] Chart component mounted on client');
  }, []);

  if (!chartReady) {
    // Show loading spinner while the chart is initializing
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(59, 130, 246, 0.1)',
          borderTop: '3px solid rgba(59, 130, 246, 0.8)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // Apply enhanced options
  const enhancedOptions = {
    ...options,
    responsive: true,
    maintainAspectRatio: false,
    onResize: (chart: any, size: any) => {
      console.log('[DEBUG] Chart resized:', size);
    }
  };
  
  return <Line data={data} options={enhancedOptions} />;
}