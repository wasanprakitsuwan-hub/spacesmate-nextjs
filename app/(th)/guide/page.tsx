import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import GuideHub, { type HubCard } from '@/components/guide/GuideHub'
import { OWNER_GUIDES, OWNER_GUIDE_UI as t, PILLAR_SLUG, ownerGuidePath } from '@/lib/owner-guides'
import { withPageSeo } from '@/lib/page-seo'
import { hreflang } from '@/lib/hreflang'

export const revalidate = 3600

const baseMetadata: Metadata = {
  title: t.hubMetaTitle,
  description: t.hubMetaDesc,
  openGraph: { title: t.hubMetaTitle, description: t.hubMetaDesc, type: 'website', images: [DEFAULT_OG_IMAGE], url: 'https://spacesmate.com/guide' },
  alternates: hreflang('/guide', 'th'),
}

export default function Page() {
  const card = (g: (typeof OWNER_GUIDES)[number]): HubCard => ({ href: ownerGuidePath(g), topic: `${g.topic} · ${t.readTime(g.readMinutes)}`, title: g.cardTitle, desc: g.cardDesc })
  const pillar = OWNER_GUIDES.find(g => g.slug === PILLAR_SLUG)
  return (
    <GuideHub
      homeLabel={t.home}
      crumb={t.hub}
      title={t.hubTitle}
      intro={t.hubIntro}
      featured={pillar && { ...card(pillar), topic: `${t.startHere} · ${t.readTime(pillar.readMinutes)}` }}
      cards={OWNER_GUIDES.filter(g => g !== pillar).map(card)}
      subhead={t.onSpacesMate}
      extra={[
        { href: '/guide/listing', title: t.listingCardTitle, desc: t.listingCardDesc },
        { href: '/faq', title: t.faqCardTitle, desc: t.faqCardDesc },
      ]}
      cta={{ title: t.hubCtaTitle, body: t.hubCtaBody, list: t.ctaList, manage: t.ctaManage }}
      url="https://spacesmate.com/guide"
      homeUrl="https://spacesmate.com"
    />
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/guide', 'th', baseMetadata)
}
