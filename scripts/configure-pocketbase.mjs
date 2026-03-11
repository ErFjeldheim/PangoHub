/**
 * One-time script to configure PocketBase email templates so that the
 * password-reset link in emails points to the Next.js app instead of the
 * default PocketBase admin UI.
 *
 * Run once after deploying to a new environment:
 *   npm run setup:pocketbase
 */

const PB_URL =
  process.env.POCKETBASE_URL || "https://db.pangohub.pangoconsulting.no";
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;
const APP_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://pangohub.pangoconsulting.no";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Error: POCKETBASE_ADMIN_EMAIL and POCKETBASE_ADMIN_PASSWORD must be set."
  );
  process.exit(1);
}

async function main() {
  // 1. Authenticate as superuser
  console.log(`Connecting to PocketBase at ${PB_URL}...`);
  const authRes = await fetch(
    `${PB_URL}/api/collections/_superusers/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    }
  );

  if (!authRes.ok) {
    const err = await authRes.text();
    console.error("Failed to authenticate as admin:", err);
    process.exit(1);
  }

  const { token } = await authRes.json();
  console.log("Authenticated successfully.");

  // 2. Fetch current settings
  const settingsRes = await fetch(`${PB_URL}/api/settings`, {
    headers: { Authorization: token },
  });

  if (!settingsRes.ok) {
    console.error("Failed to fetch settings:", await settingsRes.text());
    process.exit(1);
  }

  const settings = await settingsRes.json();

  // 3. Update the reset-password email template's action URL
  const resetPasswordUrl = `${APP_URL}/auth/reset-password?token={TOKEN}`;

  const patch = {
    meta: {
      ...settings.meta,
      appName: settings.meta?.appName || "PangoHub",
      appURL: APP_URL,
    },
    emailAuth: {
      ...settings.emailAuth,
      resetPasswordTemplate: {
        ...settings.emailAuth?.resetPasswordTemplate,
        actionUrl: resetPasswordUrl,
      },
    },
  };

  const updateRes = await fetch(`${PB_URL}/api/settings`, {
    method: "PATCH",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });

  if (!updateRes.ok) {
    console.error("Failed to update settings:", await updateRes.text());
    process.exit(1);
  }

  console.log(
    `Password reset email template configured successfully.`
  );
  console.log(`Reset links will point to: ${resetPasswordUrl}`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
