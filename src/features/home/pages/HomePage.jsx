import {ArrowDown, ArrowRight, BookOpen, CalendarDays, LibraryBig, Search, UserRound} from 'lucide-react';
import {Link} from 'react-router-dom';
import {ROUTES, ROLE_HOME} from '@/app/router/routePaths';
import {useAuth} from '@/features/auth/hooks/useAuth';
import {loginDestination} from '@/features/auth/navigation';
import BookCover from '@/features/books/components/BookCover';

const sections = [
  ['#tinh-nang', 'Dành cho độc giả'],
  ['#bo-suu-tap', 'Bộ sưu tập'],
  ['#bat-dau', 'Bắt đầu'],
];

const featuredBooks = [
  {title: 'Doraemon', category: 'Truyện tranh', shelf: 'bg-[#e5eae2]'},
  {title: 'Conan', category: 'Truyện tranh', shelf: 'bg-[#e9e0d4]'},
  {title: 'Clean Architecture', category: 'Sách công nghệ', shelf: 'bg-[#dfe7ea]'},
];

const features = [
  {icon: Search, title: 'Tra cứu danh mục', description: 'Tìm theo tên sách, tác giả hoặc thể loại để chọn cuốn bạn muốn đọc.'},
  {icon: LibraryBig, title: 'Xem sách còn sẵn', description: 'Kiểm tra số bản có thể cho mượn trước khi đến quầy thủ thư.'},
  {icon: CalendarDays, title: 'Theo dõi phiếu mượn', description: 'Xem sách đang mượn, hạn trả và lịch sử các lần mượn đã hoàn tất.'},
  {icon: UserRound, title: 'Cập nhật hồ sơ', description: 'Xem thông tin độc giả và chỉnh sửa họ tên, số điện thoại khi cần.'},
];

const steps = [
  ['Tạo tài khoản', 'Điền biểu mẫu đăng ký, sau đó đăng nhập để vào không gian độc giả.'],
  ['Tìm sách', 'Tra cứu danh mục và xem số bản còn có thể cho mượn.'],
  ['Đến quầy thủ thư', 'Thủ thư lập phiếu mượn hoặc ghi nhận việc trả sách. Bạn có thể theo dõi phiếu trong tài khoản.'],
];

const container = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12';
const sectionTitle = 'landing-display text-3xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-4xl lg:text-5xl';
const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold';
const primary = 'bg-navy-900 text-white hover:bg-navy-800';
const currentYear = new Date().getFullYear();

