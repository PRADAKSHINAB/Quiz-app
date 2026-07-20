import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/scroll-to-top";
import Create from "./pages/Create.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Progress from "./pages/Progress.jsx";
import QuizSharedShareIdPage from "./pages/QuizSharedShareIdPage.jsx";
import QuizIdPageEdit from "./pages/QuizIdPageEdit.jsx";
import QuizIdPage from "./pages/QuizIdPage.jsx";
import Signup from "./pages/Signup.jsx";
import Topics from "./pages/Topics.jsx";
import TopicsSlugPage from "./pages/TopicsSlugPage.jsx";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <BrowserRouter>
        <Routes>
          <Route path="/create" element={<Create />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/quiz/shared/:shareId" element={<QuizSharedShareIdPage />} />
          <Route path="/quiz/:id/edit" element={<QuizIdPageEdit />} />
          <Route path="/quiz/:id" element={<QuizIdPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/:slug" element={<TopicsSlugPage />} />
        </Routes>
        <Toaster />
        <ScrollToTop />
      </BrowserRouter>
    </ThemeProvider>
  );
}
