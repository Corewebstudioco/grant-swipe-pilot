
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Grant {
  id: string;
  title: string;
  organization: string;
  amount: string;
  deadline: string;
  matchPercentage: number;
  industry: string[];
  requirements: string[];
  tags: string[];
  urgency: 'high' | 'medium' | 'low';
}

interface GrantContextType {
  grants: Grant[];
  currentGrantIndex: number;
  matches: Grant[];
  passed: Grant[];
  viewedGrants: string[];
  handleSwipe: (grantId: string, interested: boolean) => void;
  resetStack: () => void;
  getCurrentGrant: () => Grant | null;
  getRemainingCount: () => number;
}

const sampleGrants: Grant[] = [
  {
    id: "grant-001",
    title: "Small Business Innovation Research",
    organization: "Department of Defense",
    amount: "$500,000",
    deadline: "2025-03-15",
    matchPercentage: 95,
    industry: ["Technology", "Defense"],
    requirements: [
      "US-based company",
      "R&D focused project",
      "Under 500 employees",
      "Previous innovation experience"
    ],
    tags: ["Innovation", "Research", "Technology"],
    urgency: "high"
  },
  {
    id: "grant-002",
    title: "Tech Development Fund",
    organization: "State Economic Development",
    amount: "$250,000",
    deadline: "2025-04-30",
    matchPercentage: 88,
    industry: ["Technology", "Manufacturing"],
    requirements: [
      "Technology-focused business",
      "Job creation commitment",
      "Located in qualifying region",
      "Minimum 2 years operation"
    ],
    tags: ["Technology", "Development", "Jobs"],
    urgency: "medium"
  },
  {
    id: "grant-003",
    title: "Green Energy Innovation Grant",
    organization: "Environmental Protection Agency",
    amount: "$750,000",
    deadline: "2025-02-28",
    matchPercentage: 72,
    industry: ["Energy", "Environment"],
    requirements: [
      "Clean energy focus",
      "Environmental impact plan",
      "Partnership with research institution",
      "3+ years business history"
    ],
    tags: ["Sustainability", "Innovation", "Energy"],
    urgency: "high"
  },
  {
    id: "grant-004",
    title: "Export Development Program",
    organization: "Department of Commerce",
    amount: "$100,000",
    deadline: "2025-05-15",
    matchPercentage: 91,
    industry: ["Manufacturing", "Technology"],
    requirements: [
      "Export-ready products",
      "International market plan",
      "Under $50M annual revenue",
      "First-time exporter eligible"
    ],
    tags: ["Export", "International", "Trade"],
    urgency: "low"
  },
  {
    id: "grant-005",
    title: "Workforce Training Initiative",
    organization: "Department of Labor",
    amount: "$300,000",
    deadline: "2025-06-01",
    matchPercentage: 85,
    industry: ["Education", "Technology"],
    requirements: [
      "Employee training program",
      "Skills development focus",
      "Partnership with training provider",
      "Measurable outcomes plan"
    ],
    tags: ["Training", "Workforce", "Skills"],
    urgency: "low"
  },
  {
    id: "grant-006",
    title: "Rural Business Development Grant",
    organization: "USDA Rural Development",
    amount: "$150,000",
    deadline: "2025-04-15",
    matchPercentage: 78,
    industry: ["Agriculture", "Rural"],
    requirements: [
      "Rural location required",
      "Job creation in rural area",
      "Sustainable business model",
      "Community impact plan"
    ],
    tags: ["Rural", "Development", "Community"],
    urgency: "medium"
  },
  {
    id: "grant-007",
    title: "Minority Business Enterprise Fund",
    organization: "Small Business Administration",
    amount: "$200,000",
    deadline: "2025-03-30",
    matchPercentage: 82,
    industry: ["General", "Minority-owned"],
    requirements: [
      "Minority-owned business",
      "Operating for 2+ years",
      "Growth potential demonstrated",
      "Mentorship participation"
    ],
    tags: ["Minority", "Enterprise", "Growth"],
    urgency: "medium"
  },
  {
    id: "grant-008",
    title: "Healthcare Innovation Challenge",
    organization: "National Institutes of Health",
    amount: "$1,000,000",
    deadline: "2025-07-30",
    matchPercentage: 67,
    industry: ["Healthcare", "Technology"],
    requirements: [
      "Healthcare technology focus",
      "Clinical validation plan",
      "FDA regulatory pathway",
      "Patient benefit demonstration"
    ],
    tags: ["Healthcare", "Innovation", "Technology"],
    urgency: "low"
  },
  {
    id: "grant-009",
    title: "Advanced Manufacturing Grant",
    organization: "National Science Foundation",
    amount: "$400,000",
    deadline: "2025-05-30",
    matchPercentage: 89,
    industry: ["Manufacturing", "Technology"],
    requirements: [
      "Advanced manufacturing focus",
      "Research collaboration",
      "IP development plan",
      "Commercialization pathway"
    ],
    tags: ["Manufacturing", "Advanced", "Research"],
    urgency: "medium"
  },
  {
    id: "grant-010",
    title: "Cybersecurity Innovation Fund",
    organization: "Department of Homeland Security",
    amount: "$350,000",
    deadline: "2025-04-01",
    matchPercentage: 93,
    industry: ["Technology", "Security"],
    requirements: [
      "Cybersecurity solution",
      "Government application potential",
      "Security clearance capability",
      "Scalable technology"
    ],
    tags: ["Cybersecurity", "Innovation", "Security"],
    urgency: "medium"
  }
];

const GrantContext = createContext<GrantContextType | undefined>(undefined);

export const useGrants = () => {
  const context = useContext(GrantContext);
  if (context === undefined) {
    throw new Error('useGrants must be used within a GrantProvider');
  }
  return context;
};

export const GrantProvider = ({ children }: { children: ReactNode }) => {
  const [grants] = useState<Grant[]>(sampleGrants);
  const [currentGrantIndex, setCurrentGrantIndex] = useState(0);
  const [matches, setMatches] = useState<Grant[]>([]);
  const [passed, setPassed] = useState<Grant[]>([]);
  const [viewedGrants, setViewedGrants] = useState<string[]>([]);

  const handleSwipe = (grantId: string, interested: boolean) => {
    const grant = grants.find(g => g.id === grantId);
    if (!grant) return;

    setViewedGrants(prev => [...prev, grantId]);
    
    if (interested) {
      setMatches(prev => [...prev, grant]);
    } else {
      setPassed(prev => [...prev, grant]);
    }
    
    setCurrentGrantIndex(prev => prev + 1);
  };

  const resetStack = () => {
    setCurrentGrantIndex(0);
    setMatches([]);
    setPassed([]);
    setViewedGrants([]);
  };

  const getCurrentGrant = (): Grant | null => {
    return grants[currentGrantIndex] || null;
  };

  const getRemainingCount = (): number => {
    return Math.max(0, grants.length - currentGrantIndex);
  };

  return (
    <GrantContext.Provider value={{
      grants,
      currentGrantIndex,
      matches,
      passed,
      viewedGrants,
      handleSwipe,
      resetStack,
      getCurrentGrant,
      getRemainingCount
    }}>
      {children}
    </GrantContext.Provider>
  );
};
