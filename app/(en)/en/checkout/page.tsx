import type { Metadata } from 'next'
import CheckoutBody from '@/components/checkout/CheckoutBody'
import { CHECKOUT_T } from '@/lib/checkout-i18n'

export const metadata: Metadata = {
  title: CHECKOUT_T.en.metaTitle,
  robots: { index: false, follow: false },
  alternates: { languages: { th: 'https://spacesmate.com/checkout' } },
}

export default function Page() {
  return <CheckoutBody locale="en" />
}
