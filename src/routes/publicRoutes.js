import { Router } from "express";
import {
  createBcAgentApplication,
  createContactSubmission,
  getBlogBySlug,
  listBlogCategories,
  listDistricts,
  listBlogs,
  listPartners,
  listTeamMembers,
} from "../controllers/publicController.js";

const router = Router();

router.get("/blog-categories", listBlogCategories);
router.get("/blogs", listBlogs);
router.get("/blogs/:slug", getBlogBySlug);
router.get("/team-members", listTeamMembers);
router.get("/partners", listPartners);
router.get("/districts", listDistricts);
router.post("/contact-submissions", createContactSubmission);
router.post("/bc-agent-applications", createBcAgentApplication);

export default router;
