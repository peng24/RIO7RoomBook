import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import BookingCalendar from './pages/BookingCalendar';
import BookRoom from './pages/BookRoom';
import MeetingRooms from './pages/MeetingRooms';
import AdminDashboard from './pages/AdminDashboard';
import AllBookings from './pages/AllBookings';
import ManageRooms from './pages/ManageRooms';
import ExportExcel from './pages/ExportExcel';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <GoogleAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<BookingCalendar />} />
              <Route path="book" element={<BookRoom />} />
              <Route path="rooms" element={<MeetingRooms />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/bookings" element={<AllBookings />} />
              <Route path="admin/rooms" element={<ManageRooms />} />
              <Route path="admin/export" element={<ExportExcel />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GoogleAuthProvider>
    </ThemeProvider>
  );
}

export default App;
