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
  
  // Apply enhanced options with debugging
  const enhancedOptions = {
    ...options,
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 1, // Force 1:1 pixel ratio to avoid scaling issues
    animation: {
      duration: 0 // Disable animations for initial rendering
    },
    onResize: (chart: any, size: any) => {
      console.log('[DEBUG] Chart resized:', size);
      
      // Update debug element with size info
      const debugEl = document.getElementById('chart-size-debug');
      if (debugEl) {
        debugEl.textContent = `Canvas: ${size.width}x${size.height}`;
      }
    },
    // Add initial animation for debug purposes
    plugins: {
      ...(options.plugins || {}),
      legend: {
        display: false,
      },
      // Add a custom debug plugin
      customCanvasBackgroundColor: {
        beforeDraw: (chart: any) => {
          const ctx = chart.canvas.getContext('2d');
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
          
          // Log chart dimensions
          console.log(`[DEBUG] Chart canvas size: ${chart.width}x${chart.height}`);
        }
      }
    }
  };
  
  // Add a wrapper div with explicit dimensions to ensure chart has proper container
  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        minHeight: '300px',
        display: 'block'
      }}
      className="chart-js-wrapper"
    >
      <div id="chart-size-debug" style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        padding: '2px 4px',
        fontSize: '8px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        zIndex: 999
      }}/>
      
      <Line 
        data={data} 
        options={enhancedOptions}
        // Log rendering in console
        ref={(ref) => {
          if (ref) {
            console.log('[DEBUG] Chart ref dimensions:', {
              canvas: ref.canvas,
              width: ref.canvas?.width,
              height: ref.canvas?.height,
              style: ref.canvas?.style,
              parentNode: ref.canvas?.parentNode,
              parent: ref.canvas?.parentElement,
            });
            
            // Update size debug element
            const debugEl = document.getElementById('chart-size-debug');
            if (debugEl && ref.canvas) {
              debugEl.textContent = `Canvas: ${ref.canvas.width}x${ref.canvas.height}`;
            }
          }
        }}
      />
    </div>
  );
}