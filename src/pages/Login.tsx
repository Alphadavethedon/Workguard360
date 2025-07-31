<label htmlFor="email" className="block text-sm text-gray-300 mb-1">Email Address</label>
<input
  id="email"
  name="email"
  type="email"
  autoComplete="email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  required
  className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
/>

<label htmlFor="password" className="block text-sm text-gray-300 mb-1">Password</label>
<input
  id="password"
  name="password"
  type="password"
  autoComplete="current-password"
  value={password}
  onChange={e => setPassword(e.target.value)}
  required
  className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
/>
