"use client";

import { useEffect, useState } from "react";
import { getSuggestedTeam, TeamSlot, SalesLead, TeamMember } from "@/app/actions/sales";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle2, UserPlus, AlertCircle, Clock, Building2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SuggestedTeam({ lead }: { lead: SalesLead }) {
  const { t } = useLanguage();
  const [team, setTeam] = useState<TeamSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
        setLoading(true);
        try {
            const results = await getSuggestedTeam(lead.id);
            if (isMounted) {
                setTeam(results);
            }
        } catch (error) {
            console.error("Failed to load suggested team:", error);
        } finally {
            if (isMounted) setLoading(false);
        }
    };
    load();
    return () => { isMounted = false; };
  }, [lead.id, lead.hours_required]);

  if (loading) {
    return (
        <div className="space-y-3 mt-6">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            {[1, 2].map(i => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
        </div>
    );
  }

  if (team.length === 0) {
      return (
          <div className="mt-8 p-4 border border-dashed rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground italic">{t.sales.team.noSuggestions}</p>
          </div>
      );
  }

  return (
    <div className="mt-8 space-y-4">
        <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                {t.sales.team.title}
            </h3>
        </div>

        <div className="space-y-3">
            {team.map((slot, index) => (
                <Card key={index} className="overflow-hidden border-dashed">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase text-primary">{slot.department}</span>
                                <span className="font-semibold text-sm">{slot.role}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {slot.hours}h
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            {slot.members?.map((m: TeamMember, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-2 bg-primary/5 rounded-md border border-primary/10">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-[10px]">
                                            {m.consultant.first_name?.[0] || ""}{m.consultant.last_name?.[0] || ""}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium truncate">{m.consultant.display_name}</p>
                                            {m.consultant.primary_department && (
                                                <Badge variant="outline" className="text-[10px] h-4 px-1 text-muted-foreground font-normal border-muted-foreground/20 gap-1">
                                                    <Building2 className="h-2.5 w-2.5" />
                                                    {m.consultant.primary_department}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {m.coveredSkills.map((s: string) => (
                                                <span key={s} className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded uppercase font-bold">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                </div>
                            ))}

                            {slot.missingSkills?.length > 0 && (
                                <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-md border border-dashed border-muted-foreground/30">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-dashed border-muted-foreground/40">
                                        <UserPlus className="h-4 w-4 text-muted-foreground opacity-50" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-muted-foreground">{t.sales.team.ghostTitle}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {slot.missingSkills.map((s: string) => (
                                                <span key={s} className="text-[9px] bg-muted text-muted-foreground px-1 rounded uppercase font-bold border border-muted-foreground/20">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <AlertCircle className="h-4 w-4 text-amber-500/50 shrink-0" />
                                </div>
                            )}

                            {(!slot.members || slot.members.length === 0) && (!slot.missingSkills || slot.missingSkills.length === 0) && (
                                <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md border border-dashed">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground italic">{t.sales.team.noConsultant}</p>
                                    </div>
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    </div>
  );
}
