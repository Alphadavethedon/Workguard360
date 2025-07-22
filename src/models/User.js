const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate('role').select('+password'); // Include password for comparison
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role ? user.role.name : user.role, // Handle role population
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
