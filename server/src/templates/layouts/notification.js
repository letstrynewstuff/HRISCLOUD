// templates/layouts/notification.js
// Compact notification layout — used for quick alerts, mentions, system events.
// Designed to feel like a Slack/Teams digest, not a marketing email.

export function notificationLayout({
  title,
  previewText = "",
  body,
  cta = null,
  icon = "🔔",
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#F0F2F8; font-family:'Segoe UI',Arial,sans-serif; }
    .wrapper { padding:28px 16px; background:#F0F2F8; }
    .container { background:#ffffff; border-radius:14px; max-width:520px; margin:0 auto;
                 overflow:hidden; box-shadow:0 2px 16px rgba(30,27,75,0.07);
                 border:1px solid #E5E7EB; }
    .top-bar { background:#1E1B4B; height:4px; }
    .inner { padding:24px 28px; }
    .brand-row { display:flex; align-items:center; gap:8px; margin-bottom:20px; }
    .brand-name { font-size:13px; font-weight:700; color:#4F46E5; }
    .brand-sep { color:#D1D5DB; font-size:13px; }
    .notif-type { font-size:13px; color:#6B7280; }
    .icon-wrap { width:40px; height:40px; border-radius:10px; background:#EEF2FF;
                 display:inline-flex; align-items:center; justify-content:center;
                 font-size:20px; margin-bottom:12px; }
    .title { font-size:16px; font-weight:700; color:#1E1B4B; margin:0 0 8px; }
    .text { font-size:14px; color:#374151; line-height:1.65; margin:0 0 12px; }
    .text-muted { font-size:12px; color:#9CA3AF; line-height:1.5; }
    .cta-btn { display:inline-block; padding:10px 22px; background:#4F46E5;
               color:#ffffff !important; border-radius:8px; text-decoration:none;
               font-size:13px; font-weight:700; margin-top:4px; }
    .meta-row { background:#F8FAFC; border-radius:8px; padding:10px 14px;
                font-size:12px; color:#6B7280; margin:12px 0; }
    .footer-row { border-top:1px solid #F3F4F6; padding:12px 28px;
                  text-align:center; font-size:11px; color:#9CA3AF; }
    .divider { border:none; border-top:1px solid #F3F4F6; margin:16px 0; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden">${previewText}&nbsp;&zwnj;</div>` : ""}
  <div class="wrapper">
    <div class="container">
      <div class="top-bar"></div>
      <div class="inner">
        <div class="brand-row">
          <span class="brand-name">banntaHR</span>
          <span class="brand-sep">·</span>
          <span class="notif-type">Notification</span>
        </div>
        <div class="icon-wrap">${icon}</div>
        ${body}
        ${cta ? `<div style="margin-top:16px"><a href="${cta.url}" class="cta-btn">${cta.label}</a></div>` : ""}
      </div>
      <div class="footer-row">
        &copy; ${new Date().getFullYear()} banntaHR &mdash; <a href="{{preferences_url}}" style="color:#9CA3AF">Manage notifications</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}
