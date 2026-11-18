const covers = {
  doraemon: {
    title: 'Doraemon Volume 1', author: 'Fujiko F. Fujio', year: 1974, isbn: '4091400019',
    url: 'https://covers.openlibrary.org/b/olid/OL25651178M-L.jpg?default=false',
    source: 'https://openlibrary.org/books/OL25651178M',
  },
  'aladin va 40 ten cuop': {
    title: 'Tales from the Arabian Nights', author: 'Donna Jo Napoli', year: 2016, isbn: '9781426325403',
    url: 'https://covers.openlibrary.org/b/olid/OL27217641M-L.jpg?default=false',
    source: 'https://openlibrary.org/books/OL27217641M',
  },
  conan: {
    title: 'Case Closed, Vol. 01', author: 'Gosho Aoyama', year: 2004, isbn: '1591163277',
    url: 'https://covers.openlibrary.org/b/olid/OL23028052M-L.jpg?default=false',
    source: 'https://openlibrary.org/books/OL23028052M',
  },
  'clean architecture': {
    title: 'Clean Architecture', author: 'Robert C. Martin', year: 2017, isbn: '9780134494166',
    url: 'https://covers.openlibrary.org/b/olid/OL31838215M-L.jpg?default=false',
    source: 'https://openlibrary.org/books/OL31838215M',
  },
};

const normalize = value => String(value ?? '').normalize('NFKD').toLowerCase().replace(/đ/g, 'd')
  .replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
const digits = value => String(value ?? '').replace(/\D/g, '');

export function coverFor(book) {
  const isbn = digits(book.isbn);
  const cover = (isbn && Object.values(covers).find(item => item.isbn === isbn)) || covers[normalize(book.title)];
  if (!cover) return null;
  const exact = (isbn && isbn === cover.isbn) ||
    (normalize(book.title) === normalize(cover.title) && normalize(book.authorName) === normalize(cover.author) && book.publishedYear === cover.year);
  return {...cover, illustrative: !exact};
}
