import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP settings not found. Skipping email sending.");
    console.warn("Expected env vars: SMTP_HOST, SMTP_USER, SMTP_PASS");
    console.warn("Current values (masked):", {
      host: !!host,
      user: !!user,
      pass: !!pass,
    });
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

const FROM = process.env.SMTP_FROM || "noreply@pangohub.fjelldata.com";

export async function sendInvitationEmail({
  to,
  inviteUrl,
  role,
}: {
  to: string;
  inviteUrl: string;
  role: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const roleName = role === "admin" ? "Administrator" : role === "seller" ? "Seller" : "Consultant";

  await transporter.sendMail({
    from: `"PangoHub" <${FROM}>`,
    to,
    subject: "Invitation to Join PangoHub",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited!</h2>
        <p>You have been invited to join <strong>PangoHub</strong> as a <strong>${roleName}</strong>.</p>
        <p>Click the link below to set up your account:</p>
        <a href="${inviteUrl}" style="display: inline-block; background-color: #073b40; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Accept Invitation</a>
        <p style="margin-top: 24px; font-size: 14px; color: #666;">
          Or copy and paste this link into your browser:<br>
          <a href="${inviteUrl}">${inviteUrl}</a>
        </p>
        <p style="margin-top: 24px; font-size: 14px; color: #999;">
          This invitation expires in 7 days.
        </p>
      </div>
    `,
  });
}

export async function sendRejectionEmail({
  to,
  name,
}: {
  to: string;
  name?: string | null;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  await transporter.sendMail({
    from: `"PangoHub" <${FROM}>`,
    to,
    subject: "Update on your PangoHub Access Request",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Access Request Update</h2>
        <p>Hi ${name || "there"},</p>
        <p>Thank you for your interest in joining PangoHub.</p>
        <p>After reviewing your request, we are unable to grant you access at this time.</p>
        <p>If you believe this is a mistake, please contact our support team.</p>
        <p style="margin-top: 24px; font-size: 14px; color: #999;">
          Best regards,<br>The PangoHub Team
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  await transporter.sendMail({
    from: `"PangoHub" <${FROM}>`,
    to,
    subject: "Welcome to PangoHub!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome aboard, ${name}!</h2>
        <p>Your account has been successfully created.</p>
        <p>You can now log in and start setting up your profile.</p>
        <a href="${baseUrl}/dashboard" style="display: inline-block; background-color: #073b40; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Dashboard</a>
        <p style="margin-top: 24px; font-size: 14px; color: #999;">
          Best regards,<br>The PangoHub Team
        </p>
      </div>
    `,
  });
}
