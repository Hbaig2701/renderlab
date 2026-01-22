export function usageAlert80Template(type: 'enhancement' | 'widget', used: number, limit: number): string {
  const typeLabel = type === 'enhancement' ? 'Enhancement' : 'Widget';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .usage-bar { background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0; }
    .usage-fill { background: #F59E0B; height: 100%; width: 80%; }
    .stats { display: flex; justify-content: space-between; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #F59E0B; }
    .cta { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Usage Alert</h1>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>You've used <strong>80%</strong> of your monthly ${typeLabel.toLowerCase()} transforms.</p>

      <div class="usage-bar">
        <div class="usage-fill"></div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">${used}</div>
          <div>Used</div>
        </div>
        <div class="stat">
          <div class="stat-value">${limit}</div>
          <div>Limit</div>
        </div>
      </div>

      <p>Don't worry - your widgets will continue to work even if you exceed your limit. Any additional transforms will be billed as overages at your plan's rate.</p>

      <p>Consider upgrading your plan for more transforms and lower overage rates.</p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" class="cta">Manage Plan</a>
    </div>
  </div>
</body>
</html>
`;
}

export function usageAlert100Template(type: 'enhancement' | 'widget', used: number, limit: number, overageRate: number): string {
  const typeLabel = type === 'enhancement' ? 'Enhancement' : 'Widget';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .usage-bar { background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0; }
    .usage-fill { background: #EF4444; height: 100%; width: 100%; }
    .stats { display: flex; justify-content: space-between; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #EF4444; }
    .info-box { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0; }
    .cta { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Limit Reached</h1>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>You've reached your monthly ${typeLabel.toLowerCase()} transform limit.</p>

      <div class="usage-bar">
        <div class="usage-fill"></div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-value">${used}</div>
          <div>Used</div>
        </div>
        <div class="stat">
          <div class="stat-value">${limit}</div>
          <div>Limit</div>
        </div>
      </div>

      <div class="info-box">
        <strong>Your widgets are still working!</strong>
        <p style="margin: 10px 0 0 0;">Additional transforms will be billed at <strong>$${overageRate.toFixed(2)}</strong> per transform.</p>
      </div>

      <p>Upgrade your plan now to get more transforms, lower overage rates, and more features.</p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" class="cta">Upgrade Now</a>
    </div>
  </div>
</body>
</html>
`;
}
