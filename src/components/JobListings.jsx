import { useState, useEffect } from "react";
import JobListing from "./JobListing";
import Spinner from "./Spinner";
const JobListings = ({ isfromHome = false }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const url = isfromHome ? "/api/jobs?_limit=3" : "/api/jobs";

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);
  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          {isfromHome ? "Recently Jobs" : "Browse Jobs"}
        </h2>
        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobListing key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default JobListings;