export default function HomePage() {
  const {user, isAuthenticated} = useAuth();
  const destination = isAuthenticated ? loginDestination(user?.role, undefined, ROUTES, ROLE_HOME) : null;
  const entry = destination ?? ROUTES.REGISTER;
  const action = destination ? 'Vào thư viện' : 'Đăng ký tài khoản';

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <a href="#noi-dung" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Chuyển đến nội dung
      </a>
      <header className="border-b border-navy-900/12">
        <div className={`${container} flex flex-wrap items-center justify-between gap-x-5 pb-3 pt-4 sm:pt-5 lg:flex-nowrap lg:py-5`}>
          <Link to={ROUTES.HOME} aria-label="Thư viện Tạ Quang Bửu, trang chủ" className="inline-flex shrink-0 items-center gap-3 text-navy-900">
            <span className="grid size-10 place-items-center rounded-full border border-sage-800/35 bg-sage-100 text-sage-800">
              <BookOpen size={21} strokeWidth={1.6} aria-hidden="true"/>
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-semibold uppercase tracking-[.16em] text-sage-800">Thư viện</span>
              <span className="landing-display text-lg font-semibold sm:text-xl">Tạ Quang Bửu</span>
            </span>
          </Link>
          <nav aria-label="Các mục trên trang" className="flex basis-full flex-wrap gap-x-4 py-1 text-sm font-medium text-navy-900 lg:basis-auto lg:gap-x-6 lg:py-0">
            {sections.map(([href, label]) => <a key={href} href={href} className="inline-flex min-h-11 items-center hover:underline">{label}</a>)}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            {destination ? (
              <Link to={destination} className={`${button} ${primary}`}>Vào thư viện <ArrowRight size={16} aria-hidden="true"/></Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className={`${button} border border-navy-900/30 text-navy-900 hover:bg-sage-100 lg:border-transparent`}>Đăng nhập</Link>
                <Link to={ROUTES.REGISTER} className={`${button} ${primary}`}>Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="noi-dung" tabIndex={-1} className="outline-none">
        <section className={`${container} grid items-center gap-8 py-11 sm:py-16 lg:grid-cols-[.96fr_1.04fr] lg:gap-12 lg:py-18`}>
          <div>
            <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.17em] text-sage-800">
              <span className="h-px w-8 bg-sage-800" aria-hidden="true"/> Cổng thông tin độc giả
            </p>
            <h1 className="landing-display text-[clamp(2.65rem,4.8vw,4.75rem)] font-semibold leading-[1.12] tracking-[-.05em] text-navy-900">
              Khám phá <span className="block font-medium text-sage-800">kho sách của bạn</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-700">
              Tìm cuốn sách bạn cần, xem số bản còn sẵn và theo dõi hạn trả trong tài khoản độc giả.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={entry} className={`${button} ${primary} min-h-12`}>{action} <ArrowRight size={17} aria-hidden="true"/></Link>
              {!destination && <Link to={ROUTES.LOGIN} className={`${button} min-h-12 border border-navy-900/35 text-navy-900 hover:bg-sage-100`}>Đăng nhập</Link>}
            </div>
            <a href="#tinh-nang" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-sage-800 hover:underline sm:mt-6">
              <ArrowDown size={16} aria-hidden="true"/> Xem thư viện hỗ trợ bạn thế nào
            </a>
          </div>
          <figure>
            <div className="rounded-tl-[4rem] rounded-br-[2rem] border border-sage-800/25 p-2 sm:rounded-tl-[6rem] sm:p-2.5">
              <img src="/landing-library.webp" alt="Không gian đọc với kệ sách gỗ và ghế bành đón nắng" width="1600" height="1067" fetchPriority="high" decoding="async"
                className="aspect-[5/4] w-full rounded-tl-[3.5rem] rounded-br-[1.5rem] object-cover object-[69%_center] sm:aspect-[4/3] sm:rounded-tl-[5.4rem] lg:aspect-[1.18]"/>
            </div>
            <figcaption className="mt-3 text-xs leading-relaxed text-slate-700">
              Ảnh minh họa tại Groningen, Hà Lan · <a className="underline underline-offset-2 hover:text-navy-900" href="https://unsplash.com/photos/a-library-with-books-on-shelves-Ud5MFQQV1F8">Denise Jans / Unsplash</a>
            </figcaption>
          </figure>
        </section>

        <section id="tinh-nang" className="scroll-mt-6 border-y border-sage-800/15 bg-sage-100 py-14 sm:py-20">
          <div className={container}>
            <h2 className={`${sectionTitle} max-w-3xl`}>Đang tìm sách hay cần kiểm tra hạn trả?</h2>
            <div className="mt-9 grid gap-x-7 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({icon: Icon, title, description}) => (
                <article key={title} className="border-t border-sage-800/30 pt-5">
                  <Icon size={25} strokeWidth={1.6} className="text-sage-800" aria-hidden="true"/>
                  <h3 className="landing-display mt-4 text-xl font-semibold text-navy-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{description}</p>
                </article>
              ))}
            </div>
            <p className="mt-8 border-l-2 border-sage-800 pl-4 text-sm leading-relaxed text-navy-900">
              <strong>Mượn, trả và gia hạn:</strong> vui lòng liên hệ thủ thư tại quầy.
            </p>
          </div>
        </section>

        <section id="bo-suu-tap" className={`${container} scroll-mt-6 py-14 sm:py-20`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className={sectionTitle}>Khám phá bộ sưu tập</h2>
            <p className="max-w-sm text-sm leading-relaxed text-slate-700">Một vài tựa sách gợi ý. Đăng nhập để tra cứu danh mục và xem số bản hiện còn.</p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {featuredBooks.map(book => (
              <article key={book.title} className="border-b border-navy-900/15 pb-4">
                <div className={`rounded-xl px-4 py-6 sm:py-8 ${book.shelf}`}>
                  <BookCover book={book} className="mx-auto w-full max-w-40 shadow-lg"/>
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-sage-800">{book.category}</p>
                <h3 className="landing-display mt-1 text-xl font-semibold text-navy-900">{book.title}</h3>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs text-slate-700">Nguồn ảnh bìa: <a href="https://openlibrary.org/" className="underline underline-offset-2 hover:text-navy-900">Open Library</a>.</p>
        </section>

        <section id="bat-dau" className="scroll-mt-6 border-t border-navy-900/12 bg-paper py-14 sm:py-20">
          <div className={`${container} grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:gap-16`}>
            <h2 className={sectionTitle}>Bắt đầu với thư viện</h2>
            <ol className="list-decimal space-y-5 pl-6 marker:font-semibold marker:text-sage-800">
              {steps.map(([title, description]) => (
                <li key={title} className="border-b border-navy-900/12 pb-5 pl-2">
                  <h3 className="font-semibold text-navy-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-navy-900 py-12 text-white sm:py-16">
          <div className={`${container} flex flex-wrap items-center justify-between gap-6`}>
            <h2 className="landing-display max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
              {destination ? 'Tìm cuốn sách tiếp theo của bạn' : 'Tạo tài khoản để bắt đầu tra cứu'}
            </h2>
            <Link to={entry} className={`${button} min-h-12 bg-paper text-navy-900 hover:bg-sage-100 focus-visible:outline-paper`}>
              {action} <ArrowRight size={17} aria-hidden="true"/>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-paper py-6 text-sm text-slate-700">
        <div className={`${container} flex flex-wrap items-center justify-between gap-x-8 gap-y-2`}>
          <p>© {currentYear} Thư viện Tạ Quang Bửu</p>
          <nav aria-label="Liên kết cuối trang" className="flex flex-wrap gap-x-5">
            {sections.map(([href, label]) => <a key={href} href={href} className="py-2 hover:underline">{label}</a>)}
            {destination ? (
              <Link to={destination} className="py-2 hover:underline">Vào thư viện</Link>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="py-2 hover:underline">Đăng nhập</Link>
                <Link to={ROUTES.REGISTER} className="py-2 hover:underline">Đăng ký</Link>
              </>
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}
