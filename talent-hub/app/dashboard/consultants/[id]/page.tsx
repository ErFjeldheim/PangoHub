import {
  getAvailability,
  getConsultant,
  getEducations,
  getExperiences,
  getSkills,
  getUser,
} from "@/app/actions/consultants";

import { ConsultantDetailPageContent } from "./ConsultantDetailPageContent";

interface ConsultantDetailPageProps {
  params: { id: string };
}

export default async function ConsultantDetailPage({
  params,
}: ConsultantDetailPageProps) {
  const { id } = params;
  const user = await getUser();
  const consultant = await getConsultant(id);
  const skills = await getSkills(id);
  const experiences = await getExperiences(id);
  const educations = await getEducations(id);
  const currentAvailability = await getAvailability(id);

  return (
    <ConsultantDetailPageContent
      user={user}
      consultant={consultant}
      skills={skills ?? []}
      experiences={experiences ?? []}
      educations={educations ?? []}
      currentAvailability={currentAvailability ?? null}
    />
  );
}
