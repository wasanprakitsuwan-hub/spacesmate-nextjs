/**
 * Google Consent Mode v2 defaults.
 *
 * This is a plain inline <script> at the top of <body>, so it runs during HTML
 * parsing, before gtag.js (loaded afterInteractive by <Analytics />) and
 * before any component can push an event.
 *
 * WHAT IT DOES
 *   1. Decides whether this page tracks at all (hostname gate, see
 *      lib/tracking-config) and records it on window.__smTrack.
 *   2. Defines gtag() and sets every Google consent signal to denied.
 *   3. If the visitor already decided on an earlier visit, applies that
 *      decision straight away, so a returning visitor who accepted is
 *      measured from the first hit of the page.
 *
 * WHY CONSENT MODE NOW (Founder, 26 Nov 2026)
 *   Until now GTM was not loaded at all before consent. That kept Google out
 *   entirely but also meant visitors who declined, or never answered, were
 *   invisible, so the Facebook ad funnel could not be measured. With consent
 *   mode GA4 loads for everyone; for visitors who have not granted analytics
 *   it sends cookieless pings only and writes no cookies.
 *
 * The stored decision is read with the same key and version as lib/consent
 * (sm_consent, version 1). A decision from another version counts as no
 * decision, exactly as readConsent() treats it.
 */
import { CONSENT_KEY, CONSENT_VERSION } from '@/lib/consent'
import { TRACKING_HOSTS, TRACKING_DEBUG } from '@/lib/tracking-config'

const script = `
(function(){
  var hosts = ${JSON.stringify(TRACKING_HOSTS)};
  var on = ${TRACKING_DEBUG ? 'true' : 'false'} || hosts.indexOf(location.hostname) !== -1;
  window.__smTrack = on;
  if (!on) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
  gtag('set', 'url_passthrough', true);
  try {
    var c = JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_KEY)}) || 'null');
    if (c && c.version === ${CONSENT_VERSION}) gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
  } catch (e) {}
})();
`

export default function ConsentDefaults() {
  return <script id="consent-default" dangerouslySetInnerHTML={{ __html: script }} />
}
