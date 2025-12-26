import React from "react";
import Hero from "../components/Hero";
import HomeCard from "../components/HomeCard";
import JobListings from "../components/JobListings";
import ViewAllJobs from "../components/ViewAllJobs";
import ChatBotWs from "../components/ChatBotWs";

const HomePage = () => {
  return (
    <>
      <Hero />
      <HomeCard />
      <JobListings isfromHome={true} />
      <div className="fixed bottom-4 right-4 z-50">
          <ChatBotWs />
      </div>
      <ViewAllJobs />
    </>
  );
};

export default HomePage;
