import {
  getConsultant,
  getEducations,
  getExperiences,
  getSkills,
} from "@/app/actions/consultants";
import { getCurrentUser } from "@/lib/auth/server-auth";
import { getConsultantCurrentAvailability } from "@/app/actions/availability";

import { ConsultantDetailPageContent } from "./ConsultantDetailPageContent";

interface ConsultantDetailPageProps {
  params: { id: string };
}

export default async function ConsultantDetailPage({
  params,
}: ConsultantDetailPageProps) {
  const { id } = params;
  const [consultant, skills, experiences, educations, currentAvailability] =
    await Promise.all([
      getConsultant(id),
      getSkills(id),
      getExperiences(id),
      getEducations(id),
      getConsultantCurrentAvailability(id),
    ]);

  return (
    <ConsultantDetailPageContent
      user={await getCurrentUser()}
      consultant={consultant}
      skills={skills ?? []}
      experiences={experiences ?? []}
      educations={educations ?? []}
      currentAvailability={currentAvailability}
    />
  );
}
