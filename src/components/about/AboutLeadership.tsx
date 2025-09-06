import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface LeadershipMessage {
  id: string;
  position: string;
  person_name: string;
  person_title: string;
  message_content: string;
  photo_url?: string;
  display_order: number;
}

const AboutLeadership = () => {
  const [leaders, setLeaders] = useState<LeadershipMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeadership();
  }, []);

  const loadLeadership = async () => {
    try {
      const { data, error } = await supabase
        .from('leadership_messages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      if (data) {
        setLeaders(data);
      }
    } catch (error) {
      console.error('Error loading leadership:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-96 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (leaders.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
            Messages from Leadership
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Hear from our dedicated leadership team about our commitment to educational excellence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {leaders.map((leader) => (
            <Card key={leader.id} className="p-6 shadow-card hover:shadow-elegant transition-smooth bg-card">
              <div className="text-center mb-6">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={leader.photo_url} alt={leader.person_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(leader.person_name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-heading font-bold text-primary mb-1">
                  {leader.person_name}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">
                  {leader.person_title}
                </p>
              </div>
              
              <blockquote className="text-foreground/80 leading-relaxed text-center italic">
                "{leader.message_content}"
              </blockquote>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutLeadership;