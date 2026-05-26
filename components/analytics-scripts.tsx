import Script from "next/script";
import {
  analyticsConfig,
  googleTagIds,
  hasAnyAnalyticsConfiguration,
} from "../lib/analytics";

function buildGoogleTagConfigurationScript(): string {
  const tagConfiguration = googleTagIds
    .map((id) => `gtag("config", ${JSON.stringify(id)});`)
    .join("\n");

  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag("js", new Date());
${tagConfiguration}
`;
}

function buildMetaPixelScript(pixelId: string): string {
  return `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,"script",
"https://connect.facebook.net/en_US/fbevents.js");
fbq("init", ${JSON.stringify(pixelId)});
fbq("track", "PageView");
`;
}

function buildTikTokPixelScript(pixelId: string): string {
  return `
!function(w,d,t){
w.TiktokAnalyticsObject=t;
var ttq=w[t]=w[t]||[];
ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
ttq.load=function(e){var n=d.createElement("script");n.type="text/javascript";n.async=!0;
n.src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid="+e+"&lib="+t;
var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a)};
ttq.load(${JSON.stringify(pixelId)});
ttq.page();
}(window,document,"ttq");
`;
}

function buildClarityScript(projectId: string): string {
  return `
(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", ${JSON.stringify(projectId)});
`;
}

export function AnalyticsScripts() {
  if (!hasAnyAnalyticsConfiguration()) {
    return null;
  }

  // Add future vendor IDs through NEXT_PUBLIC_* environment variables, never source code.
  return (
    <>
      {googleTagIds.length > 0 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleTagIds[0])}`}
            strategy="afterInteractive"
          />
          <Script id="google-tag-configuration" strategy="afterInteractive">
            {buildGoogleTagConfigurationScript()}
          </Script>
        </>
      )}
      {analyticsConfig.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {buildMetaPixelScript(analyticsConfig.metaPixelId)}
        </Script>
      )}
      {analyticsConfig.tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {buildTikTokPixelScript(analyticsConfig.tiktokPixelId)}
        </Script>
      )}
      {analyticsConfig.clarityId && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {buildClarityScript(analyticsConfig.clarityId)}
        </Script>
      )}
    </>
  );
}
