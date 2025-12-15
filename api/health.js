import logger from '../../backend/utils/logger';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  logger.info('Health check requested');
  
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Product Generator API'
  });
}