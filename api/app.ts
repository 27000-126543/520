import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import organizationRoutes from './routes/organization.js'
import spyRoutes from './routes/spies.js'
import missionRoutes from './routes/missions.js'
import marketRoutes from './routes/market.js'
import guildRoutes from './routes/guild.js'
import reportRoutes from './routes/reports.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors({
  origin: '*',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/organization', organizationRoutes)
app.use('/api/spies', spyRoutes)
app.use('/api/missions', missionRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/guild', guildRoutes)
app.use('/api/reports', reportRoutes)

app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: error.message || 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
