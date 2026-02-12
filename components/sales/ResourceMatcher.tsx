"use client";

import { useEffect, useState } from "react";
import { findMatchingConsultants, MatchResult, SalesLead, getLeadRequirements } from "@/app/actions/sales";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ResourceMatcher({ lead }: { lead: SalesLead }) {
  const { t } = useLanguage();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
        setLoading(true);
        try {
            const reqs = await getLeadRequirements(lead.id);
            if (!isMounted) return;
            setRequirements(reqs.skills);
            
            const results = await findMatchingConsultants(
                reqs.skills, 
                lead.start_date, 
                lead.end_date
            );
            if (!isMounted) return;
            setMatches(results);
        } catch (error) {
            console.error("Failed to load matches:", error);
        } finally {
            if (isMounted) setLoading(false);
        }
    };
    load();
    return () => { isMounted = false; };
  }, [lead.id, lead.start_date, lead.end_date]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="flex gap-2">
                <div className="h-6 w-16 bg-muted rounded-full" />
                <div className="h-6 w-16 bg-muted rounded-full" />
            </div>
        </div>
        <p className="text-xs text-muted-foreground animate-pulse">{t.sales.matcher.loading}</p>
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div>
            <h3 className="text-sm font-medium mb-2">{t.sales.matcher.requiredSkills}</h3>
            <div className="flex flex-wrap gap-2">
                {requirements.length > 0 ? requirements.map(s => (
                    <Badge key={s} variant="outline">{s}</Badge>
                )) : <span className="text-sm text-muted-foreground">{t.sales.matcher.noSkills}</span>}
            </div>
        </div>

        <div className="space-y-3">
            {matches.map((m) => (
                <Card key={m.consultant.id} className="overflow-hidden">
                    <div className="flex items-center p-4 gap-4">
                        <Avatar>
                            <AvatarFallback>
                                {m.consultant.first_name[0]}{m.consultant.last_name[0]}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold truncate">{m.consultant.display_name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-primary">{m.score}% {t.sales.matcher.match}</span>
                                    <Progress value={m.score} className="w-16 h-2" />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    {m.availability.status === 'available' ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    ) : m.availability.status === 'busy' ? (
                                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                                    ) : (
                                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                                    )}
                                    <span className="capitalize">
                                        {(t.consultantProfile.status as Record<string, string>)[m.availability.status] || m.availability.status}
                                    </span>
                                    {m.availability.hoursAvailable > 0 && <span>({m.availability.hoursAvailable}h {t.sales.matcher.free})</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {(m.matchedSkills.length > 0 || m.missingSkills.length > 0) && (
                        <div className="bg-muted/30 px-4 py-2 flex flex-wrap gap-2 border-t">
                            {m.matchedSkills.map(s => (
                                <Badge key={s} variant="secondary" className="text-emerald-600 bg-emerald-50 border-emerald-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> {s}
                                </Badge>
                            ))}
                            {m.missingSkills.map(s => (
                                <Badge key={s} variant="outline" className="text-muted-foreground opacity-70">
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    )}
                </Card>
            ))}
        </div>
    </div>
  );
}
