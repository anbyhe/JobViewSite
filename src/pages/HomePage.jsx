import React from 'react'
import Hero from '../components/Hero'
import HomeCard from '../components/HomeCard'
import JobListings from '../components/JobListings'
import ViewAllJobs from '../components/ViewAllJobs'

const HomePage = () => {
  return (
    <>
      <Hero />
      <HomeCard />
      <JobListings isfromHome={true} />
      <ViewAllJobs />
    </>
  )
}

export default HomePage