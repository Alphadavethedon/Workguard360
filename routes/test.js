app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend reachable' });
});
