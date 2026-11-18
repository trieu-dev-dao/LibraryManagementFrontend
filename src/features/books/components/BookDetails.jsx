import Modal from "@/shared/components/ui/Modal";
import BookCover from './BookCover';

function BookDetails({ book, isOpen, onClose }) {
  if (!book) return null;

  const details = [
    ["Mã sách", book.id],
    ["Tên sách", book.title],
    ["Tác giả", book.authorName ?? "—"],
    ["Thể loại", book.categoryName ?? "—"],
    ["Số bản hiện còn", book.quantity ?? 0],
    ["Năm xuất bản", book.publishedYear ?? "—"],
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết sách">
      <div className="space-y-4">
        <BookCover book={book} className="mx-auto w-32"/>

        <h3 className="text-center text-xl font-bold text-gray-900">
          {book.title}
        </h3>

        <div className="divide-y divide-gray-100">
          {details.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="text-right font-medium text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default BookDetails;
