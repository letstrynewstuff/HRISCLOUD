// templates/layouts/default.js
// Full branded layout — used for transactional and marketing emails.

export function defaultLayout({ title, previewText = "", body, cta = null }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body { margin:0; padding:0; background:#F0F2F8; font-family:'Segoe UI',Arial,sans-serif; }
    table { border-spacing:0; }
    td { padding:0; }
    img { border:0; display:block; }
    .wrapper { background:#F0F2F8; padding:32px 16px; }
    .container { background:#ffffff; border-radius:16px; max-width:560px; margin:0 auto;
                 overflow:hidden; box-shadow:0 4px 24px rgba(30,27,75,0.08); }
    .header { background:linear-gradient(135deg,#1E1B4B 0%,#312E81 55%,#1E40AF 100%); padding:32px 40px; }
    .logo-text { font-size:22px; font-weight:800; color:#ffffff; letter-spacing:-0.5px; }
    .logo-dot { color:#818CF8; }
    .tagline { font-size:12px; color:rgba(255,255,255,0.55); margin-top:4px; }
    .body { padding:36px 40px; }
    .title { font-size:22px; font-weight:700; color:#1E1B4B; margin:0 0 12px; line-height:1.3; }
    .text { font-size:15px; color:#374151; line-height:1.7; margin:0 0 16px; }
    .text-muted { font-size:13px; color:#6B7280; line-height:1.6; margin:0 0 12px; }
    .cta-wrap { text-align:center; margin:28px 0; }
    .cta-btn { display:inline-block; padding:14px 32px; background:#4F46E5;
               color:#ffffff !important; border-radius:10px; text-decoration:none;
               font-size:15px; font-weight:700; letter-spacing:0.2px;
               box-shadow:0 4px 14px rgba(79,70,229,0.35); }
    .divider { border:none; border-top:1px solid #E5E7EB; margin:24px 0; }
    .footer { background:#F8FAFC; border-top:1px solid #E5E7EB; padding:24px 40px; text-align:center; }
    .footer-text { font-size:12px; color:#9CA3AF; line-height:1.6; margin:0 0 8px; }
    .footer-links a { color:#6B7280; text-decoration:none; font-size:12px; margin:0 8px; }
    .badge { display:inline-block; padding:3px 10px; border-radius:99px;
             font-size:11px; font-weight:700; }
    .badge-success { background:#D1FAE5; color:#059669; }
    .badge-warning { background:#FEF3C7; color:#D97706; }
    .badge-danger  { background:#FEE2E2; color:#DC2626; }
    .badge-info    { background:#EEF2FF; color:#4F46E5; }
    .info-box { background:#F8FAFC; border:1px solid #E5E7EB; border-radius:10px;
                padding:16px 20px; margin:16px 0; }
    .info-row { display:flex; justify-content:space-between; padding:6px 0;
                border-bottom:1px solid #F3F4F6; font-size:14px; }
    .info-label { color:#6B7280; }
    .info-value { color:#1E1B4B; font-weight:600; }
    @media (max-width:600px) {
      .body, .header, .footer { padding-left:24px !important; padding-right:24px !important; }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ""}
  <div class="wrapper">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td>
        <div class="container">

          <!-- HEADER -->
          <div class="header">
            <div class="logo-text">bannta<span class="logo-dot">HR</span></div>
            <div class="tagline">People operations, simplified</div>
          </div>

          <!-- BODY -->
          <div class="body">
            ${body}
            ${cta ? `<div class="cta-wrap"><a href="${cta.url}" class="cta-btn">${cta.label}</a></div>` : ""}
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <p class="footer-text">
              You're receiving this email because you have an account on banntaHR.<br>
              &copy; ${new Date().getFullYear()} banntaHR. All rights reserved.
            </p>
            <div class="footer-links">
              <a href="{{unsubscribe_url}}">Unsubscribe</a>
              <a href="{{privacy_url}}">Privacy Policy</a>
              <a href="{{help_url}}">Help Center</a>
            </div>
          </div>

        </div>
      </td></tr>
    </table>
  </div>
</body>
</html>`;
}
