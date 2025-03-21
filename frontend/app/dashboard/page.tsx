'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import BarChart from '@/components/charts/BarChart';
import { Input } from '@/components/ui/input';

// Mock data for charts
const mockYearLabels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'];

export default function Dashboard() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  
  // Mock properties data
  const properties = [
    {
      id: 'prop-001',
      title: 'Luxury Apartment Complex',
      location: 'New York, NY',
      totalValue: 5000000,
      monthlyRent: 25000,
      annualAppreciation: 5.2,
      riskScore: 25,
      aiScore: 85,
      imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'prop-002',
      title: 'Commercial Office Building',
      location: 'Chicago, IL',
      totalValue: 12000000,
      monthlyRent: 80000,
      annualAppreciation: 3.8,
      riskScore: 30,
      aiScore: 78,
      imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'prop-003',
      title: 'Suburban Housing Development',
      location: 'Austin, TX',
      totalValue: 8500000,
      monthlyRent: 42500,
      annualAppreciation: 6.5,
      riskScore: 20,
      aiScore: 92,
      imageUrl: 'https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    },
  ];

  // Mock user investments
  const userInvestments = [
    {
      id: 'inv-001',
      propertyId: 'prop-001',
      amount: 250000,
      percentage: 5,
      property: properties[0],
    },
    {
      id: 'inv-002',
      propertyId: 'prop-003',
      amount: 425000,
      percentage: 5,
      property: properties[2],
    },
  ];

  // Calculate projected revenue based on investment amount and property details
  const calculateProjectedRevenue = (property, amount) => {
    if (!property) return mockYearLabels.map(() => 0);
    
    const ownershipPercentage = amount / property.totalValue;
    const monthlyIncome = property.monthlyRent * ownershipPercentage;
    const annualIncome = monthlyIncome * 12;
    
    return mockYearLabels.map((_, index) => {
      // Compound growth with appreciation
      return Math.round(annualIncome * Math.pow(1 + (property.annualAppreciation / 100), index));
    });
  };

  // Calculate ROI over time
  const calculateROI = (property, amount) => {
    if (!property) return mockYearLabels.map(() => 0);
    
    const projectedRevenue = calculateProjectedRevenue(property, amount);
    
    return mockYearLabels.map((_, index) => {
      const totalRevenue = projectedRevenue.slice(0, index + 1).reduce((sum, val) => sum + val, 0);
      return Math.round((totalRevenue / amount) * 100);
    });
  };

  // Handle property selection
  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
  };

  // Handle investment amount change
  const handleAmountChange = (e) => {
    setInvestmentAmount(Number(e.target.value) || 0);
  };

  // Handle investment submission
  const handleInvest = () => {
    alert(`Investment of $${investmentAmount.toLocaleString()} in ${selectedProperty.title} submitted!`);
    // In a real app, this would call an API to create the investment
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Project Atlas</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">Notifications</Button>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Invested</CardTitle>
                  <CardDescription>Across all properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${(userInvestments.reduce((sum, inv) => sum + inv.amount, 0)).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Monthly Income</CardTitle>
                  <CardDescription>Passive rental income</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${Math.round(userInvestments.reduce((sum, inv) => {
                    const property = properties.find(p => p.id === inv.propertyId);
                    return sum + (property.monthlyRent * (inv.percentage / 100));
                  }, 0)).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Properties</CardTitle>
                  <CardDescription>Number of investments</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{userInvestments.length}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <PieChart 
                      title="Investment Distribution"
                      labels={userInvestments.map(inv => inv.property.title)}
                      datasets={[
                        {
                          label: 'Allocation',
                          data: userInvestments.map(inv => inv.amount),
                          backgroundColor: [
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                          ],
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Projected Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <LineChart 
                      title="10-Year Projection"
                      labels={mockYearLabels}
                      datasets={[
                        {
                          label: 'Annual Revenue ($)',
                          data: userInvestments.reduce((total, inv) => {
                            const property = properties.find(p => p.id === inv.propertyId);
                            const revenue = calculateProjectedRevenue(property, inv.amount);
                            return total.map((val, i) => val + revenue[i]);
                          }, Array(mockYearLabels.length).fill(0)),
                          borderColor: 'rgb(75, 192, 192)',
                          backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>My Investments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Investment</TableHead>
                      <TableHead>Ownership</TableHead>
                      <TableHead>Monthly Income</TableHead>
                      <TableHead>AI Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userInvestments.map((investment) => {
                      const property = properties.find(p => p.id === investment.propertyId);
                      return (
                        <TableRow key={investment.id}>
                          <TableCell className="font-medium">{property.title}</TableCell>
                          <TableCell>{property.location}</TableCell>
                          <TableCell>${investment.amount.toLocaleString()}</TableCell>
                          <TableCell>{investment.percentage}%</TableCell>
                          <TableCell>${Math.round(property.monthlyRent * (investment.percentage / 100)).toLocaleString()}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              property.aiScore >= 80 ? 'bg-green-100 text-green-800' : 
                              property.aiScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {property.aiScore}/100
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Properties Tab */}
          <TabsContent value="properties">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Available Properties</h2>
                <div className="space-y-4">
                  {properties.map((property) => (
                    <Card 
                      key={property.id} 
                      className={`cursor-pointer transition-all ${selectedProperty?.id === property.id ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => handlePropertySelect(property)}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/3 h-48 md:h-auto">
                          <img 
                            src={property.imageUrl} 
                            alt={property.title} 
                            className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                          />
                        </div>
                        <div className="w-full md:w-2/3 p-4">
                          <h3 className="text-xl font-bold">{property.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{property.location}</p>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Total Value</p>
                              <p className="font-semibold">${property.totalValue.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Monthly Rent</p>
                              <p className="font-semibold">${property.monthlyRent.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Annual Appreciation</p>
                              <p className="font-semibold">{property.annualAppreciation}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">AI Score</p>
                              <p className="font-semibold">{property.aiScore}/100</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(65, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">65% Funded</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                {selectedProperty ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Investment Simulator</CardTitle>
                      <CardDescription>
                        See projected returns for {selectedProperty.title}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                          Investment Amount ($)
                        </label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            value={investmentAmount}
                            onChange={handleAmountChange}
                            min={1000}
                            max={selectedProperty.totalValue}
                            step={1000}
                          />
                          <Button onClick={handleInvest}>Invest</Button>
                        </div>
                        <p className="text-sm mt-2">
                          Ownership: {((investmentAmount / selectedProperty.totalValue) * 100).toFixed(2)}%
                        </p>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-2">Projected Revenue</h4>
                          <div className="h-60">
                            <LineChart 
                              title="10-Year Revenue Projection"
                              labels={mockYearLabels}
                              datasets={[
                                {
                                  label: 'Annual Revenue ($)',
                                  data: calculateProjectedRevenue(selectedProperty, investmentAmount),
                                  borderColor: 'rgb(75, 192, 192)',
                                  backgroundColor: 'rgba(75, 192, 192, 0.5)',
                                }
                              ]}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Return on Investment</h4>
                          <div className="h-60">
                            <BarChart 
                              title="ROI Over Time (%)"
                              labels={mockYearLabels}
                              datasets={[
                                {
                                  label: 'ROI (%)',
                                  data: calculateROI(selectedProperty, investmentAmount),
                                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                }
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Investment Simulator</CardTitle>
                      <CardDescription>
                        Select a property to see projected returns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-96 flex items-center justify-center">
                      <p className="text-gray-500">Please select a property from the list</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <LineChart 
                      title="Historical & Projected Returns"
                      labels={['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030']}
                      datasets={[
                        {
                          label: 'Your Portfolio',
                          data: [0, 5.2, 11.5, 18.3, 26.1, 34.5, 43.8, 54.2],
                          borderColor: 'rgb(75, 192, 192)',
                          backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        },
                        {
                          label: 'S&P 500',
                          data: [0, 7.8, 15.9, 24.5, 33.6, 43.2, 53.4, 64.1],
                          borderColor: 'rgb(54, 162, 235)',
                          backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        },
                        {
                          label: 'REITs',
                          data: [0, 4.1, 8.4, 13.0, 17.8, 22.9, 28.3, 34.0],
                          borderColor: 'rgb(255, 99, 132)',
                          backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart 
                      title="Risk vs. Return Analysis"
                      labels={userInvestments.map(inv => {
                        const property = properties.find(p => p.id === inv.propertyId);
                        return property.title;
                      })}
                      datasets={[
                        {
                          label: 'Risk Score (Lower is Better)',
                          data: userInvestments.map(inv => {
                            const property = properties.find(p => p.id === inv.propertyId);
                            return property.riskScore;
                          }),
                          backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        },
                        {
                          label: 'AI Score (Higher is Better)',
                          data: userInvestments.map(inv => {
                            const property = properties.find(p => p.id === inv.propertyId);
                            return property.aiScore;
                          }),
                          backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        }
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
