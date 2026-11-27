import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/root-metadata'
import GuideHub from '@/components/guide/GuideHub'
import { GUIDE_HUB_EN as t } from '@/lib/guide-content'
import { withPageSeo } from '@/lib/page-seo'
import { hreflang } from '@/lib/hreflang'

export const revalidate = 3600

const baseMetadata: Metadata = {
  title: t.metaTitle,
  description: t.metaDesc,
  openGraph: { title: t.metaTitle, description: t.metaDesc, type: 'website', images: [DEFAULT_OG_IMAGE], url: 'https://spacesmate.com/en/guide' },
  alternates: hreflang('/guide', 'en'),
}

export default function Page() {
  return (
    <GuideHub
      homeLabel={t.home}
      crumb={t.crumb}
      title={t.title}
      intro={t.intro}
      cards={[]}
      subhead={t.subhead}
      extra={[
        { href: '/guide/listing', title: t.manualTitle, desc: t.manualDesc },
        { href: '/faq', title: t.faqTitle, desc: t.faqDesc },
      ]}
      note={t.note}
      noteLink={{ href: 'https://spacesmate.com/guide', label: t.noteLink }}
      cta={{ title: t.ctaTitle, body: t.ctaBody, list: t.ctaList, manage: t.ctaManage }}
      url="https://spacesmate.com/en/guide"
      homeUrl="https://spacesmate.com/en"
    />
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return withPageSeo('/guide', 'en', baseMetadata)
}
