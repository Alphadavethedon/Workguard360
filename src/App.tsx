import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

function Home() {
  const { data, error } = useQuery({
    queryKey: ['authData'],
    queryFn: () => axios.get('/api/auth/check').then(res => res.data),
  });

  if (error) return <div>Error: {error.message}</div>;
  return <div>{data ? data.message : 'Loading...'}</div>;
}

export default Home;
