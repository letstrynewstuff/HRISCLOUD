// templates/layouts/minimal.js
// Stripped-down layout — auth emails, OTPs, password resets.
// No footer links, no distraction, just the message.

export function minimalLayout({ title, previewText = "", body, cta = null }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#F0F2F8; font-family:'Segoe UI',Arial,sans-serif; }
    .wrapper { padding:40px 16px; background:#F0F2F8; }
    .container { background:#ffffff; border-radius:16px; max-width:480px; margin:0 auto;
                 overflow:hidden; box-shadow:0 4px 24px rgba(30,27,75,0.08); }
    .header { padding:28px 36px 20px; border-bottom:1px solid #F3F4F6; text-align:center; }
    .logo-text { font-size:20px; font-weight:800; color:#1E1B4B; letter-spacing:-0.5px; }
    .logo-dot { color:#4F46E5; }
    .body { padding:32px 36px; }
    .title { font-size:20px; font-weight:700; color:#1E1B4B; margin:0 0 10px; }
    .text { font-size:14px; color:#374151; line-height:1.7; margin:0 0 14px; }
    .text-muted { font-size:13px; color:#6B7280; line-height:1.6; margin:0; }
    .cta-wrap { text-align:center; margin:24px 0; }
    .cta-btn { display:inline-block; padding:13px 30px; background:#4F46E5;
               color:#ffffff !important; border-radius:10px; text-decoration:none;
               font-size:14px; font-weight:700;
               box-shadow:0 4px 12px rgba(79,70,229,0.3); }
    .otp-box { text-align:center; margin:20px 0; }
    .otp-code { font-size:36px; font-weight:800; color:#1E1B4B; letter-spacing:10px;
                font-family:'Courier New',monospace; background:#F0F2F8;
                padding:16px 24px; border-radius:12px; display:inline-block; }
    .footer { padding:16px 36px 28px; text-align:center; }
    .footer-text { font-size:12px; color:#9CA3AF; line-height:1.6; margin:0; }
    .divider { border:none; border-top:1px solid #F3F4F6; margin:20px 0; }
    @media (max-width:520px) {
      .body, .header, .footer { padding-left:20px !important; padding-right:20px !important; }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden">${previewText}&nbsp;&zwnj;</div>` : ""}
  <div class="wrapper">
    <div class="container">

      <!-- LOGO -->
      <div class="header">
        <span class="logo-text">bannta<span class="logo-dot">HR</span></span>
      </div>

      <!-- BODY -->
      <div class="body">
        ${body}
        ${cta ? `<div class="cta-wrap"><a href="${cta.url}" class="cta-btn">${cta.label}</a></div>` : ""}
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <hr class="divider" />
        <p class="footer-text">
          &copy; ${new Date().getFullYear()} banntaHR &mdash; This is an automated message, please do not reply.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
}
