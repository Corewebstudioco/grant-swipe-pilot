
import React, { useState } from 'react';
import { useGrants } from '@/contexts/GrantContext';
import { useUser } from '@/contexts/UserContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Building2, Clock, ExternalLink, Archive, Share2 } from 'lucide-react';

const Matches = () => {
  const { matches } = useGrants();
  const { user } = useUser();
  const [sortBy, setSortBy] = useState('match');
  const [filterIndustry, setFilterIndustry] = useState('all');

  if (!user) {
    return <div>Please log in to view your matches.</div>;
  }

  const sortedMatches = [...matches].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'amount':
        return parseInt(b.amount.replace(/[$,]/g, '')) - parseInt(a.amount.replace(/[$,]/g, ''));
      case 'match':
      default:
        return b.matchPercentage - a.matchPercentage;
    }
  });

  const filteredMatches = sortedMatches.filter(grant => 
    filterIndustry === 'all' || grant.industry.includes(filterIndustry)
  );

  const getUrgencyColor = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return 'text-red-600 bg-red-50';
    if (days <= 30) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const formatDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Deadline passed';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Matches</h1>
              <p className="text-gray-600 mt-1">
                {filteredMatches.length} grants matched to your interests
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Energy">Energy</SelectItem>
                  <SelectItem value="Defense">Defense</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Match Percentage</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="amount">Funding Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-500 mb-6">
              Start swiping to find grants that match your business needs
            </p>
            <Button asChild>
              <a href="/discover">Start Discovering Grants</a>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((grant) => (
              <Card key={grant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2">
                        {grant.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {grant.organization}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {grant.matchPercentage}% match
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
                      <DollarSign className="w-5 h-5" />
                      {grant.amount}
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getUrgencyColor(grant.deadline)}`}>
                      <Clock className="w-4 h-4" />
                      {formatDeadline(grant.deadline)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Key Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {grant.requirements.slice(0, 3).map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {grant.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      Apply Now
                    </Button>
                    <Button variant="outline" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
