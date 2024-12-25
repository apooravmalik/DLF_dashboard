import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import SQLQueryForm from "../components/SQLQueryForm";

const QueryPage = () => {
  const { setQueries } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = (queries) => {
    setQueries(queries);
    navigate("/report"); // Redirect to Report Page
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#18181B] text-white">
      <SQLQueryForm onSubmit={handleSubmit} />
    </div>
  );
};

export default QueryPage;
