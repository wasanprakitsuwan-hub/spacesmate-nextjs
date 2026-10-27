'use client'

import { createContext, useContext } from 'react'
import { DEFAULT_COMPANY_INFO, type CompanyInfo } from '@/lib/site-config'

/**
 * Company details from Dashboard › ตั้งค่า › ข้อมูลบริษัท, read once on the
 * server in RootShell and handed to the client components that show them
 * (footer, LINE button, contact page).
 */
const CompanyContext = createContext<CompanyInfo>(DEFAULT_COMPANY_INFO)

export function SiteInfoProvider({ company, children }: { company: CompanyInfo; children: React.ReactNode }) {
  return <CompanyContext.Provider value={company}>{children}</CompanyContext.Provider>
}

export function useCompany(): CompanyInfo {
  return useContext(CompanyContext)
}
