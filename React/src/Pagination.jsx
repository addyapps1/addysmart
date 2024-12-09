import React from 'react';
import './Pagination.css'; // Import your CSS file for pagination styling

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  // Calculate the range of pages to display
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(startPage + 4, totalPages);

  // Generate an array of page numbers within the range
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  const handleNextPage = () => {
    onPageChange(currentPage + 1);
  };

  const handlePrevPage = () => {
    onPageChange(currentPage - 1);
  };

  const handleFirstPage = () => {
    onPageChange(1);
  };

  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  return (
    <div className="pagination-container">
      <button className={`pagination-button `} onClick={handleFirstPage} disabled={currentPage === 1}>{'<<'}</button>
      <button className={`pagination-button `} onClick={handlePrevPage} disabled={currentPage === 1}>{'<'}</button>
      {pages.map((page) => (
        <button
          key={page}
          className={`pagination-button ${currentPage === page ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button className={`pagination-button `} onClick={handleNextPage} disabled={currentPage === totalPages}>{'>'}</button>
      <button className={`pagination-button `} onClick={handleLastPage} disabled={currentPage === totalPages}>{'>>'}</button>
    </div>
  );
};

export default Pagination;
