import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cardStyle } from '@/lib/styles'
import NewBriefForm from '@/components/briefs/NewBriefForm'

export default async function NewBriefPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1
        style={{
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          margin: 0,
          marginBottom: 24,
        }}
      >
        New Brief
      </h1>
      <div style={cardStyle}>
        <NewBriefForm userId={user.id} />
      </div>
    </div>
  )
}
