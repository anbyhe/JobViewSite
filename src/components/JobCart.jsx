import { useState } from "react";
import {FaMapMarker} from 'react-icons/fa'
import {  deleteFromCart } from "../store/cartSlice";
import { useDispatch } from "react-redux";

const JobCart = ({ job }) => {
  const [showDetails, setShowDetails] = useState(false);
  const dispatch = useDispatch();
  let description = job.description;
  if(!showDetails){
    description = description.substring(0, 90) + '...';
  }

  const DeleteFromCartEvent = (job) => {
    dispatch(deleteFromCart(job));
  }

  return (
    <div className="bg-white rounded-xl shadow-md relative">
      <div className="p-4">
        <div className="mb-6">
          <div className="text-gray-600 my-2">{job.type}</div>
          <h3 className="text-xl font-bold">{job.title}</h3>
        </div>

        <div className="mb-5">{description}</div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-indigo-500 mb-5 hover:text-indigo-600"
        >
          {showDetails ? " Less" : "More"}
        </button>

        <h3 className="text-indigo-500 mb-2">{job.salary} / Year</h3>

        <div className="border border-gray-100 mb-5"></div>

        <div className="flex flex-col lg:flex-row justify-between mb-4">
          <div className="text-orange-700 mb-3">
            <FaMapMarker className="inline text-lg mb-1 mr-1" />
            {job.location}
          </div>
          <button onClick={()=>DeleteFromCartEvent(job)} className="h-[36px] bg-red-500 hover:bg-red-600 text-white px-2 py-2 rounded-lg text-center text-sm">
            Remove from Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCart;
