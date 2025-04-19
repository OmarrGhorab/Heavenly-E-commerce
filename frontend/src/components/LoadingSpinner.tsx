import { RingLoader } from 'react-spinners';
const LoadingSpinner = () => {
  return (
        <div className="h-screen flex items-center justify-center">
          <RingLoader size={60} color="#36d7b7" />
        </div>
  )
}

export default LoadingSpinner