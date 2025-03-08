import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
    return (
        <div style={{ marginTop: '10px', padding: '20px', display: 'flex', alignContent: 'flex-end' }}>
            <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
            >
                Previous
            </button>
            <span style={{ padding: '10px' }}> Page {page} of {totalPages} </span>
            <button
                onClick={() => { onPageChange(Math.min(totalPages, page + 1)) }}
                disabled={page === totalPages}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;