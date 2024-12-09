import React, { useContext, useEffect, useRef, useState } from "react";
import Swal from 'sweetalert2';
import { BeatLoader } from 'react-spinners';
import { useNavigate } from "react-router-dom";
import Pagination from './Pagination'; // Import Pagination component
import { AppContext } from "./Context/App_Context";

const Admin = () => {
  const { API_base_url, isLoggedIn, userRole, getStoredToken } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [apiReturnedData, setApiReturnedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [RecordsEstimate, setRecordsEstimate] = useState(0);
  const itemsPerPage = 5;

  let tempFetchData = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    if (!getStoredToken()) {
      navigate(`/`);
    }

    if (isLoggedIn() && userRole() !== 'admin') {
      navigate(`/`);
    }
  }, [isLoggedIn, navigate, getStoredToken, userRole]);

  const handleProcessData = (targetData) => {
    let processed = <h3 className="son3x myspans Overideflexdirection1ToRow centerMe">No records yet!</h3>
    if (targetData.length > 0) {
      processed = targetData.map((data) => {
        const renderFiles = () => {
          if (!Array.isArray(data.files) || data.files.length === 0) {
            return <p>No file uploaded</p>;
          }

          return data.files.map((file, index) => (
            <div key={index}>
              Download CV: <a href={`${API_base_url}${file.filePath}`} download={file.fileName}>{file.fileName}</a>
            </div>
          ));
        };

        return (
          <div key={data._id} className="profile-card">
            <h3 className="profile-name">Name: {data.name}</h3>
            <p className="profile-email">Email: <a href={`mailto:${data.email}`}>{data.email}</a></p>
            <p className="profile-phone">Phone: <a href={`tel:${data.phone}`}>{data.phone}</a></p>
            <div className="profile-cv">{renderFiles()}</div>
          </div>
        );
      });
    }
    return processed;
  };

  const fetchData = async () => {
    setIsLoading(true);
    const url = `${API_base_url}api/v1/supportscv?page=${currentPage}&limit=${itemsPerPage}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${getStoredToken()}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        if (data.data) {
          setApiReturnedData(data.data);
          if (data.RecordsEstimate) {
            setRecordsEstimate(data.RecordsEstimate);
          }
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
        throw Error('Could not fetch the data for that resource, ' + data.message);
      }
    } catch (error) {
      Swal.fire(error.message);
      console.error('Request failed:', error);
    }
  };

  tempFetchData.current = fetchData;

  useEffect(() => {
    tempFetchData.current();
  }, [currentPage]); // Trigger fetchData when currentPage changes

  return (
    <div>
      <h2 className="AdminHeader">Admin</h2>
      {isLoading ? (
        <h3 className="centerMe">{isLoading && <BeatLoader color='green' loading={isLoading} size={8} />}</h3>
      ) : (
        <div>
          <div className="just_a_container">
            <div className="main_flex_container">
              {handleProcessData(apiReturnedData)}
            </div>
          </div>
          <Pagination
            totalPages={Math.ceil(RecordsEstimate / itemsPerPage)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default Admin;
