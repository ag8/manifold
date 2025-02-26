import { ContractMetric } from 'common/contract-metric'
import {
  getContractMetricsForContractId,
  getUserContractMetrics,
} from 'common/supabase/contract-metrics'
import { uniqBy } from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'
import { applyCorsHeaders, CORS_UNRESTRICTED } from 'web/lib/api/cors'
import { getContractFromId } from 'web/lib/firebase/contracts'
import { db } from 'web/lib/supabase/db'
import { validate } from 'web/pages/api/v0/_validate'
import { z } from 'zod'
import { ApiError, ValidationError } from '../../_types'
import { marketCacheStrategy } from '../../markets'

const queryParams = z.object({
  id: z.string(),
  userId: z.string().optional().optional(),
  top: z.number().optional().or(z.string().regex(/\d+/).transform(Number)),
  bottom: z.number().optional().or(z.string().regex(/\d+/).transform(Number)),
  order: z.string().optional(),
})
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ContractMetric[] | ValidationError | ApiError>
) {
  await applyCorsHeaders(req, res, CORS_UNRESTRICTED)
  let params: z.infer<typeof queryParams>
  try {
    params = validate(queryParams, req.query)
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(400).json(e)
    }
    console.error(`Unknown error during validation: ${e}`)
    return res.status(500).json({ error: 'Unknown error during validation' })
  }

  const { id: contractId, userId } = params
  const contract = await getContractFromId(contractId)
  if (!contract) {
    res.status(404).json({ error: 'Contract not found' })
    return
  }
  res.setHeader('Cache-Control', marketCacheStrategy)

  // Get single user's positions
  if (userId) {
    try {
      const contractMetrics = await getUserContractMetrics(
        userId,
        contractId,
        db
      )
      return res.status(200).json(contractMetrics)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Error getting user contract metrics' })
    }
  }

  const { top, bottom, order } = params
  if (order && !['profit', 'shares'].includes(order as string)) {
    res.status(400).json({ error: 'Invalid order, must be shares or profit' })
    return
  }

  // Get all positions for contract
  try {
    const contractMetrics = await getContractMetricsForContractId(
      contractId,
      db,
      order ? (order as 'profit' | 'shares') : undefined
    )

    if (top && !bottom) {
      return res.status(200).json(contractMetrics.slice(0, top))
    } else if (bottom && !top) {
      return res.status(200).json(contractMetrics.slice(-bottom))
    } else if (top && bottom) {
      return res
        .status(200)
        .json(
          uniqBy(
            contractMetrics
              .slice(0, top)
              .concat(contractMetrics.slice(-bottom)),
            (cm) => cm.userId
          )
        )
    }

    return res.status(200).json(contractMetrics)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error getting contract metrics' })
  }
}
