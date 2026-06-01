import { Routes, Route } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { HomePage } from "@/pages/HomePage";
import { PostPage } from "@/pages/PostPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { AboutPage } from "@/pages/AboutPage";
import { ResumePage } from "@/pages/ResumePage";
import { LoginPage } from "@/pages/LoginPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminPosts } from "@/pages/admin/AdminPosts";
import { AdminPostEditor } from "@/pages/admin/AdminPostEditor";
import { AdminProjects } from "@/pages/admin/AdminProjects";
import { AdminProjectEditor } from "@/pages/admin/AdminProjectEditor";
import { AdminAbout } from "@/pages/admin/AdminAbout";
import { AdminResume } from "@/pages/admin/AdminResume";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts/:slug" element={<PostPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/new" element={<AdminPostEditor />} />
        <Route path="posts/:id" element={<AdminPostEditor />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/new" element={<AdminProjectEditor />} />
        <Route path="projects/:id" element={<AdminProjectEditor />} />
        <Route path="about" element={<AdminAbout />} />
        <Route path="resume" element={<AdminResume />} />
      </Route>
    </Routes>
  );
}
