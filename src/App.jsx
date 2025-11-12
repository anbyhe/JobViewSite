import React from 'react'
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MainLayout from './layout/MainLayout'
import JobsPage from './pages/JobsPage'
import AddJobPage from './pages/AddJobPage'
import NotFoundPage from './pages/NotFoundPage'
import JobPage, { jobLoader } from './pages/JobPage'
import EditJobPage from './pages/EditJobPage'
import LoginPage from './pages/LoginPage'
import axios from 'axios'
import { AuthProvider} from './context/AuthContext'

const App = () => {

  const addJob = async (newJob, token) => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newJob),
    });
    return;
  };

  // Delete Job
  const deleteJob = async (id) => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE',
    });
    return;
  };

  // Update Job
  const updateJob = async (job, token) => {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(job),
    });
    return;
  };

    const login = async (user) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    return res;
  };

   const register = async (user) => {
    try {
      const res = await axios.post('/api/register', user);
      return res;
    } catch (error) {
      console.log(error);
      return error.response;
    }
  };

  const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:id" element={<JobPage deleteJob={deleteJob} />} loader={jobLoader} />
      <Route path="/edit-job/:id" element={<AddJobPage updateJobSubmit={updateJob} />} loader={jobLoader} />
      <Route path="/add-job" element={<AddJobPage addJobSubmit={addJob}/>} />
      <Route path="/login" element={<LoginPage loginEvent={login} isLogin={true}/>} />
      <Route path="/register" element={<LoginPage createEvent={register} isLogin={false} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
)
  return (
    <>
     <AuthProvider>
      <RouterProvider router={router} />
     </AuthProvider>
    </>
  )
}

export default App