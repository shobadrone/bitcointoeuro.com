import Hero from "@/components/home/Hero";
import PriceDisplay from "@/components/home/PriceDisplay";
import Calculator from "@/components/home/Calculator";
import PriceChart from "@/components/home/PriceChart";
import ExchangeRatesTable from "@/components/home/ExchangeRatesTable";
import AboutSection from "@/components/home/AboutSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bitcoin to Euro Conversion | Real-time BTC/EUR Price | bitcointoeuro.com",
  description: "Bitcoin to Euro information with calculator, historic data and real-time exchange rates. Get accurate BTC to EUR exchange information and exchange options.",
  openGraph: {
    title: "Bitcoin to Euro Conversion | Real-time BTC/EUR Price",
    description: "Bitcoin to Euro information with calculator, historic data and real-time exchange rates. Get accurate BTC to EUR exchange information and exchange options.",
    type: "website",
  }
};

export default function Home() {
  return (
    <>
      <div style={{ position: 'relative' }}>
        <Hero />
        
        <section style={{ 
          padding: '1rem 0', 
          marginTop: '1.4rem', // Reduced margin by 30%
          position: 'relative',
          backgroundColor: 'var(--background)'
        }}>
          <PriceDisplay />
        </section>
        
        <section id="exchange-rates" style={{ 
          padding: '1rem 0 2rem', 
          marginTop: '2.5rem',
          position: 'relative',
          backgroundColor: 'var(--background)'
        }}>
          <ExchangeRatesTable />
        </section>
        
        <section id="calculator" style={{ 
          padding: '1rem 0 2rem', 
          marginTop: '2.5rem',
          position: 'relative',
          backgroundColor: 'var(--background)'
        }}>
          <Calculator />
        </section>
        
        <section id="price-chart" style={{ 
          padding: '1rem 0 2rem', 
          marginTop: '2.5rem',
          position: 'relative',
          backgroundColor: 'var(--background)'
        }}>
          <PriceChart />
        </section>
        
        <AboutSection />
      </div>
    </>
  );
}
