import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";

function PaginationElement({pagination, LoadFunction}) {
    const [nPages, setNPages] = useState(1)

    useEffect(()=> { if(pagination) setNPages(Math.ceil(pagination.total/pagination.size))}, [pagination])

    const handlePageClick = (event) => {
        // the library starts counting from 0
        LoadFunction(event.selected+1)
      };

    return (
        <>
        {nPages > 1 &&
            <ReactPaginate
                breakLabel="..."
                nextLabel="next"
                onPageChange={handlePageClick}
                pageRangeDisplayed={1}
                marginPagesDisplayed={1}
                pageCount={nPages}
                previousLabel="prev"
                renderOnZeroPageCount={null}
                containerClassName="pagination justify-content-center"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                activeClassName="active"
                hrefAllControls
                forcePage={pagination.page-1}
            />
        }
        </>
    );
};
export default PaginationElement;
