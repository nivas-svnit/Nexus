import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./CreatePost.css";
import PostDetailWrapper from "./PostDetailWrapper";
import increamentCounter from "../../libs/increamentCounter";

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link"],
    [{ color: [] }, { background: [] }],
    ["clean"],
  ],
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "align",
  "link",
  "color",
  "background",
];

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Add loading state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    company: "",
    role: "",
    tags: "",
    campusType: "",
    jobType: "",
    selectionProcess: {
      onlineAssessment: {
        aptitude: false,
        coreSubject: false,
        codingRound: false,
        english: false,
        communication: false,
      },
      groupDiscussion: false,
      onlineInterview: false,
      offlineInterview: false,
      others: [],
    },
    rounds: {
      technical: 0,
      hr: 0,
      hybrid: 0,
    },
    compensation: {
      stipend: "",
      ctc: "",
      baseSalary: "",
    },
    difficultyLevel: 1,
    hiringPeriod: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
    cgpaCriteria: {
      boys: "",
      girls: "",
    },
    shortlistCriteria: {
      boys: "",
      girls: "",
    },
    shortlistedCount: {
      boys: "",
      girls: "",
    },
    selectedCount: {
      boys: "",
      girls: "",
    },
    workMode: "",
    location: [],
    offerDetails: {
      receivedOffer: false,
      acceptedOffer: false,
    },
  });

  const [companies, setCompanies] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    increamentCounter();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/api/posts/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        const postData = response.data;
        console.log('Fetched post data:', postData); // Debug log

        // Directly set most of the fields
        setFormData(prev => ({
          ...prev,
          _id: postData._id,
          title: postData.title,
          content: postData.content,
          company: postData.company,
          role: postData.role,
          campusType: postData.campusType,
          jobType: postData.jobType,
          workMode: postData.workMode,
          difficultyLevel: postData.difficultyLevel,
          tags: Array.isArray(postData.tags) ? postData.tags.join(', ') : '',
          location: Array.isArray(postData.location) ? postData.location.join(', ') : '',
          
          // Nested objects need careful handling
          selectionProcess: {
            onlineAssessment: {
              aptitude: Boolean(postData.selectionProcess?.onlineAssessment?.aptitude),
              coreSubject: Boolean(postData.selectionProcess?.onlineAssessment?.coreSubject),
              codingRound: Boolean(postData.selectionProcess?.onlineAssessment?.codingRound),
              english: Boolean(postData.selectionProcess?.onlineAssessment?.english),
              communication: Boolean(postData.selectionProcess?.onlineAssessment?.communication)
            },
            groupDiscussion: Boolean(postData.selectionProcess?.groupDiscussion),
            onlineInterview: Boolean(postData.selectionProcess?.onlineInterview),
            offlineInterview: Boolean(postData.selectionProcess?.offlineInterview),
            others: postData.selectionProcess?.others || []
          },
          
          rounds: {
            technical: postData.rounds?.technical ?? 0,
            hr: postData.rounds?.hr ?? 0,
            hybrid: postData.rounds?.hybrid ?? 0
          },
          
          compensation: {
            stipend: postData.compensation?.stipend ?? '',
            ctc: postData.compensation?.ctc ?? '',
            baseSalary: postData.compensation?.baseSalary ?? ''
          },
          
          hiringPeriod: {
            month: postData.hiringPeriod?.month || new Date().getMonth() + 1,
            year: postData.hiringPeriod?.year || new Date().getFullYear()
          },
          
          cgpaCriteria: {
            boys: postData.cgpaCriteria?.boys ?? '',
            girls: postData.cgpaCriteria?.girls ?? ''
          },
          
          shortlistedCount: {
            boys: postData.shortlistedCount?.boys ?? '',
            girls: postData.shortlistedCount?.girls ?? ''
          },
          
          selectedCount: {
            boys: postData.selectedCount?.boys ?? '',
            girls: postData.selectedCount?.girls ?? ''
          },
          
          offerDetails: {
            receivedOffer: Boolean(postData.offerDetails?.receivedOffer),
            acceptedOffer: Boolean(postData.offerDetails?.acceptedOffer)
          }
        }));
        setLoading(false); // Set loading to false after data is processed

      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to fetch post data.");
        setLoading(false);
      }
    };

    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/api/companies`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCompanies(response.data.map((company) => company.name));
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    // Reset loading state when fetching starts
    setLoading(true);
    fetchPost();
    fetchCompanies();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("onlineAssessment.")) {
      const assessment = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        selectionProcess: {
          ...prev.selectionProcess,
          onlineAssessment: {
            ...prev.selectionProcess.onlineAssessment,
            [assessment]: checked,
          },
        },
      }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditorChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleSelectionProcessChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      selectionProcess: {
        ...prev.selectionProcess,
        [name]: checked,
      },
    }));
  };

  const handleAssessmentChange = (assessment) => {
    setFormData((prev) => ({
      ...prev,
      selectionProcess: {
        ...prev.selectionProcess,
        onlineAssessment: {
          ...prev.selectionProcess.onlineAssessment,
          [assessment]: !prev.selectionProcess.onlineAssessment[assessment],
        },
      },
    }));
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      location: value // Store as string in form state
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.loading("Updating post...");
      const token = localStorage.getItem("token");
      
      const tagsArray = formData.tags;

      const processedData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        // Convert location string to array before sending
        location: formData.location.split(',').map(loc => loc.trim()).filter(loc => loc),
        compensation: {
          stipend: formData.compensation.stipend === "" ? null : Number(formData.compensation.stipend),
          ctc: formData.compensation.ctc === "" ? null : Number(formData.compensation.ctc),
          baseSalary: formData.compensation.baseSalary === "" ? null : Number(formData.compensation.baseSalary),
        },
        rounds: {
          technical: formData.rounds.technical === "" ? 0 : Number(formData.rounds.technical),
          hr: formData.rounds.hr === "" ? 0 : Number(formData.rounds.hr),
          hybrid: formData.rounds.hybrid === "" ? 0 : Number(formData.rounds.hybrid),
        },
        cgpaCriteria: {
          boys: formData.cgpaCriteria.boys === "" ? null : Number(formData.cgpaCriteria.boys),
          girls: formData.cgpaCriteria.girls === "" ? null : Number(formData.cgpaCriteria.girls),
        },
        shortlistedCount: {
          boys: formData.shortlistedCount.boys === "" ? null : Number(formData.shortlistedCount.boys),
          girls: formData.shortlistedCount.girls === "" ? null : Number(formData.shortlistedCount.girls),
        },
        selectedCount: {
          boys: formData.selectedCount.boys === "" ? null : Number(formData.selectedCount.boys),
          girls: formData.selectedCount.girls === "" ? null : Number(formData.selectedCount.girls),
        },
      };

      await axios.put(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/api/posts/${id}`,
        processedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.dismiss();
      toast.success("Post updated successfully! It will be visible after admin verification.");
      navigate("/interview-experiences");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to update the post.");
      console.error("Error updating post:", error);
    }
  };

  const inputClassName = "w-full p-2 bg-zinc-800 text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const selectClassName = "w-full p-2 bg-zinc-800 text-white border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClassName = "block text-sm font-medium mb-2 text-gray-200";

  // Add loading state check in render
  if (loading) {
    return (
      <PostDetailWrapper>
        <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/4 rounded bg-zinc-800"></div>
            <div className="h-96 rounded bg-zinc-800"></div>
            {/* Add more skeleton loading elements as needed */}
          </div>
        </div>
      </PostDetailWrapper>
    );
  }

  return (
    <PostDetailWrapper>
      <div className="bg-gray-900 mx-auto min-h-screen p-4 sm:p-6">
        <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Edit Post</h2>
        <form className="rounded-lg bg-zinc-900 p-4 shadow-lg sm:p-6" onSubmit={handleSubmit}>
          {/* Grid layouts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Title */}
            <div className="mb-4">
              <label className={labelClassName}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            {/* Content with React Quill */}
            <div className="mb-4 md:col-span-2">
              <label className={labelClassName}>Content</label>
              <div className="text-white">
                <ReactQuill
                  value={formData.content}
                  onChange={handleEditorChange}
                  theme="snow"
                  placeholder="Write your interview experience here..."
                  className="custom-quill mt-2 rounded-lg border-zinc-700 bg-zinc-800 text-white"
                  modules={modules}
                  formats={formats}
                />
              </div>
            </div>

            {/* Company */}
            <div className="mb-4">
              <label className={labelClassName}>Company</label>
              <input
                type="text"
                list="companies"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={inputClassName}
                required
                placeholder="Select existing or type new company name"
              />
              <datalist id="companies">
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </datalist>
            </div>

            {/* Role */}
            <div className="mb-4">
              <label className={labelClassName}>Role</label>
              <input
                type="text"
                list="roles"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={inputClassName}
                required
                placeholder="Select existing or type new role"
              />
              <datalist id="roles">
                <option value="Software Developer" />
                <option value="Frontend Developer" />
                <option value="Backend Developer" />
                <option value="Full Stack Developer" />
                <option value="DevOps Engineer" />
                <option value="Data Scientist" />
                <option value="Other" />
              </datalist>
            </div>
          </div>

          {/* Interview Details Section */}
          <div className="mb-4 space-y-4">
            <h3 className="text-gray-200 text-lg font-semibold">Interview Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Campus and Job Type */}
              <div>
                <label className={labelClassName}>Campus Type</label>
                <select
                  name="campusType"
                  value={formData.campusType}
                  onChange={handleChange}
                  className={selectClassName}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="On Campus">On Campus</option>
                  <option value="Off Campus">Off Campus</option>
                  <option value="Pool Campus">Pool Campus</option>
                </select>
              </div>

              <div>
                <label className={labelClassName}>Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className={selectClassName}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="2 Month Internship">2 Month Internship</option>
                  <option value="6 Month Internship">6 Month Internship</option>
                  <option value="Full Time">Full Time</option>
                  <option value="6 Month Internship + Full Time">Internship + Full Time</option>
                </select>
              </div>
            </div>

            {/* Selection Process */}
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
              <h4 className="text-gray-200 mb-4 font-medium">Selection Process</h4>

              {/* Online Assessment Section */}
              <div className="mb-4 space-y-2">
                <h5 className="text-gray-300 text-sm font-medium">Online Assessment</h5>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {Object.entries(formData.selectionProcess.onlineAssessment).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`oa-${key}`}
                        checked={value}
                        onChange={() => handleAssessmentChange(key)}
                        className="mr-2 h-4 w-4 cursor-pointer rounded border-zinc-600 bg-zinc-700 focus:ring-blue-500"
                      />
                      <label htmlFor={`oa-${key}`} className="text-gray-200 cursor-pointer select-none">
                        {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Selection Processes */}
              <div className="space-y-2 border-t border-zinc-700 pt-4">
                <h5 className="text-gray-300 mb-2 text-sm font-medium">Other Processes</h5>
                <div className="grid grid-cols-2 gap-4"></div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="groupDiscussion"
                    id="groupDiscussion"
                    checked={formData.selectionProcess.groupDiscussion}
                    onChange={handleSelectionProcessChange}
                    className="mr-2 rounded border-zinc-600 bg-zinc-700"
                  />
                  <label className="text-gray-200" htmlFor="groupDiscussion">
                    Group Discussion
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="onlineInterview"
                    id="onlineInterview"
                    checked={formData.selectionProcess.onlineInterview}
                    onChange={handleSelectionProcessChange}
                    className="mr-2 rounded border-zinc-600 bg-zinc-700"
                  />
                  <label className="text-gray-200" htmlFor="onlineInterview">
                    Online Interview
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="offlineInterview"
                    id="offlineInterview"
                    checked={formData.selectionProcess.offlineInterview}
                    onChange={handleSelectionProcessChange}
                    className="mr-2 rounded border-zinc-600 bg-zinc-700"
                  />
                  <label className="text-gray-200" htmlFor="offlineInterview">
                    Offline Interview
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Rounds */}
          <div className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Object.keys(formData.rounds).map((roundType) => (
              <div key={roundType}>
                <label className={labelClassName}>
                  {roundType.charAt(0).toUpperCase() + roundType.slice(1)} Rounds
                </label>
                <input
                  type="number"
                  name={`rounds.${roundType}`}
                  value={formData.rounds[roundType]}
                  onChange={handleChange}
                  min="0"
                  className={inputClassName}
                />
              </div>
            ))}
          </div>

          {/* Compensation */}
          <div className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClassName}>Stipend (₹/month)</label>
              <input
                type="number"
                name="compensation.stipend"
                value={formData.compensation.stipend}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>CTC (LPA)</label>
              <input
                type="number"
                name="compensation.ctc"
                value={formData.compensation.ctc}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>Base Salary (LPA)</label>
              <input
                type="number"
                name="compensation.baseSalary"
                value={formData.compensation.baseSalary}
                onChange={handleChange}
                className={inputClassName}
              />
            </div>
          </div>

          {/* Hiring Period */}
          <div className="my-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClassName}>Hiring Month</label>
              <select
                name="hiringPeriod.month"
                value={formData.hiringPeriod.month}
                onChange={handleChange}
                className={selectClassName}
                required
              >
                <option value="">Select Month</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClassName}>Hiring Year</label>
              <select
                name="hiringPeriod.year"
                value={formData.hiringPeriod.year}
                onChange={handleChange}
                className={selectClassName}
                required
              >
                <option value="">Select Year</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="my-4">
            <label className={labelClassName}>Difficulty Level (1-10)</label>
            <input
              type="range"
              name="difficultyLevel"
              min="1"
              max="10"
              value={formData.difficultyLevel}
              onChange={handleChange}
              className="w-full accent-blue-500"
            />
            <div className="text-gray-200 text-center">{formData.difficultyLevel}</div>
          </div>

          {/* Placement Statistics */}
          <div className="my-4 mb-4 space-y-4">
            <h3 className="text-gray-200 text-lg font-semibold">Placement Statistics</h3>

            {/* CGPA Criteria */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName}>CGPA Criteria (Boys)</label>
                <input
                  type="number"
                  step="0.01"
                  name="cgpaCriteria.boys"
                  value={formData.cgpaCriteria.boys}
                  onChange={handleChange}
                  className={inputClassName}
                  min="0"
                  max="10"
                />
              </div>
              <div>
                <label className={labelClassName}>CGPA Criteria (Girls)</label>
                <input
                  type="number"
                  step="0.01"
                  name="cgpaCriteria.girls"
                  value={formData.cgpaCriteria.girls}
                  onChange={handleChange}
                  className={inputClassName}
                  min="0"
                  max="10"
                />
              </div>
            </div>

            {/* Shortlisting Statistics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName}>Shortlisted Boys</label>
                <input
                  type="number"
                  name="shortlistedCount.boys"
                  value={formData.shortlistedCount.boys}
                  onChange={handleChange}
                  className={inputClassName}
                  min="0"
                />
              </div>
              <div>
                <label className={labelClassName}>Shortlisted Girls</label>
                <input
                  type="number"
                  name="shortlistedCount.girls"
                  value={formData.shortlistedCount.girls}
                  onChange={handleChange}
                  className={inputClassName}
                  min="0"
                />
              </div>
            </div>

            {/* Selected Candidates */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName}>Selected Boys</label>
                <input
                  type="number"
                  name="selectedCount.boys"
                  value={formData.selectedCount.boys}
                  onChange={handleChange}
                  className={inputClassName}
                  min="0"
                />
              </div>
              <div>
                <label className={labelClassName}>Selected Girls</label>
                <input
                  type="number"
                  name="selectedCount.girls"
                  value={formData.selectedCount.girls}
                  onChange={handleChange}
                  className={inputClassName}
                  min="0"
                />
              </div>
            </div>

            {/* Work Mode and Location */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClassName}>Work Mode</label>
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleChange}
                  className={selectClassName}
                  required
                >
                  <option value="">Select Work Mode</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className={labelClassName}>Locations (comma-separated)</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''} // Add fallback empty string
                  onChange={handleLocationChange}
                  className={inputClassName}
                  required
                  placeholder="Bangalore, Mumbai, Delhi"
                />
              </div>
            </div>
          </div>

          {/* Offer Status */}
          <div className="mb-4 space-y-4">
            <h3 className="text-gray-200 text-lg font-semibold">Offer Status</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="receivedOffer"
                  name="offerDetails.receivedOffer"
                  checked={formData.offerDetails.receivedOffer}
                  onChange={(e) => {
                    const { checked } = e.target;
                    setFormData((prev) => {
                      const newState = {
                        ...prev,
                        offerDetails: {
                          ...prev.offerDetails,
                          receivedOffer: checked,
                          acceptedOffer: checked ? prev.offerDetails.acceptedOffer : false,
                        },
                      };
                      return newState;
                    });
                  }}
                  className="mr-2 rounded border-zinc-600 bg-zinc-700"
                />
                <label htmlFor="receivedOffer" className="text-gray-200">
                  Received Offer
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="acceptedOffer"
                  name="offerDetails.acceptedOffer"
                  checked={formData.offerDetails.acceptedOffer}
                  disabled={!formData.offerDetails.receivedOffer}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      offerDetails: {
                        ...prev.offerDetails,
                        acceptedOffer: e.target.checked,
                      },
                    }));
                  }}
                  className="mr-2 rounded border-zinc-600 bg-zinc-700 disabled:opacity-50"
                />
                <label htmlFor="acceptedOffer" className="text-gray-200">
                  Accepted Offer
                </label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className={labelClassName}>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Update
          </button>
        </form>
        <style jsx>{`
          .custom-quill .ql-toolbar {
            background-color: rgb(39 39 42);
            border-color: rgb(63 63 70);
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
          }
          .custom-quill .ql-container {
            background-color: rgb(39 39 42);
            border-color: rgb(63 63 70);
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
            color: white;
          }
          .custom-quill .ql-picker {
            color: white;
            background-color: rgb(63 63 70); /* Dark shade of zinc */
          }
          .custom-quill .ql-picker-options {
            min-width: fit-content;
            background-color: rgb(63 63 70); /* Dark shade of zinc */
          }
          .custom-quill .ql-stroke {
            stroke: white;
          }
          .custom-quill .ql-fill {
            fill: white;
          }
          .custom-quill .ql-editor::before {
            color: white; /* Placeholder text color */
          }
        `}</style>
      </div>
    </PostDetailWrapper>
  );
};

export default EditPost;