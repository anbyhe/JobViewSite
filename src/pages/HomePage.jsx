import React from "react";
import Hero from "../components/Hero";
import HomeCard from "../components/HomeCard";
import JobListings from "../components/JobListings";
import ViewAllJobs from "../components/ViewAllJobs";
import ChatBox from "../components/ChatBox";

const HomePage = () => {
  return (
    <>
      <Hero />
      <HomeCard />
      <JobListings isfromHome={true} />
      <div className="fixed bottom-4 right-4 z-50">
          <ChatBox />
      </div>
      <ViewAllJobs />
    </>
  );
};

export default HomePage;
