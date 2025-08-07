
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

interface Grant {
  id: string;
  title: string;
  agency: string;
  amount: string;
  deadline: string;
  description: string;
  category: string;
  industry_tags: string[];
  application_url: string;
}

export const useGrantMatches = () => {
  const { user } = useUser();

  return useQuery({
    queryKey: ['grant-matches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get user profile to access interests
      const { data: profile } = await supabase
        .from('profiles')
        .select('interests, industry')
        .eq('id', user.id)
        .single();

      if (!profile?.interests) return [];

      // Get grants that match user interests
      const { data: grants, error } = await supabase
        .from('grants')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter grants based on overlapping tags with user interests
      const matchedGrants = grants?.filter((grant: Grant) => {
        if (!grant.industry_tags) return false;
        
        const userInterests = profile.interests.map((interest: string) => 
          interest.toLowerCase()
        );
        
        const grantTags = grant.industry_tags.map((tag: string) => 
          tag.toLowerCase()
        );
        
        // Check for overlapping tags or industry match
        const hasOverlap = grantTags.some(tag => 
          userInterests.some(interest => 
            tag.includes(interest) || interest.includes(tag)
          )
        );
        
        const industryMatch = profile.industry && 
          grantTags.some(tag => tag.includes(profile.industry.toLowerCase()));
        
        return hasOverlap || industryMatch;
      }) || [];

      // Sort by relevance (more tag matches = higher relevance)
      return matchedGrants.sort((a, b) => {
        const aMatches = a.industry_tags?.filter(tag => 
          profile.interests.some((interest: string) => 
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        ).length || 0;
        
        const bMatches = b.industry_tags?.filter(tag => 
          profile.interests.some((interest: string) => 
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        ).length || 0;
        
        return bMatches - aMatches;
      }).slice(0, 6); // Limit to 6 matches
    },
    enabled: !!user?.id,
  });
};
