
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all active investments
    const { data: investments, error: investmentsError } = await supabaseClient
      .from('user_investments')
      .select(`
        *,
        investment_packages (*)
      `)
      .eq('status', 'active')

    if (investmentsError) throw investmentsError

    const results = []

    for (const investment of investments || []) {
      // Check if investment period has ended
      if (investment.end_date && new Date() > new Date(investment.end_date)) {
        // Mark investment as completed
        await supabaseClient
          .from('user_investments')
          .update({ status: 'completed' })
          .eq('id', investment.id)

        // Create completion notification
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: investment.user_id,
            title: 'Investment Completed',
            message: `Your investment has completed and earned a total of $${investment.total_returns}`,
            type: 'success'
          })

        results.push({ investment_id: investment.id, action: 'completed' })
        continue
      }

      // Process daily return
      const dailyReturn = investment.daily_return || 0
      
      if (dailyReturn > 0) {
        // Create daily return transaction
        const { error: transactionError } = await supabaseClient
          .from('transactions')
          .insert({
            user_id: investment.user_id,
            type: 'daily_return',
            amount: dailyReturn,
            description: `Daily return from investment #${investment.id.slice(0, 8)}`,
            investment_id: investment.id,
            status: 'completed'
          })

        if (transactionError) throw transactionError

        // Update investment total returns
        const newTotalReturns = (investment.total_returns || 0) + dailyReturn
        
        await supabaseClient
          .from('user_investments')
          .update({ total_returns: newTotalReturns })
          .eq('id', investment.id)

        // Process referral commissions
        await processReferralCommissions(supabaseClient, investment.user_id, dailyReturn, investment.investment_packages)

        results.push({ 
          investment_id: investment.id, 
          action: 'daily_return_processed',
          amount: dailyReturn 
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing daily returns:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function processReferralCommissions(supabaseClient: any, userId: string, amount: number, packageData: any) {
  // Get user's referrer chain
  const { data: referrals } = await supabaseClient
    .from('referrals')
    .select(`
      *,
      referrer:profiles!referrals_referrer_id_fkey(*)
    `)
    .eq('referred_id', userId)

  if (!referrals || referrals.length === 0) return

  // Get commission rates from package
  const commissionRates = packageData?.level_commissions || []

  for (let i = 0; i < Math.min(referrals.length, commissionRates.length); i++) {
    const referral = referrals[i]
    const commissionRate = commissionRates[i]
    const commissionAmount = amount * commissionRate

    if (commissionAmount > 0) {
      // Create commission transaction
      await supabaseClient
        .from('transactions')
        .insert({
          user_id: referral.referrer_id,
          type: 'commission',
          amount: commissionAmount,
          description: `Level ${i + 1} commission from referral`,
          from_user_id: userId,
          status: 'completed'
        })

      // Update referral total commissions
      await supabaseClient
        .from('referrals')
        .update({ 
          total_commissions: (referral.total_commissions || 0) + commissionAmount 
        })
        .eq('id', referral.id)

      // Create notification
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: referral.referrer_id,
          title: 'Commission Earned!',
          message: `You earned $${commissionAmount.toFixed(2)} commission from your referral network`,
          type: 'success'
        })
    }
  }
}
