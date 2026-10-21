import LoginBody from '@/components/auth/LoginBody'

/**
 * Reached from the English funnel — buying a slot, saving a listing, or opening
 * the dashboard while logged out. Before this existed, every one of those paths
 * dropped an English owner onto a Thai sign-in page, including the one in the
 * middle of a purchase.
 */
export default function EnLoginPage() {
  return <LoginBody locale="en" />
}
