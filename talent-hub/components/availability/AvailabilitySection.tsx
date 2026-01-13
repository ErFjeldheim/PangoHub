import {
  getAvailabilityNextSixMonths,
  upsertAvailabilityMonthAndNotesAction,
} from "@/app/actions/availability";
import type { AvailabilityRow } from "@/types/availability";
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
      saveMonthAction={upsertAvailabilityMonthAndNotesAction}
    />
  );
}
