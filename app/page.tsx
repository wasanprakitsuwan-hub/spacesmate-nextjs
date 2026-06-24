// build: 2026-06-24
import HeroSection from '@/components/sections/HeroSection'
import CategorySection from '@/components/sections/CategorySection'
import FeaturedListings from '@/components/sections/FeaturedListings'
import WhySpacesMate from '@/components/sections/WhySpacesMate'
import ManagementCTA from '@/components/sections/ManagementCTA'
import BlogSection from '@/components/sections/BlogSection'
import AreaLinks from '@/components/sections/AreaLinks'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <FeaturedListings />
      <WhySpacesMate />
      <ManagementCTA />
      <BlogSection />
      <AreaLinks />
    </>
  )
}
