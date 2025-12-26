import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import store from '../store/store';

const MainLayout = () => {
  return (
    <>
      <Provider store={store}>
      <Navbar />
      <Outlet />
      <ToastContainer />
      </Provider>
    </> 
  )
}

export default MainLayout