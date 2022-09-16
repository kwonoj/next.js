import { NextApiRequest, NextApiResponse } from 'next'
import { people } from '../../../data'
import { Person } from '../../../interfaces'
const { trace } = require('@opentelemetry/api') //require('next/dist/compiled/@opentelemetry/api')//require('@opentelemetry/api')

type ResponseError = {
  message: string
}

const name = 'my-application-name'
const version = '0.1.0'

export default function personHandler(
  req: NextApiRequest,
  res: NextApiResponse<Person | ResponseError>
) {
  const tracer = trace.getTracer(name, version)

  const span = tracer.startSpan('personHandler_from_api_routes')

  const { query } = req
  const { id } = query
  const filtered = people.filter((p) => p.id === id)

  // User with id exists
  const r =
    filtered.length > 0
      ? res.status(200).json(filtered[0])
      : res.status(404).json({ message: `User with id: ${id} not found.` })

  span.end()
  return r
}
