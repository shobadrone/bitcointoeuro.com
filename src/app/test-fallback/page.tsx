"use client";

import { useState, useEffect } from 'react';
import { runTests, forceCoinGeckoFailure, testDirectFallback, testFullErrorHandling } from '@/lib/api/test-fallback';
import { TimeFrame } from '@/lib/api/historicalData';

export default function TestFallbackPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string>('all');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1y');

  // Capture console logs for display
  useEffect(() => {
    // Save original console methods
    const originalLog = console.log;
    const originalError = console.error;
    
    // Override console methods to capture output
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prevLogs => [...prevLogs, message]);
      originalLog.apply(console, args);
    };
    
    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prevLogs => [...prevLogs, `ERROR: ${message}`]);
      originalError.apply(console, args);
    };
    
    // Restore original console methods on cleanup
    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const runSelectedTest = async () => {
    setLogs([]);
    setIsRunning(true);
    
    try {
      switch (selectedTest) {
        case 'all':
          await runTests();
          break;
        case 'force-failure':
          await forceCoinGeckoFailure(timeFrame);
          break;
        case 'direct-fallback':
          await testDirectFallback(timeFrame);
          break;
        case 'full-flow':
          await testFullErrorHandling(timeFrame);
          break;
      }
    } catch (error: any) {
      console.error('Test failed:', error.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Fallback API Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>
          Test:
          <select 
            value={selectedTest} 
            onChange={(e) => setSelectedTest(e.target.value)}
            style={{ 
              marginLeft: '10px', 
              padding: '8px 12px', 
              borderRadius: '4px',
              backgroundColor: 'var(--card-background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)'
            }}
          >
            <option value="all">Run All Tests</option>
            <option value="force-failure">Force CoinGecko Failure</option>
            <option value="direct-fallback">Direct Bitfinex Test</option>
            <option value="full-flow">Full Error Flow</option>
          </select>
        </label>
        
        <label style={{ marginLeft: '20px', marginRight: '10px' }}>
          Timeframe:
          <select 
            value={timeFrame} 
            onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
            style={{ 
              marginLeft: '10px', 
              padding: '8px 12px', 
              borderRadius: '4px',
              backgroundColor: 'var(--card-background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)'
            }}
          >
            <option value="7d">7 Days</option>
            <option value="60d">60 Days</option>
            <option value="1y">1 Year</option>
            <option value="5y">5 Years</option>
          </select>
        </label>
        
        <button 
          onClick={runSelectedTest} 
          disabled={isRunning}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            marginLeft: '20px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.7 : 1
          }}
        >
          {isRunning ? 'Running...' : 'Run Test'}
        </button>
      </div>
      
      <div 
        style={{ 
          backgroundColor: '#121212', 
          border: '1px solid #333', 
          borderRadius: '4px',
          padding: '16px',
          height: '500px',
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap'
        }}
      >
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div 
              key={index} 
              style={{ 
                color: log.startsWith('ERROR') ? '#ff6b6b' : 
                       log.includes('SUCCESS') ? '#51cf66' : 
                       log.includes('FAILED') ? '#ff6b6b' : 
                       log.startsWith('---') ? '#ffd43b' : '#f8f9fa',
                marginBottom: '4px'
              }}
            >
              {log}
            </div>
          ))
        ) : (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '200px' }}>
            Select a test and click "Run Test" to see results
          </div>
        )}
      </div>
    </div>
  );
}