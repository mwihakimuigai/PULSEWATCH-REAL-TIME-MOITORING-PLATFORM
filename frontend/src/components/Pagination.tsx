export const Pagination = ({
  page,
  totalPages,
  onPageChange
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="pagination">
    <button className="ghost-button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
      Previous
    </button>
    <span>
      Page {page} of {Math.max(totalPages, 1)}
    </span>
    <button className="ghost-button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
      Next
    </button>
  </div>
);
