"use client";

import { useState, useEffect, useRef } from 'react';
import useHistoricalPrices from '@/lib/api/useHistoricalPrices';
import { TimeFrame } from '@/lib/api/historicalData';
import dynamic from 'next/dynamic';

// Type definition to prevent TypeScript errors with ApexCharts
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'apex-charts': any;
    }
  }
}

// Dynamic import of ApexCharts with SSR disabled
// This is critical for Next.js to avoid SSR rendering issues with ApexCharts
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function PriceChart() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('60d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showLoadingState, setShowLoadingState] = useState<boolean>(false);
  const [chartMounted, setChartMounted] = useState<boolean>(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chartRef = useRef<any>(null);
  
  const { historicalData, isLoading: isDataLoading, isError, mutate } = useHistoricalPrices(selectedTimeFrame);
  
  // Force refresh when timeframe changes
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setSelectedTimeFrame(newTimeFrame);
    
    // Set a small timeout to ensure the SWR key has updated before mutating
    setTimeout(() => {
      mutate();
    }, 50);
  };
  
  // Handle loading states with a delay to prevent flickering for fast loads
  useEffect(() => {
    if (isDataLoading) {
      // Only show loading state if it takes more than 300ms
      loadingTimerRef.current = setTimeout(() => {
        setShowLoadingState(true);
      }, 300);
      setIsLoading(true);
    } else {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      setShowLoadingState(false);
      setIsLoading(false);
    }
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [isDataLoading]);

  // On mount confirmation (client-side only)
  useEffect(() => {
    setChartMounted(true);
    
    // Force initial data fetch when component mounts
    const timer = setTimeout(() => {
      console.log('[DEBUG] PriceChart: Triggering initial data fetch');
      console.log('[DEBUG] ENV VAR CHECK:', process.env.NEXT_PUBLIC_LCW_API_KEY ? 'API key is set' : 'API key is NOT set');
      mutate();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [mutate]);

  // Format dates based on timeframe - reused by both tooltip and axes
  const formatDate = (timestamp: number, forTooltip = false) => {
    const date = new Date(timestamp);
    
    if (forTooltip) {
      // More detailed format for tooltips
      switch (selectedTimeFrame) {
        case '7d':
        case '60d':
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        case '1y':
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        case '5y':
          return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        default:
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } else {
      // Shorter format for axis labels
      switch (selectedTimeFrame) {
        case '7d':
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        case '60d':
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        case '1y':
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        case '5y':
          return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        default:
          return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      }
    }
  };

  // Format data for ApexCharts - convert historical data to series format
  const formatApexData = () => {
    if (!historicalData || !historicalData.data || historicalData.data.length === 0) {
      console.log('[DEBUG] No historical data available for chart');
      return {
        series: [{
          name: 'Bitcoin Price (EUR)',
          data: []
        }],
        categories: []
      };
    }
    
    const timestamps = historicalData.data.map(point => point.timestamp);
    const prices = historicalData.data.map(point => point.price);
    const categories = timestamps.map(ts => formatDate(ts));
    
    // Data integrity check
    console.log('[DEBUG] Chart data integrity check:');
    console.log(`Categories: ${categories.length} items, First: "${categories[0]}", Last: "${categories[categories.length-1]}"`);
    console.log(`Prices: ${prices.length} items, First: ${prices[0]}, Last: ${prices[prices.length-1]}`);
    
    // Format data for ApexCharts
    const series = [{
      name: 'Bitcoin Price (EUR)',
      data: prices
    }];
    
    return { series, categories };
  };

  // ApexCharts options - similar appearance to original Chart.js but with ApexCharts format
  const getChartOptions = () => {
    const { categories } = formatApexData();
    
    const options = {
      chart: {
        type: 'area',
        height: 400,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        background: 'transparent',
        toolbar: {
          show: false
        },
        animations: {
          enabled: true, // Enable animations, but can be disabled if causing issues
          dynamicAnimation: {
            enabled: true
          }
        }
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          opacityFrom: 0.3,
          opacityTo: 0.0
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#3B82F6'], // Primary blue color
      grid: {
        borderColor: 'rgba(75, 85, 99, 0.1)',
        row: {
          opacity: 0.5
        }
      },
      markers: {
        size: categories.length < 15 ? 4 : 0,
        strokeWidth: 2,
        strokeColors: '#FFFFFF',
        colors: '#3B82F6'
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: 'rgba(156, 163, 175, 0.9)',
            fontSize: '10px'
          },
          rotate: 0
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        labels: {
          formatter: function(value) {
            return new Intl.NumberFormat('de-DE', { 
              style: 'currency', 
              currency: 'EUR',
              notation: 'compact' 
            }).format(value);
          },
          style: {
            colors: 'rgba(156, 163, 175, 0.9)',
            fontSize: '10px'
          }
        }
      },
      tooltip: {
        theme: 'dark',
        shared: true,
        intersect: false,
        y: {
          formatter: function(value) {
            return new Intl.NumberFormat('de-DE', { 
              style: 'currency', 
              currency: 'EUR' 
            }).format(value);
          }
        },
        x: {
          formatter: function(value, { series, seriesIndex, dataPointIndex }) {
            if (historicalData?.data?.[dataPointIndex]?.timestamp) {
              return formatDate(historicalData.data[dataPointIndex].timestamp, true);
            }
            return value.toString();
          }
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        },
        marker: {
          show: true
        }
      }
    };
    
    return options;
  };

  // Format percentage change with + or - sign
  const formatPercentageChange = (value: number) => {
    const formattedValue = value.toFixed(2);
    return value >= 0 
      ? `+${formattedValue}%` 
      : `${formattedValue}%`;
  };

  const timeFrameLabels = {
    '7d': '7 Days',
    '60d': '60 Days',
    '1y': '1 Year',
    '5y': '5 Years'
  };

  return (
    <div id="price-chart" style={{
      backgroundColor: 'var(--card-background)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      padding: '26px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '640px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          color: 'var(--foreground)',
          margin: 0
        }}>
          Bitcoin Price History
        </h2>
        
        {!isLoading && historicalData && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.875rem',
              color: 'var(--muted)',
            }}>
              {selectedTimeFrame} change:
            </span>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: historicalData.changePercentage >= 0 ? 'var(--success)' : 'var(--error)',
              padding: '4px 8px',
              backgroundColor: historicalData.changePercentage >= 0 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '4px'
            }}>
              {formatPercentageChange(historicalData.changePercentage)}
            </span>
          </div>
        )}
      </div>
      
      <div 
        style={{
          height: '400px',
          minHeight: '400px',
          width: '100%',
          position: 'relative',
          margin: '0 auto',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
        className="chart-container"
      >
        {showLoadingState ? (
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
        ) : isError ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
            color: 'var(--error)'
          }}>
            <p>Failed to load price history data.</p>
            <button 
              onClick={() => handleTimeFrameChange(selectedTimeFrame)}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              Try Again
            </button>
          </div>
        ) : (!historicalData || !historicalData.data || historicalData.data.length === 0) ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
            color: 'var(--error)'
          }}>
            <p>No chart data available.</p>
            <button 
              onClick={() => handleTimeFrameChange(selectedTimeFrame)}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 9, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px', fontSize: '10px' }}>
              Debug: {historicalData.data.length} points | {selectedTimeFrame}
            </div>
            
            {/* ApexCharts wrapper - only render when on client side */}
            <div 
              style={{ 
                width: '100%', 
                height: '100%',
                position: 'relative'
              }}
              className="apexcharts-wrapper"
              id="apexcharts-wrapper"
            >
              {chartMounted && (
                <ReactApexChart
                  options={getChartOptions()}
                  series={formatApexData().series}
                  type="area"
                  height="100%"
                  width="100%"
                />
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Time frame selection buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '1.5rem',
        gap: '0.5rem'
      }}>
        {(['7d', '60d', '1y', '5y'] as TimeFrame[]).map((timeFrame) => (
          <button
            key={timeFrame}
            onClick={() => handleTimeFrameChange(timeFrame)}
            style={{
              backgroundColor: selectedTimeFrame === timeFrame 
                ? 'rgba(59, 130, 246, 0.8)' 
                : 'rgba(59, 130, 246, 0.1)',
              color: selectedTimeFrame === timeFrame 
                ? 'white' 
                : 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (selectedTimeFrame !== timeFrame) {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
              }
            }}
            onMouseOut={(e) => {
              if (selectedTimeFrame !== timeFrame) {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
              }
            }}
          >
            {timeFrameLabels[timeFrame]}
          </button>
        ))}
      </div>
    </div>
  );
}