import type { Metadata } from 'next'
import CheckoutBody from '@/components/checkout/CheckoutBody'
import { CHECKOUT_T } from '@/lib/checkout-i18n'

export const metadata: Metadata = {
  title: CHECKOUT_T.th.metaTitle,
  robots: { index: false, follow: false },
  alternates: { languages: { en: 'https://spacesmate.com/en/checkout' } },
}

export default function Page() {
  return <CheckoutBody locale="th" />
}
