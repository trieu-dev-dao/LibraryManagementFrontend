import {test, expect} from '@playwright/test';

// In-memory contract fixtures, never live integration or production data.
const token = 'test.' + Buffer.from(JSON.stringify({exp: Math.floor(Date.now()/1000) + 3600})).toString('base64url') + '.signature';
const auth = role => ({token, userId: 7, memberId: role === 'User' ? 3 : null, username: 'tester', role});
const book = {id: 1, title: 'Sách kiểm thử', authorId: 1, authorName: 'Tác giả A', categoryId: 1, categoryName: 'Thể loại A', quantity: 2, publishedYear: 2020};
const readerProfile = {userId: 7, memberId: 3, username: 'tester', email: 'reader@example.test', fullName: 'Độc giả A', phone: null};
const readerLoan = {id: 12, bookTitle: book.title, quantity: 1, borrowDate: '2026-11-16T09:00:00Z', dueDate: '2026-11-16', returnDate: null, status: 'Đang mượn', isCompleted: false};
async function session(page, role = 'Admin') {
  await page.addInitScript(({token, ...user}) => localStorage.setItem('library-auth', JSON.stringify({state: {accessToken: token, user}})), auth(role));
}
async function mockApi(page, overrides = {}) {
  const state = {
    books: [structuredClone(book)], authors: [{id: 1, name: 'Tác giả A', bio: null}],
    categories: [{id: 1, name: 'Thể loại A'}], members: [{id: 3, fullName: 'Độc giả A', email: 'reader@example.test', phone: null}],
    loans: [], readerLoans: {activeLoanCount: 0, loans: []}, readerProfile: {...readerProfile},
    requests: [], failBooks: false, ...overrides,
  };
  await page.route('**/test-api/**', async route => {
    const req = route.request(), url = new URL(req.url()), pathname = url.pathname.replace('/test-api', '');
    state.requests.push([req.method(), pathname + url.search]);
    const json = (data, status = 200) => route.fulfill({status, json: data});
    if (state.handler && await state.handler({req, pathname, json, state})) return;
    if (pathname === '/auth/login') return json(auth(req.postDataJSON().username === 'reader' ? 'User' : 'Admin'));
    if (pathname === '/books' && req.method() === 'GET') return state.failBooks ? json({message: 'internal'}, 500) : json(state.books);
    if (pathname === '/books/1' && req.method() === 'GET') return json(state.books[0]);
    if (pathname === '/books' && req.method() === 'POST') {
      const created = {...book, ...req.postDataJSON(), id: 2};
      state.books.push(created);
      if (state.failAfterWrite) state.failBooks = true;
      return json(created);
    }
    if (/^\/books\/\d+$/.test(pathname) && req.method() === 'PUT') {
      const id = Number(pathname.split('/').at(-1));
      const index = state.books.findIndex(item => item.id === id);
      if (index < 0) return json({message: 'Không tìm thấy sách.'}, 404);
      state.books[index] = {...state.books[index], ...req.postDataJSON()};
      return json(state.books[index]);
    }
    if (/^\/books\/\d+$/.test(pathname) && req.method() === 'DELETE') {
      const id = Number(pathname.split('/').at(-1));
      const index = state.books.findIndex(item => item.id === id);
      if (index < 0) return json({message: 'Không tìm thấy sách.'}, 404);
      state.books.splice(index, 1);
      return route.fulfill({status: 204, body: ''});
    }
    if (pathname === '/authors') return json(state.authors);
    if (pathname === '/categories') return json(state.categories);
    if (pathname === '/members') return json(state.members);
    if (pathname === '/reader/loans' && req.method() === 'GET')
      return state.unlinkedReader ? json({code: 'member_not_linked', message: 'Tài khoản chưa có hồ sơ độc giả.'}, 409)
        : state.failReaderLoans ? json({message: 'internal'}, 500) : json(state.readerLoans);
    if (pathname === '/reader/profile' && req.method() === 'GET') return json(state.readerProfile);
    if (pathname === '/reader/profile' && req.method() === 'PUT') {
      state.readerProfile = {...state.readerProfile, ...req.postDataJSON()};
      return json(state.readerProfile);
    }
    if (pathname === '/borrow-records' && req.method() === 'GET') {
      const status = url.searchParams.get('status');
      return json(status ? state.loans.filter(item => item.status === status) : state.loans);
    }
    if (pathname === '/borrow-records/borrow') {
      const loan = {id: 1, ...req.postDataJSON(), bookTitle: book.title, memberFullName: 'Độc giả A',
        borrowDate: new Date().toISOString(), returnDate: null, status: 'Đang mượn', isLateReturn: false};
      state.loans.push(loan); state.books[0].quantity--; return json(loan);
    }
    if (pathname === '/borrow-records/1/return') {
      state.loans[0].status = state.loans[0].isLateReturn ? 'Quá hạn' : 'Đã trả';
      state.loans[0].returnDate = new Date().toISOString();
      state.books[0].quantity++; return json(state.loans[0]);
    }
    return json({message: 'Không tìm thấy dữ liệu.'}, 404);
  });
  return state;
}
test('startup without Google, corrupt storage, login and preserved return URL', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('library-auth', '{bad'));
  await mockApi(page);
  await page.goto('/user/books?q=ki%E1%BB%83m&page=1');
  await expect(page.getByText('Đăng nhập Google chưa được cấu hình.', {exact: false})).toBeVisible();
  await page.getByLabel('Tên đăng nhập hoặc email').fill('reader');
  await page.getByLabel('Mật khẩu', {exact: true}).fill('password');
  await page.getByRole('button', {name: 'Đăng nhập', exact: true}).click();
  await expect(page).toHaveURL(/user\/books\?q=/);
  await expect(page.getByRole('heading', {name: book.title})).toBeVisible();
});
test('public homepage loads without catalog requests and links to both forms', async ({page}) => {
  const apiRequests = [];
  await page.route('**/test-api/**', route => {
    apiRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', {name: 'Khám phá kho sách của bạn'})).toBeVisible();
  await expect(page.locator('img[src="/landing-library.webp"]')).toHaveAttribute('alt', /Không gian đọc/);
  expect(await page.locator('img[src="/landing-library.webp"]').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.locator('#bo-suu-tap').scrollIntoViewIfNeeded();
  await expect(page.getByText('Ảnh minh họa').first()).toBeVisible();
  await expect(page.locator('#bo-suu-tap img').first()).toHaveAttribute('alt', /Ảnh minh họa/);
  await expect.poll(() => page.locator('#bo-suu-tap img').evaluateAll(images => images.filter(image => image.naturalWidth > 0).length), {timeout: 10000}).toBeGreaterThan(0);
  await page.screenshot({path: 'test-results/home-desktop.png', fullPage: true});
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Khám phá kho sách của bạn'})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('img[src="/landing-library.webp"]').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('img[src="/landing-library.webp"]').evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({path: 'test-results/home-mobile.png', fullPage: true});
  await page.setViewportSize({width: 320, height: 568});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({reducedMotion: 'reduce'});
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Khám phá kho sách của bạn'})).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', {name: 'Chuyển đến nội dung'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#noi-dung$/);
  await expect(page.locator('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('main').getByRole('link', {name: 'Đăng ký tài khoản'}).first()).toBeFocused();
  expect(apiRequests).toEqual([]);
  await page.goto('/');
  await page.getByRole('banner').getByRole('link', {name: 'Đăng ký', exact: true}).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole('heading', {name: 'Đăng ký tài khoản'})).toBeVisible();
  await page.goto('/');
  await page.getByRole('banner').getByRole('link', {name: 'Đăng nhập', exact: true}).click();
  await expect(page).toHaveURL(/\/login$/);
});
test('password registration remains available', async ({page}) => {
  let submitted;
  await mockApi(page, {handler: async ({req, pathname, json}) => {
    if (pathname !== '/auth/register') return false;
    submitted = req.postDataJSON();
    await json({message: 'OK'});
    return true;
  }});
  await page.goto('/register');
  await page.getByLabel('Họ tên').fill('Độc giả mới');
  await page.getByLabel('Tên đăng nhập', {exact: true}).fill('reader_new');
  await page.getByLabel('Email').fill('new@example.test');
  await page.getByLabel('Mật khẩu', {exact: true}).fill('password123');
  await page.getByRole('button', {name: 'Đăng ký', exact: true}).click();
  await expect(page.getByRole('status')).toContainText('Đăng ký thành công');
  expect(submitted).toMatchObject({fullName: 'Độc giả mới', username: 'reader_new', email: 'new@example.test'});
});
test('Google sign-up uses the existing login endpoint once and enters the reader dashboard', async ({page}) => {
  test.skip(!process.env.TEST_GOOGLE_CLIENT_ID, 'Chỉ chạy với Google giả lập.');
  await page.route('https://accounts.google.com/gsi/client*', route => route.fulfill({contentType: 'text/javascript', body: `
    window.google = {accounts: {id: {
      initialize(options) { window.googleCallback = options.callback; },
      renderButton(container, options) {
        window.googleButtonText = options.text;
        container.replaceChildren();
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = 'Google test';
        button.onclick = () => { window.googleCallback({credential: 'test-id-token'}); window.googleCallback({credential: 'test-id-token'}); };
        container.appendChild(button);
      },
      cancel() {},
    }}};
  `}));
  let posted, failGoogle = true;
  const state = await mockApi(page, {handler: async ({req, pathname, json}) => {
    if (pathname !== '/auth/google-login') return false;
    posted = req.postDataJSON();
    await new Promise(resolve => setTimeout(resolve, 300));
    await json(failGoogle ? {message: 'Không thể xác thực Google.'} : auth('User'), failGoogle ? 401 : 200);
    return true;
  }});
  await page.goto('/register');
  await expect(page.getByRole('button', {name: 'Google test'})).toBeVisible();
  expect(await page.evaluate(() => window.googleButtonText)).toBe('signup_with');
  await page.getByRole('button', {name: 'Google test'}).click();
  await expect(page.getByText('Đang xác thực tài khoản...')).toBeVisible();
  await expect(page.getByRole('button', {name: 'Đăng ký', exact: true})).toBeDisabled();
  await expect(page.getByRole('alert')).toHaveText('Không thể xác thực Google.');
  await expect(page.getByRole('button', {name: 'Đăng ký', exact: true})).toBeEnabled();
  expect(state.requests.filter(([method, path]) => method === 'POST' && path === '/auth/google-login')).toHaveLength(1);
  failGoogle = false;
  await page.getByRole('button', {name: 'Google test'}).click();
  await expect(page).toHaveURL(/\/user\/dashboard$/);
  expect(posted).toEqual({idToken: 'test-id-token'});
  expect(state.requests.filter(([method, path]) => method === 'POST' && path === '/auth/google-login')).toHaveLength(2);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('library-auth')).state.user.memberId)).toBe(3);
  await page.goto('/login');
  await expect(page.getByRole('button', {name: 'Google test'})).toBeVisible();
  expect(await page.evaluate(() => window.googleButtonText)).toBe('signin_with');
});
test('signed-in reader stays on public homepage and enters their dashboard', async ({page}) => {
  await session(page, 'User'); await mockApi(page); await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole('banner').getByRole('link', {name: 'Vào thư viện'}).click();
  await expect(page).toHaveURL(/user\/dashboard$/);
  await page.goto('/admin/members'); await expect(page.getByText('403 - Không có quyền truy cập')).toBeVisible();
});
test('staff login and homepage entry lead to the staff dashboard', async ({page}) => {
  await mockApi(page);
  await page.goto('/login');
  await page.getByLabel('Tên đăng nhập hoặc email').fill('admin');
  await page.getByLabel('Mật khẩu', {exact: true}).fill('password');
  await page.getByRole('button', {name: 'Đăng nhập', exact: true}).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Khám phá kho sách của bạn'})).toBeVisible();
  await page.getByRole('banner').getByRole('link', {name: 'Vào thư viện'}).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
});
test('mobile reader navigation remains keyboard accessible', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await session(page, 'User'); await mockApi(page);
  await page.goto('/user/books');
  const menu = page.getByRole('button', {name: 'Mở menu'});
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('link', {name: 'Hồ sơ'}).click();
  await expect(page).toHaveURL(/\/user\/profile$/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
});
test('staff sidebar collapses on desktop and opens as a keyboard drawer on phones', async ({page}) => {
  await session(page, 'Admin'); await mockApi(page); await page.goto('/admin/books');
  await expect(page.getByRole('link', {name: 'Sách'})).toBeVisible();
  await page.getByRole('button', {name: 'Thu gọn thanh điều hướng'}).click();
  await expect(page.getByRole('button', {name: 'Mở rộng thanh điều hướng'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', {name: 'Mở rộng thanh điều hướng'})).toBeVisible();
  await page.screenshot({path: 'test-results/layout-admin-desktop.png', fullPage: true});
  await page.setViewportSize({width: 390, height: 844});
  const menu = page.getByRole('button', {name: 'Mở menu'});
  await menu.focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog').getByRole('link', {name: 'Sách'})).toBeVisible();
  await page.screenshot({path: 'test-results/layout-admin-mobile.png', fullPage: true});
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(menu).toBeFocused();
  const table = page.getByRole('region', {name: /Danh sách sách, cuộn ngang/});
  await expect(table).toBeVisible();
  expect(await table.evaluate(node => node.scrollWidth > node.clientWidth && node.getBoundingClientRect().right <= innerWidth)).toBe(true);
  await page.screenshot({path: 'test-results/layout-admin-mobile-table.png', fullPage: true});
});
test('staff dashboard renders remaining list-backed metrics', async ({page}) => {
  await session(page, 'Librarian'); const state = await mockApi(page);
  await page.goto('/admin/dashboard');
  await expect(page.getByText('Phiếu chưa trả')).toBeVisible();
  await expect(page.getByText('Chưa có phiếu mượn còn lưu để vẽ biểu đồ.')).toBeVisible();
  await expect(page.locator('[data-metric-key="book-titles"] svg.lucide-book-open')).toBeVisible();
  await expect(page.locator('[data-metric-key="authors"] svg.lucide-pen-line')).toBeVisible();
  await expect(page.locator('[data-metric-key="members"] svg.lucide-users')).toBeVisible();
  await expect(page.locator('[data-metric-key="unreturned-loans"] svg.lucide-clipboard-list')).toBeVisible();
  await expect(page.locator('[data-metric-key="unreturned-loans"] h3')).toHaveText('0');
  await expect(page.locator('[data-metric-key="available-copies"] h3')).toHaveText('2');
  await expect(page.locator('[data-metric-key="owned-copies"]')).toHaveCount(0);
  await expect(page.locator('[data-metric-key="actual-overdue"]')).toHaveCount(0);
  expect(state.requests.some(([, path]) => path === '/members')).toBe(true);
  expect(state.requests.some(([, path]) => path === '/borrow-records')).toBe(true);
  expect(state.requests.some(([, path]) => path === '/dashboard/metrics')).toBe(false);
});
test('staff dashboard distinguishes failed books from zero records', async ({page}) => {
  await session(page, 'Admin'); await mockApi(page, {failBooks: true});
  await page.goto('/admin/dashboard');
  await expect(page.locator('[data-metric-key="book-titles"] h3')).toHaveText('Không khả dụng');
  await expect(page.locator('[data-metric-key="authors"] h3')).toHaveText('1');
  await expect(page.getByRole('alert')).toBeVisible();
});

test('late return uses backend badge immediately and after reload', async ({page}) => {
  await session(page, 'Admin');
  const overdue = {
    id: 1, bookId: 1, bookTitle: book.title, memberId: 3, memberFullName: 'Độc giả A',
    borrowDate: '2026-10-01T00:00:00Z', expiredDate: '2026-10-10T00:00:00Z',
    returnDate: null, status: 'Đang mượn', isLateReturn: true,
  };
  const state = await mockApi(page, {books: [{...book, quantity: 1}], loans: [overdue]});
  await page.goto('/admin/borrows');
  await expect(page.getByRole('cell', {name: 'Đang mượn', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Trả sách'})).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', {name: 'Trả sách'}).click();
  await expect(page.getByRole('cell', {name: 'Quá hạn', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Trả sách'})).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('cell', {name: 'Quá hạn', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Trả sách'})).toHaveCount(0);
  await page.getByLabel('Trạng thái').selectOption('Quá hạn');
  await expect(page.getByRole('cell', {name: 'Quá hạn', exact: true})).toBeVisible();
  await page.getByRole('link', {name: /Tổng quan/}).click();
  await expect(page.locator('[data-metric-key="unreturned-loans"] h3')).toHaveText('0');
  expect(state.requests.some(([method, path]) => method === 'GET' && path.startsWith('/borrow-records?') &&
    new URLSearchParams(path.split('?')[1]).get('status') === 'Quá hạn')).toBe(true);
});

test('open dashboard and loan list refresh overdue status over time', async ({page}) => {
  await page.clock.install();
  await session(page, 'Admin');
  const loan = {
    id: 1, bookId: 1, bookTitle: book.title, memberId: 3, memberFullName: 'Độc giả A',
    borrowDate: '2026-10-01T00:00:00Z', expiredDate: '2026-11-16T00:00:00Z',
    returnDate: null, status: 'Đang mượn', isLateReturn: false,
  };
  const state = await mockApi(page, {loans: [loan]});
  await page.goto('/admin/borrows');
  await expect(page.getByRole('cell', {name: 'Đang mượn', exact: true})).toBeVisible();
  state.loans[0].status = 'Quá hạn';
  state.loans[0].returnDate = '2026-11-17T00:00:00Z';
  await page.clock.fastForward(60_000);
  await expect(page.getByRole('cell', {name: 'Quá hạn', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Trả sách'})).toHaveCount(0);
});
test('reader dashboard keeps catalog independent from loan summary', async ({page}) => {
  await session(page, 'User'); const state = await mockApi(page, {failBooks: true});
  await page.goto('/user/dashboard');
  await expect(page.getByText('Không khả dụng', {exact: true}).first()).toBeVisible();
  await expect(page.getByRole('link', {name: /Phiếu mượn của tôi/}).getByRole('heading')).toHaveText('0');
  expect(state.requests.some(([, path]) => path === '/reader/loans')).toBe(true);
  expect(state.requests.some(([, path]) => ['/members','/borrow-records'].includes(path))).toBe(false);
});

test('reader loans separate open records from late and on-time returns', async ({page}) => {
  await session(page, 'User');
  await mockApi(page, {readerLoans: {activeLoanCount: 1, loans: [
    {...readerLoan, dueDate: '2026-10-01'},
    {...readerLoan, id: 11, bookTitle: 'Sách trả muộn', returnDate: '2026-11-17T18:00:00Z', status: 'Quá hạn', isCompleted: true},
    {...readerLoan, id: 10, bookTitle: 'Sách trả đúng hạn', returnDate: '2026-11-16T10:00:00Z', status: 'Đã trả', isCompleted: true},
  ]}});
  await page.goto('/user/dashboard');
  const card = page.getByRole('link', {name: /Phiếu mượn của tôi/});
  await expect(card.getByRole('heading')).toHaveText('1');
  await card.click();
  await expect(page.getByRole('cell', {name: book.title})).toBeVisible();
  await expect(page.getByRole('cell', {name: 'Sách trả muộn'})).toHaveCount(0);
  await expect(page.getByText('Liên hệ thủ thư để mượn, trả sách hoặc điều chỉnh hạn trả.')).toBeVisible();
  await page.getByRole('button', {name: 'Lịch sử'}).click();
  await expect(page.getByRole('cell', {name: book.title})).toHaveCount(0);
  await expect(page.getByRole('cell', {name: 'Sách trả muộn'})).toBeVisible();
  await expect(page.getByRole('cell', {name: 'Sách trả đúng hạn'})).toBeVisible();
  await expect(page.getByText('Quá hạn', {exact: true})).toBeVisible();
  await expect(page.getByText('Đã trả', {exact: true})).toBeVisible();
});

test('reader loan error retries without losing catalog; unlinked member is distinct', async ({page}) => {
  await session(page, 'User');
  const state = await mockApi(page, {failReaderLoans: true});
  await page.goto('/user/dashboard');
  await expect(page.getByText('Đầu sách trong danh mục')).toBeVisible();
  await expect(page.getByRole('link', {name: /Phiếu mượn của tôi/}).getByRole('heading')).toHaveText('Không khả dụng');
  state.failReaderLoans = false;
  await page.getByRole('button', {name: 'Thử lại'}).click();
  await expect(page.getByRole('link', {name: /Phiếu mượn của tôi/}).getByRole('heading')).toHaveText('0');
  state.unlinkedReader = true;
  await page.goto('/user/borrows');
  await expect(page.getByRole('alert')).toContainText('Tài khoản chưa có hồ sơ độc giả');
  await expect(page.getByText('Bạn chưa có phiếu đang mượn.')).toHaveCount(0);
});

test('reader profile preserves edits after failure, saves once, and persists after reload', async ({page}) => {
  await session(page, 'User');
  const state = await mockApi(page, {handler: async ({req, pathname, json, state}) => {
    if (req.method() === 'PUT' && pathname === '/reader/profile' && state.failProfileSave) {
      await new Promise(resolve => setTimeout(resolve, 200));
      await json({errors: {FullName: ['Họ tên bị từ chối.']}}, 400);
      return true;
    }
  }});
  await page.goto('/user/profile');
  await expect(page.getByLabel('Họ tên')).toHaveValue('Độc giả A');
  await page.getByLabel('Họ tên').fill('Độc giả Mới');
  await page.getByLabel('Số điện thoại').fill('   ');
  await page.getByRole('button', {name: 'Lưu hồ sơ'}).click();
  await expect(page.getByLabel('Số điện thoại')).toHaveAttribute('aria-invalid', 'true');
  expect(state.requests.filter(([method, path]) => method === 'PUT' && path === '/reader/profile')).toHaveLength(0);
  await page.getByLabel('Số điện thoại').fill('0901234567');
  state.failProfileSave = true;
  await page.getByRole('button', {name: 'Lưu hồ sơ'}).evaluate(button => {button.click(); button.click();});
  await expect(page.getByLabel('Họ tên')).toHaveValue('Độc giả Mới');
  await expect(page.getByLabel('Họ tên')).toHaveAttribute('aria-invalid', 'true');
  expect(state.requests.filter(([method, path]) => method === 'PUT' && path === '/reader/profile')).toHaveLength(1);
  state.failProfileSave = false;
  await page.getByRole('button', {name: 'Lưu hồ sơ'}).click();
  await expect(page.getByText('Đã lưu hồ sơ.')).toBeVisible();
  await expect(page.getByText('Xin chào, Độc giả Mới')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Họ tên')).toHaveValue('Độc giả Mới');
  await expect(page.getByLabel('Số điện thoại')).toHaveValue('0901234567');
});
test('staff dashboard refreshes loan count after borrow and return without reload', async ({page}) => {
  await session(page, 'Librarian'); await mockApi(page);
  await page.goto('/admin/dashboard');
  await expect(page.getByText('Chưa có phiếu mượn còn lưu để vẽ biểu đồ.')).toBeVisible();
  await page.getByRole('link', {name: 'Mượn / Trả'}).click();
  await page.getByRole('button', {name: 'Lập phiếu mượn', exact: true}).click();
  await page.getByLabel('Sách còn bản').selectOption('1');
  await page.getByLabel('Độc giả', {exact: true}).selectOption('3');
  await page.getByLabel('Hạn trả (UTC)').fill('2099-01-01');
  await page.getByRole('dialog').getByRole('button', {name: 'Lập phiếu mượn'}).click();
  await expect(page.getByRole('cell', {name: 'Đang mượn'})).toBeVisible();
  await page.getByRole('link', {name: /Tổng quan/}).click();
  await expect(page.locator('[data-metric-key="unreturned-loans"] h3')).toHaveText('1');
  await expect(page.locator('[data-metric-key="available-copies"] h3')).toHaveText('1');
  await expect(page.getByText('Phiếu mượn còn lưu theo tháng')).toBeVisible();
  await page.getByRole('link', {name: 'Mượn / Trả'}).click();
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', {name: 'Trả sách', exact: true}).click();
  await expect(page.getByRole('cell', {name: 'Đã trả', exact: true})).toBeVisible();
  await page.getByRole('link', {name: /Tổng quan/}).click();
  await expect(page.locator('[data-metric-key="unreturned-loans"] h3')).toHaveText('0');
  await expect(page.locator('[data-metric-key="available-copies"] h3')).toHaveText('2');
});
test('staff dashboard refreshes catalog counts after creating a book', async ({page}) => {
  await session(page, 'Admin'); await mockApi(page);
  await page.goto('/admin/dashboard');
  await expect(page.locator('[data-metric-key="book-titles"] h3')).toHaveText('1');
  await page.getByRole('link', {name: 'Sách'}).click();
  await page.getByRole('button', {name: '+ Thêm sách'}).click();
  await page.getByLabel('Tên sách', {exact: true}).fill('Sách mới');
  await page.getByLabel('Tác giả', {exact: true}).selectOption('1');
  await page.getByLabel('Thể loại', {exact: true}).selectOption('1');
  await page.getByLabel('Số bản hiện còn').fill('3');
  await page.getByRole('button', {name: 'Lưu sách'}).click();
  await expect(page.getByText('Thêm sách thành công.')).toBeVisible();
  await page.getByRole('link', {name: /Tổng quan/}).click();
  await expect(page.locator('[data-metric-key="book-titles"] h3')).toHaveText('2');
  await expect(page.locator('[data-metric-key="available-copies"] h3')).toHaveText('5');
});

test('stock edit refreshes available copies on the dashboard', async ({page}) => {
  await session(page, 'Admin');
  await mockApi(page);
  await page.goto('/admin/dashboard');
  await expect(page.locator('[data-metric-key="available-copies"] h3')).toHaveText('2');
  await page.getByRole('link', {name: 'Sách'}).click();
  await page.getByRole('button', {name: 'Sửa'}).click();
  await page.getByLabel('Số bản hiện còn').fill('4');
  await page.getByRole('button', {name: 'Lưu sách'}).click();
  await expect(page.getByText('Cập nhật sách thành công.')).toBeVisible();
  await page.getByRole('link', {name: /Tổng quan/}).click();
  await expect(page.locator('[data-metric-key="available-copies"] h3')).toHaveText('4');
});
test('unknown role enters explicit unauthorized state from public homepage', async ({page}) => {
  await session(page, 'Unknown'); await mockApi(page); await page.goto('/');
  await expect(page.getByRole('heading', {name: 'Khám phá kho sách của bạn'})).toBeVisible();
  await page.getByRole('link', {name: 'Vào thư viện'}).first().click();
  await expect(page.getByText('403 - Không có quyền truy cập')).toBeVisible();
});
test('table search and modal focus entry/trap/restoration', async ({page}) => {
  await session(page); await mockApi(page); await page.goto('/admin/books');
  await expect(page.getByRole('cell', {name: book.title})).toBeVisible();
  const add = page.getByRole('button', {name: '+ Thêm sách'});
  await add.click();
  const dialog = page.getByRole('dialog');
  await expect(page.getByLabel('Tên sách', {exact: true})).toBeFocused();
  await expect(dialog.getByRole('button', {name: 'Lưu sách'})).toBeEnabled();
  await dialog.getByRole('button', {name: 'Lưu sách'}).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', {name: 'Đóng cửa sổ'})).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('button', {name: 'Lưu sách'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0); await expect(add).toBeFocused();
  await page.getByLabel('Tìm kiếm').fill('không tồn tại');
  await expect(page.getByText('Không tìm thấy sách phù hợp.')).toBeVisible();
});
test('lookup failure has retry and prevents saving invalid relations', async ({page}) => {
  await session(page);
  await mockApi(page, {handler: async ({pathname, json}) => {if (pathname === '/authors') {await json({message: 'internal'}, 500); return true;}}});
  await page.goto('/admin/books'); await page.getByRole('button', {name: '+ Thêm sách'}).click();
  await expect(page.getByRole('dialog').getByRole('button', {name: 'Thử lại'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Lưu sách'})).toBeDisabled();
});
test('successful create closes modal even if background refresh fails', async ({page}) => {
  await session(page); const state = await mockApi(page, {failAfterWrite: true});
  await page.goto('/admin/books'); await page.getByRole('button', {name: '+ Thêm sách'}).click();
  await page.getByLabel('Tên sách', {exact: true}).fill('Sách mới');
  await page.getByLabel('Tác giả', {exact: true}).selectOption('1');
  await page.getByLabel('Thể loại', {exact: true}).selectOption('1');
  await page.getByRole('button', {name: 'Lưu sách'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Thêm sách thành công.')).toBeVisible();
  await expect(page.getByText('Thao tác đã được lưu, nhưng không tải lại được danh sách sách:', {exact: false})).toBeVisible();
  await expect(page.getByText('Sách mới', {exact: true})).toBeVisible();
  await expect(page.getByText('Máy chủ không xử lý được yêu cầu.', {exact: false})).toBeVisible();
  expect(state.requests.filter(([method, p]) => method === 'POST' && p === '/books')).toHaveLength(1);
});

test('admin create, edit, delete refreshes list and preserves search', async ({page}) => {
  await session(page); const state = await mockApi(page);
  await page.goto('/admin/books?q=CRUD');
  await page.getByRole('button', {name: '+ Thêm sách'}).click();
  await page.getByLabel('Tên sách', {exact: true}).fill('CRUD sách tạm');
  await page.getByLabel('Tác giả', {exact: true}).selectOption('1');
  await page.getByLabel('Thể loại', {exact: true}).selectOption('1');
  await page.getByRole('button', {name: 'Lưu sách'}).click();
  await expect(page.getByRole('cell', {name: 'CRUD sách tạm'})).toBeVisible();
  await page.getByRole('button', {name: 'Sửa'}).click();
  await page.getByLabel('Tên sách', {exact: true}).fill('CRUD sách đã sửa');
  await page.getByRole('button', {name: 'Lưu sách'}).click();
  await expect(page.getByRole('cell', {name: 'CRUD sách đã sửa'})).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', {name: 'Xóa'}).click();
  await expect(page.getByRole('cell', {name: 'CRUD sách đã sửa'})).toHaveCount(0);
  await expect(page.getByText('Xóa sách thành công.')).toBeVisible();
  await expect(page).toHaveURL(/q=CRUD/);
  expect(state.requests.filter(([method, path]) => path === '/books' && method === 'GET')).toHaveLength(4);
  expect(state.requests.some(([method, path]) => method === 'DELETE' && path === '/books/2')).toBe(true);
});

test('deleting the last row clamps the current page', async ({page}) => {
  await session(page);
  const books = Array.from({length: 11}, (_, index) => ({...book, id: index + 1, title: `Trang sách ${index + 1}`}));
  await mockApi(page, {books});
  await page.goto('/admin/books?page=2&q=Trang');
  await expect(page.getByRole('cell', {name: 'Trang sách 11'})).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', {name: 'Xóa'}).click();
  await expect(page.getByRole('cell', {name: 'Trang sách 11'})).toHaveCount(0);
  await expect(page.getByRole('cell', {name: 'Trang sách 1', exact: true})).toBeVisible();
  await expect(page.getByLabel('Tìm kiếm')).toHaveValue('Trang');
  await expect(page).toHaveURL(/page=1&q=Trang/);
});

test('delete rejection displays backend message in Vietnamese', async ({page}) => {
  await session(page);
  await mockApi(page, {handler: async ({req, pathname, json}) => {
    if (req.method() === 'DELETE' && pathname === '/books/1') {
      await json({message: 'The DELETE statement conflicted with the REFERENCE constraint "FK_BorrowRecords_Books_BookId".'}, 500);
      return true;
    }
  }});
  await page.goto('/admin/books');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', {name: 'Xóa'}).click();
  await expect(page.getByRole('alert')).toContainText('Không thể xóa sách vì sách đã có phiếu mượn');
  await expect(page.getByRole('cell', {name: book.title})).toBeVisible();
});
test('validation failure preserves input and links server field error', async ({page}) => {
  await session(page);
  await mockApi(page, {handler: async ({req, pathname, json}) => {
    if (req.method() === 'POST' && pathname === '/books') {await json({errors: {Title: ['Tên sách bị từ chối.']}}, 400); return true;}
  }});
  await page.goto('/admin/books'); await page.getByRole('button', {name: '+ Thêm sách'}).click();
  await page.getByLabel('Tên sách', {exact: true}).fill('Tên giữ lại');
  await page.getByLabel('Tác giả', {exact: true}).selectOption('1');
  await page.getByLabel('Thể loại', {exact: true}).selectOption('1');
  await page.getByRole('button', {name: 'Lưu sách'}).click();
  await expect(page.getByLabel('Tên sách', {exact: true})).toHaveValue('Tên giữ lại');
  await expect(page.getByLabel('Tên sách', {exact: true})).toHaveAttribute('aria-invalid', 'true');
});
test('reader detail and personal pages use only reader-scoped endpoints', async ({page}) => {
  await session(page, 'User'); const state = await mockApi(page); await page.goto('/user/books/1');
  await expect(page.getByRole('heading', {name: book.title})).toBeVisible();
  expect(state.requests).toEqual([['GET', '/books/1']]);
  await page.goto('/user/borrows'); await expect(page.getByText('Bạn chưa có phiếu đang mượn.')).toBeVisible();
  await page.goto('/user/profile'); await expect(page.getByLabel('Họ tên')).toHaveValue('Độc giả A');
  expect(state.requests.some(([, p]) => p === '/reader/loans')).toBe(true);
  expect(state.requests.some(([, p]) => p === '/reader/profile')).toBe(true);
  expect(state.requests.some(([, p]) => ['/members','/borrow-records'].includes(p))).toBe(false);
});
test('member routes stay staff-only; reader profile uses own endpoint', async ({page}) => {
  await session(page, 'User');
  const state = await mockApi(page);
  await page.goto('/admin/members');
  await expect(page.getByText('403 - Không có quyền truy cập')).toBeVisible();
  await page.goto('/user/profile');
  await expect(page.getByRole('heading', {name: 'Hồ sơ của tôi'})).toBeVisible();
  await expect(page.getByText('reader@example.test')).toBeVisible();
  await expect(page.getByText('tester', {exact: true})).toBeVisible();
  expect(state.requests.some(([, path]) => path === '/reader/profile')).toBe(true);
  expect(state.requests.some(([, path]) => path.startsWith('/members'))).toBe(false);
});
test('reader loan page stays private across account switch without staff requests', async ({page}) => {
  await session(page, 'User');
  const state = await mockApi(page, {readerLoans: {activeLoanCount: 1, loans: [readerLoan]}, handler: async ({pathname, json, state}) => {
    if (pathname === '/auth/login') {
      state.readerLoans = {activeLoanCount: 0, loans: []};
      await json({...auth('User'), userId: 8, memberId: 4, username: 'other'});
      return true;
    }
  }});
  await page.goto('/user/borrows');
  await expect(page.getByRole('cell', {name: book.title})).toBeVisible();
  await page.getByRole('button', {name: 'Đăng xuất'}).first().click();
  await page.getByLabel('Tên đăng nhập hoặc email').fill('other');
  await page.getByLabel('Mật khẩu', {exact: true}).fill('password');
  await page.getByRole('button', {name: 'Đăng nhập', exact: true}).click();
  await expect(page).toHaveURL(/\/user\/borrows$/);
  await expect(page.getByText('Bạn chưa có phiếu đang mượn.')).toBeVisible();
  await expect(page.getByRole('cell', {name: book.title})).toHaveCount(0);
  expect(state.requests.filter(([, path]) => path === '/reader/loans')).toHaveLength(2);
  expect(state.requests.some(([, path]) => path.startsWith('/borrow-records'))).toBe(false);
});
test('reader catalog filters and pages locally, with a missing detail state', async ({page}) => {
  await session(page, 'User');
  const books = Array.from({length: 12}, (_, index) => ({...book, id: index + 1, title: `Sách ${index + 1}`, categoryId: index < 11 ? 1 : 2, categoryName: index < 11 ? 'Thể loại A' : 'Thể loại B'}));
  const state = await mockApi(page, {books});
  await page.goto('/user/books');
  await expect(page.getByRole('heading', {name: 'Danh mục sách'})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Sách 1', exact: true})).toBeVisible();
  await expect(page.getByRole('img', {name: 'Chưa có bìa cho Sách 1', exact: true})).toBeVisible();
  await page.screenshot({path: 'test-results/layout-reader-desktop.png', fullPage: true});
  await page.setViewportSize({width: 390, height: 844});
  await page.screenshot({path: 'test-results/layout-reader-mobile.png', fullPage: true});
  await page.getByLabel('Thể loại').selectOption('2');
  await expect(page.getByRole('heading', {name: 'Sách 12', exact: true})).toBeVisible();
  await expect(page.getByRole('heading', {name: 'Sách 1', exact: true})).toHaveCount(0);
  await page.getByLabel('Thể loại').selectOption('1');
  await page.getByRole('button', {name: 'Sau'}).click();
  await expect(page.getByRole('heading', {name: 'Sách 11', exact: true})).toBeVisible();
  await page.goto('/user/books/999');
  await expect(page.getByRole('alert').filter({hasText: 'Không tìm thấy sách.'})).toBeVisible();
  expect(state.requests.filter(([, path]) => path === '/books')).toHaveLength(1);
});
test('catalog illustrations load on cards and details; unknown books use a placeholder', async ({page}) => {
  test.setTimeout(60_000);
  await session(page, 'User');
  const catalog = [
    {...book, id: 1, title: 'Doraemon', authorName: 'Fujiko', publishedYear: 1999},
    {...book, id: 2, title: 'Aladin và 40 tên cướp', authorName: 'Trông Anh Ngược', publishedYear: 1970},
    {...book, id: 5, title: 'Conan', authorName: 'Fujiko', publishedYear: 1990},
    {...book, id: 10, title: 'Clean Architecture', authorName: 'Robert C.Martin', publishedYear: 2000},
    {...book, id: 99, title: 'Sách chưa rõ nguồn'},
  ];
  await mockApi(page, {books: catalog, handler: async ({req, pathname, json}) => {
    if (req.method() === 'GET' && pathname === '/books/10') {await json(catalog[3]); return true;}
  }});
  await page.goto('/user/books');
  for (const title of catalog.slice(0, 4).map(item => item.title)) {
    const card = page.getByRole('article').filter({has: page.getByRole('heading', {name: title, exact: true})});
    const image = card.locator('img');
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(node => node.naturalWidth), {timeout: 20_000}).toBeGreaterThan(0);
    await image.evaluate(node => node.decode());
    await expect(card.getByText('Ảnh minh họa', {exact: true})).toBeVisible();
  }
  await expect(page.getByRole('img', {name: 'Chưa có bìa cho Sách chưa rõ nguồn'})).toBeVisible();
  await page.screenshot({path: 'test-results/catalog-covers-grid.png', fullPage: true});
  await page.goto('/user/books/10');
  const detailImage = page.getByRole('img', {name: /Ảnh minh họa cho Clean Architecture/});
  await expect.poll(() => detailImage.evaluate(node => node.naturalWidth), {timeout: 20_000}).toBeGreaterThan(0);
  await detailImage.evaluate(node => node.decode());
  await expect(page.getByText('Ảnh minh họa', {exact: true})).toBeVisible();
  await page.screenshot({path: 'test-results/catalog-covers.png', fullPage: true});
});
test('cover falls back to its own title when image loading fails', async ({page}) => {
  await session(page, 'User');
  await mockApi(page, {books: [{...book, id: 10, title: 'Clean Architecture', authorName: 'Robert C.Martin', publishedYear: 2000}]});
  let imageRequests = 0;
  await page.route('https://covers.openlibrary.org/**', route => {imageRequests++; return route.abort();});
  await page.goto('/user/books');
  await expect(page.getByRole('img', {name: 'Chưa có bìa cho Clean Architecture'})).toBeVisible();
  expect(imageRequests).toBe(1);
});
test('staff can borrow and return; availability and loans refresh; no repeated return action', async ({page}) => {
  await session(page, 'Librarian'); const state = await mockApi(page); await page.goto('/admin/borrows');
  await expect(page.getByRole('link', {name: 'Độc giả'})).toBeVisible();
  await page.getByRole('button', {name: 'Lập phiếu mượn', exact: true}).click();
  await page.getByLabel('Sách còn bản').selectOption('1'); await page.getByLabel('Độc giả', {exact: true}).selectOption('3');
  await page.getByLabel('Hạn trả (UTC)').fill('2099-01-01');
  await page.getByRole('dialog').getByRole('button', {name: 'Lập phiếu mượn'}).click();
  await expect(page.getByRole('cell', {name: 'Đang mượn', exact: true})).toBeVisible();
  expect(state.books[0].quantity).toBe(1);
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', {name: 'Trả sách', exact: true}).click();
  await expect(page.getByRole('cell', {name: 'Đã trả', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Trả sách', exact: true})).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('cell', {name: 'Đã trả', exact: true})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Trả sách', exact: true})).toHaveCount(0);
  expect(state.books[0].quantity).toBe(2);
  await page.getByRole('link', {name: 'Sách'}).click();
  await expect(page.getByRole('cell', {name: '2', exact: true})).toBeVisible();
});
test('zero availability blocks loan creation and 400 conflict retains form', async ({page}) => {
  await session(page);
  const state = await mockApi(page, {books: [{...book, quantity: 0}]});
  await page.goto('/admin/borrows'); await page.getByRole('button', {name: 'Lập phiếu mượn'}).click();
  await expect(page.getByText('Không có sách còn bản để mượn.')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('button', {name: 'Lập phiếu mượn'})).toBeDisabled();
  await page.keyboard.press('Escape');
  state.books[0].quantity = 1;
  state.handler = async ({pathname, json}) => {
    if (pathname === '/borrow-records/borrow') {await json({message: 'Sách đã hết, không thể mượn.'}, 400); return true;}
  };
  await page.reload(); await page.getByRole('button', {name: 'Lập phiếu mượn'}).click();
  await page.getByLabel('Sách còn bản').selectOption('1'); await page.getByLabel('Độc giả', {exact: true}).selectOption('3');
  await page.getByLabel('Hạn trả (UTC)').fill('2099-01-01');
  await page.getByRole('dialog').getByRole('button', {name: 'Lập phiếu mượn'}).click();
  await expect(page.getByRole('dialog').getByText('Sách đã hết, không thể mượn.')).toBeVisible();
  await expect(page.getByLabel('Hạn trả (UTC)')).toHaveValue('2099-01-01');
});
test('staff loan submit is single-flight when stock changes on server', async ({page}) => {
  await session(page, 'Librarian');
  const state = await mockApi(page, {handler: async ({pathname, json}) => {
    if (pathname === '/borrow-records/borrow') {
      await new Promise(resolve => setTimeout(resolve, 250));
      await json({message: 'Sách đã hết, không thể mượn.'}, 400);
      return true;
    }
  }});
  await page.goto('/admin/borrows');
  await page.getByRole('button', {name: 'Lập phiếu mượn', exact: true}).click();
  await page.getByLabel('Sách còn bản').selectOption('1');
  await page.getByLabel('Độc giả', {exact: true}).selectOption('3');
  await page.getByLabel('Hạn trả (UTC)').fill('2099-01-01');
  await page.getByRole('dialog').getByRole('button', {name: 'Lập phiếu mượn'}).evaluate(button => {button.click(); button.click();});
  await expect(page.getByRole('dialog').getByText('Sách đã hết, không thể mượn.')).toBeVisible();
  expect(state.requests.filter(([method, path]) => method === 'POST' && path === '/borrow-records/borrow')).toHaveLength(1);
});
test('logout removes private UI and cache before reader login', async ({page}) => {
  await session(page); const state = await mockApi(page); await page.goto('/admin/members');
  await expect(page.getByRole('cell', {name: 'Độc giả A'})).toBeVisible();
  await page.getByRole('button', {name: 'Đăng xuất'}).click();
  await page.getByLabel('Tên đăng nhập hoặc email').fill('reader'); await page.getByLabel('Mật khẩu', {exact: true}).fill('password');
  await page.getByRole('button', {name: 'Đăng nhập', exact: true}).click();
  await expect(page).toHaveURL(/user\/dashboard$/);
  await expect(page.getByText('Độc giả A', {exact: true})).toHaveCount(0);
  expect(state.requests.filter(([, p]) => p === '/members')).toHaveLength(1);
});
