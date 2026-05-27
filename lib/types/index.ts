export interface Page<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

export interface Tier {
  key: string
  name: string
  label: string
  floor: number
  ceil: number | null
  multiplier: string
  ord: number
}

export interface TierBoundary {
  key: string
  floor: number
  ceil: number | null
}

export interface Member {
  id: string
  code: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  birth_date: string | null
  gender: string | null
  doctor: string | null
  internal_notes: string | null
  is_active: boolean
  member_since: string
  created_at: string
}

export interface MemberLedger extends Member {
  smiles_balance: number
  smiles_lifetime: number
  tier: string       // key: "plata" | "oro" | "diamante"
  tier_label: string
}

export interface Transaction {
  id: string
  member_id: string
  type: 'credit' | 'redeem' | 'bonus' | 'adjustment' | 'expiration'
  label: string
  delta: number
  treatment_id: string | null
  reward_id: string | null
  performed_by: string
  note: string | null
  expires_at: string | null
  created_at: string
}

export interface SystemSettings {
  points_expiry_months: number
  updated_at: string
  updated_by: string | null
}

export interface ExpirationSweepResult {
  processed: number
  members_affected: number
  smiles_expired: number
}

export interface Treatment {
  id: string
  name: string
  category: string
  duration: string | null
  price: string
  base_smiles: number
  is_active: boolean
  description: string | null
}

export interface Reward {
  id: string
  name: string
  kind: string
  cost: number
  is_active: boolean
  stock: number | null
  min_tier: string
  description: string | null
  created_at: string
}

export interface MemberListItem extends Member {
  smiles_balance?: number
  tier_key?: string
}

export interface DashboardKpis {
  new_members: number
  smiles_credited: number
  smiles_redeemed: number
  active_members: number
}

export interface TierBreakdownItem {
  tier: string
  count: number
  share: number
}

export interface TopRewardItem {
  reward_id: string
  name: string
  redemption_count: number
  kind: string
}

export interface SmilesMovementItem {
  date: string
  credited: number
  redeemed: number
}

export interface ActivityItem {
  member_id: string
  member_name: string
  member_code: string
  type: string
  label: string
  delta: number
  performed_by: string
  created_at: string
}

export interface BulkImportError {
  row: number
  email: string
  error: string
}

export interface BulkImportResult {
  created: number
  skipped: number
  errors: BulkImportError[]
  placeholder_emails: number
  format: 'template' | 'clinic'
}
