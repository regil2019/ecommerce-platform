export default function handler(req, res) {
  res.json({ 
    status: "healthy", 
    message: "Backend Vercel funcionando!",
    timestamp: new Date().toISOString()
  });
}
