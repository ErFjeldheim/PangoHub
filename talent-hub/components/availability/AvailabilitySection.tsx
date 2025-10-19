import {
  getAvailabilityNextSixMonths,
  upsertAvailabilityMonthAction,
  upsertAvailabilityNotesAction,
  type AvailabilityRow,
} from "@/app/actions/availability";
import { AvailabilityManagerClient } from "./AvailabilityManagerClient";

export async function AvailabilitySection({
  profileId,
}: {
  profileId: string;
}) {
  const initialRows: AvailabilityRow[] = await getAvailabilityNextSixMonths(
    profileId
  );

  // Pass server actions as props for <form action={...}> usage in client
  return (
    <AvailabilityManagerClient
      profileId={profileId}
      initial={initialRows}
      saveHoursAction={upsertAvailabilityMonthAction}
      saveNotesAction={upsertAvailabilityNotesAction}
    />
  );
}
