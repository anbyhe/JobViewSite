import { useSelector } from "react-redux";
import JobCart from "../components/JobCart";

const MyJobsPage = () => {
    const jobs= useSelector((state) => state.cart);

  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobs.length === 0 && <p className="text-center col-span-3">No Saved Jobs Found</p>}
            {jobs.map((job) => (
              <JobCart key={job.id} job={job} />
            ))}
      </div>
    );
}

export default MyJobsPage