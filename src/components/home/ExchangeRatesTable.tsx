"use client";

import { useEffect, useState } from 'react';
import useExchangeRates from '@/lib/api/useExchangeRates';
import { ExchangeRate } from '@/lib/api/exchangeRates';

export default function ExchangeRatesTable() {
  const { rates, isLoading, isError } = useExchangeRates(60000); // Update every minute
  const [formattedRates, setFormattedRates] = useState<ExchangeRate[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (rates && rates.length > 0) {
      // Sort rates with the lowest price first
      const sortedRates = [...rates].sort((a, b) => a.price - b.price);
      setFormattedRates(sortedRates);
      
      // Format last updated time
      const date = new Date(rates[0].lastUpdated);
      setLastUpdated(
        date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      );
    }
  }, [rates]);

  return (
    <div style={{
      backgroundColor: 'var(--card-background)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      padding: '26px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxWidth: '840px',
      margin: '0 auto',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        <h2 style={{ 
          fontSize: '1.4rem', 
          fontWeight: 600, 
          color: 'var(--foreground)',
          marginBottom: '0.75rem',
          textAlign: 'center'
        }}>
          Exchange Rate Comparison
        </h2>
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--muted)',
          textAlign: 'center',
          maxWidth: '700px',
          margin: '0 auto 1.25rem'
        }}>
          Compare BTC/EUR rates across popular exchanges to find the best place to buy or sell Bitcoin.
        </p>
        
        {isLoading && !formattedRates.length && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--muted)'
          }}>
            Loading exchange rates...
          </div>
        )}
        
        {isError && !formattedRates.length && (
          <div style={{
            marginTop: '1rem',
            padding: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--error)', fontSize: '0.875rem' }}>
              Unable to fetch exchange rates. Please try again later.
            </p>
          </div>
        )}
        
        {formattedRates.length > 0 && (
          <>
            <div style={{
              width: '100%',
              overflowX: 'auto'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0',
                fontSize: '0.95rem'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      textAlign: 'left',
                      padding: '12px 16px',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      Exchange
                    </th>
                    <th style={{
                      textAlign: 'right',
                      padding: '12px 16px',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      BTC/EUR Rate
                    </th>
                    <th style={{
                      textAlign: 'right',
                      padding: '12px 16px',
                      fontWeight: 600,
                      color: 'var(--muted)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      Fees
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formattedRates.map((rate, index) => (
                    <tr key={rate.exchangeName} style={{
                      backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                    }}>
                      <td style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--border)',
                        color: 'var(--foreground)',
                        fontWeight: index === 0 ? 600 : 400,
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {rate.exchangeName}
                            {index === 0 && (
                              <span style={{
                                marginLeft: '8px',
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                borderRadius: '4px',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                color: 'var(--success)',
                              }}>
                                BEST RATE
                              </span>
                            )}
                          </div>
                          
                          <a 
                            href={rate.exchangeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              backgroundColor: 'var(--accent)',
                              color: '#fff',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                              transition: 'background-color 0.2s ease',
                              textAlign: 'center',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--accent)';
                            }}
                          >
                            Exchange BTC/EUR now
                          </a>
                        </div>
                      </td>
                      <td style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--border)',
                        textAlign: 'right',
                        color: 'var(--foreground)',
                        fontWeight: index === 0 ? 600 : 400,
                      }}>
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(rate.price)}
                      </td>
                      <td style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--border)',
                        textAlign: 'right',
                        color: 'var(--muted)',
                        fontWeight: index === 0 ? 600 : 400,
                      }}>
                        {rate.fees}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{
              marginTop: '1rem',
              fontSize: '0.875rem',
              color: 'var(--muted)',
              textAlign: 'center'
            }}>
              <p>Last updated at: {lastUpdated || 'Loading...'}</p>
              <p style={{ 
                fontSize: '0.8rem', 
                marginTop: '0.5rem',
                maxWidth: '600px'
              }}>
                Note: Fees may vary based on account tier, trading volume, and payment method. Please check each exchange for current fee information.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}