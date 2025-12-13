import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import '@testing-library/jest-dom';

// window.alert을 mock 처리
beforeAll(() => {
  window.alert = jest.fn();
});

// fetch API를 모의(mock)합니다.
beforeEach(() => {
  window.alert.mockClear();
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/api/recommend-movie')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          emotion: '기쁨',
          reason: '오늘의 기쁨을 두 배로 만들어 줄 유쾌하고 즐거운 영화들을 추천합니다!',
          movies: [
            { id: 1, title: '추천 영화 1', overview: '추천 영화 1 줄거리', poster_path: '/path1.jpg' },
            { id: 2, title: '추천 영화 2', overview: '추천 영화 2 줄거리', poster_path: '/path2.jpg' },
          ],
        }),
      });
    }
    if (url.includes('/api/search-movies')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          results: [
            { id: 3, title: '검색 영화 1', overview: '검색 영화 1 줄거리', poster_path: '/path3.jpg' },
          ],
        }),
      });
    }
    if (url.includes('/api/movie-details/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          title: '상세 영화',
          overview: '상세 영화 줄거리',
          poster_path: '/pathDetail.jpg',
          release_date: '2023-01-01',
          vote_average: 8.0,
          vote_count: 1000,
          runtime: 120,
          genres: [{ id: 1, name: '액션' }],
          credits: {
            crew: [{ job: 'Director', name: '감독' }],
            cast: [{ name: '배우1' }, { name: '배우2' }, { name: '배우3' }],
          },
        }),
      });
    }
    return Promise.resolve({ ok: false });
  });
});

test('renders main elements', () => {
  render(<App />);
  expect(screen.getByText('오늘의 일기, 오늘의 영화')).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/영화 제목으로 검색/)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/오늘 하루는 어땠나요/)).toBeInTheDocument();
});

test('handles diary input and movie recommendation', async () => {
  render(<App />);
  const diaryInput = screen.getByPlaceholderText(/오늘 하루는 어땠나요/);
  await userEvent.type(diaryInput, '오늘은 정말 기쁜 하루였다!');
  const recButton = screen.getByRole('button', { name: /영화 추천받기/ });
  await userEvent.click(recButton);

  const heading = await screen.findByRole('heading', { level: 2, name: /오늘 당신의 하루는/ });
  expect(heading).toBeInTheDocument();
  expect(within(heading).getByText(/기쁨/)).toBeInTheDocument();

  expect(await screen.findByText('추천 영화 1')).toBeInTheDocument();
  expect(await screen.findByText('추천 영화 2')).toBeInTheDocument();
});

test('handles movie search', async () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/영화 제목으로 검색/);
  await userEvent.type(searchInput, '테스트 영화');
  const searchButton = screen.getByRole('button', { name: /검색/ });
  await userEvent.click(searchButton);

  expect(await screen.findByText('검색 영화 1')).toBeInTheDocument();
});

test('opens and closes movie detail modal', async () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/영화 제목으로 검색/);
  await userEvent.type(searchInput, '테스트 영화');
  const searchButton = screen.getByRole('button', { name: /검색/ });
  await userEvent.click(searchButton);

  expect(await screen.findByText('검색 영화 1')).toBeInTheDocument();
  await userEvent.click(screen.getByText('검색 영화 1'));

  const modalTitle = await screen.findByRole('heading', { level: 2, name: /상세 영화/ });
  expect(modalTitle).toBeInTheDocument();
  expect(await screen.findByText(/감독:/)).toBeInTheDocument();

  const closeButton = screen.getByRole('button', { name: '×' });
  await userEvent.click(closeButton);

  await waitFor(() => {
    expect(screen.queryByRole('heading', { level: 2, name: /상세 영화/ })).not.toBeInTheDocument();
  });
});
