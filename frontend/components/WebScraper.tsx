"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface PropertyData {
  propertyAddress: string;
  marketTrends: {
    priceHistory: Array<{ date: string; price: number }>;
    rentalYield: number;
    areaGrowth: number;
    similarProperties: Array<{
      address: string;
      price: number;
      sqft: number;
      pricePerSqft: number;
    }>;
  };
  locationAnalysis: {
    walkScore: number;
    transitScore: number;
    crimeRate: string;
  };
  financialMetrics: {
    purchasePrice: number;
    estimatedMonthlyRent: number;
    netOperatingIncome: number;
    capRate: number;
    cashOnCashReturn: number;
    appreciationForecast: number;
  };
  riskAssessment: {
    overall: string;
    score: number;
  };
  atlasScore?: number;
}

export default function WebScraper() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a property URL or address');
      return;
    }

    setLoading(true);
    setError('');
    setPropertyData(null);
    setAnalysisStep(1);

    try {
      // Simulate analysis steps
      await simulateAnalysisSteps();
      
      // Make actual API call
      const response = await fetch('/api/webscraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          searchCriteria: { autoAnalyze: true }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze property');
      }

      const result = await response.json();
      setPropertyData(result.data.propertyDetails);
      setAnalysisStep(5); // Complete
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAnalysisStep(0);
    } finally {
      setLoading(false);
    }
  };

  const simulateAnalysisSteps = async () => {
    // Simulate multiple steps of analysis
    const steps = [
      'Extracting property data...',
      'Analyzing market trends...',
      'Evaluating financial metrics...',
      'Calculating Atlas score...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">AI Property Analyzer</h2>
      <p className="mb-6 text-slate-600 dark:text-slate-300">
        Enter a property listing URL or address to perform an in-depth analysis using our AI web scraper.
      </p>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Enter property URL or address..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Property
              </>
            )}
          </Button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-6">
          <div className="space-y-2">
            <p className="text-slate-600 dark:text-slate-300 flex items-center">
              {analysisStep >= 1 && (
                analysisStep > 1 ? 
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : 
                <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-500" />
              )}
              Extracting property data
            </p>
            <p className="text-slate-600 dark:text-slate-300 flex items-center">
              {analysisStep >= 2 && (
                analysisStep > 2 ? 
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : 
                <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-500" />
              )}
              Analyzing market trends
            </p>
            <p className="text-slate-600 dark:text-slate-300 flex items-center">
              {analysisStep >= 3 && (
                analysisStep > 3 ? 
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : 
                <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-500" />
              )}
              Evaluating financial metrics
            </p>
            <p className="text-slate-600 dark:text-slate-300 flex items-center">
              {analysisStep >= 4 && (
                analysisStep > 4 ? 
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : 
                <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-500" />
              )}
              Calculating Atlas score
            </p>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${(analysisStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {propertyData && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
              {propertyData.propertyAddress}
            </h3>
            {propertyData.atlasScore && (
              <div className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full">
                <span className="font-bold mr-1">Atlas Score:</span> {propertyData.atlasScore}
              </div>
            )}
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Financial Overview</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Purchase Price:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ${propertyData.financialMetrics.purchasePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Monthly Rent:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ${propertyData.financialMetrics.estimatedMonthlyRent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Net Operating Income:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ${propertyData.financialMetrics.netOperatingIncome.toLocaleString()}/year
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Cap Rate:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {propertyData.financialMetrics.capRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Cash-on-Cash Return:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {propertyData.financialMetrics.cashOnCashReturn.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Projected Appreciation:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {propertyData.financialMetrics.appreciationForecast.toFixed(1)}%/year
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">Market Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Rental Yield:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {propertyData.marketTrends.rentalYield.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Area Growth:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {propertyData.marketTrends.areaGrowth.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Walk Score:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {propertyData.locationAnalysis.walkScore}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Transit Score:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {propertyData.locationAnalysis.transitScore}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Crime Rate:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {propertyData.locationAnalysis.crimeRate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Risk Assessment:</span>
                  <span className={`font-medium ${
                    propertyData.riskAssessment.overall === 'Low' ? 'text-green-600 dark:text-green-400' :
                    propertyData.riskAssessment.overall === 'Medium' ? 'text-amber-600 dark:text-amber-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {propertyData.riskAssessment.overall} ({propertyData.riskAssessment.score}/100)
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              Add to Investment Watchlist
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 