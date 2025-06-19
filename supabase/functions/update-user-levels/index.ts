
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LevelRequirement {
  name: string
  minDirectReferrals: number
  minTeamSize: number
  minTotalInvestment: number
}

const LEVEL_REQUIREMENTS: LevelRequirement[] = [
  { name: 'Bronze', minDirectReferrals: 0, minTeamSize: 0, minTotalInvestment: 0 },
  { name: 'Silver', minDirectReferrals: 3, minTeamSize: 10, minTotalInvestment: 1000 },
  { name: 'Gold', minDirectReferrals: 5, minTeamSize: 25, minTotalInvestment: 5000 },
  { name: 'Platinum', minDirectReferrals: 10, minTeamSize: 50, minTotalInvestment: 15000 },
  { name: 'Diamond', minDirectReferrals: 20, minTeamSize: 100, minTotalInvestment: 50000 },
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')

    if (profilesError) throw profilesError

    const results = []

    for (const profile of profiles || []) {
      // Calculate user stats
      const stats = await calculateUserStats(supabaseClient, profile.id)
      
      // Determine current level
      let newLevel = 'Bronze'
      for (let i = LEVEL_REQUIREMENTS.length - 1; i >= 0; i--) {
        const req = LEVEL_REQUIREMENTS[i]
        if (stats.directReferrals >= req.minDirectReferrals &&
            stats.teamSize >= req.minTeamSize &&
            stats.totalInvestment >= req.minTotalInvestment) {
          newLevel = req.name
          break
        }
      }

      // Get current level
      const { data: currentLevel } = await supabaseClient
        .from('user_levels')
        .select('*')
        .eq('user_id', profile.id)
        .single()

      // Update if level changed
      if (!currentLevel || currentLevel.level_name !== newLevel) {
        await supabaseClient
          .from('user_levels')
          .upsert({
            user_id: profile.id,
            level_name: newLevel,
            direct_referrals: stats.directReferrals,
            team_size: stats.teamSize,
            total_investment: stats.totalInvestment,
            achieved_at: new Date().toISOString()
          })

        // Create notification if level up
        if (currentLevel && currentLevel.level_name !== newLevel) {
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: profile.id,
              title: 'Level Up!',
              message: `Congratulations! You've reached ${newLevel} level`,
              type: 'success'
            })
        }

        results.push({
          user_id: profile.id,
          old_level: currentLevel?.level_name || 'None',
          new_level: newLevel
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, updated: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error updating user levels:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function calculateUserStats(supabaseClient: any, userId: string) {
  // Count direct referrals
  const { data: directReferrals } = await supabaseClient
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .eq('level', 1)

  // Count total team size (all levels)
  const { data: allReferrals } = await supabaseClient
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)

  // Calculate total investment from user's investments
  const { data: investments } = await supabaseClient
    .from('user_investments')
    .select('amount')
    .eq('user_id', userId)

  const totalInvestment = (investments || []).reduce((sum, inv) => sum + inv.amount, 0)

  return {
    directReferrals: directReferrals?.length || 0,
    teamSize: allReferrals?.length || 0,
    totalInvestment
  }
}
