import { query } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const BC_AGENT_BANKS = new Set([
  "State Bank of India",
  "Bank of Baroda",
  "Punjab National Bank",
  "UCO Bank",
  "Baroda Gujarat Gramin Bank",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeText(value) {
  return String(value || "").trim();
}

function toAbsoluteAssetUrl(req, value) {
  if (!value || /^https?:\/\//i.test(value)) {
    return value;
  }

  const protocol = req.get("x-forwarded-proto") || req.protocol;
  const baseUrl = `${protocol}://${req.get("host")}`;
  return value.startsWith("/") ? `${baseUrl}${value}` : value;
}

export const listBlogCategories = asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT id, name, slug
    FROM blog_categories
    WHERE is_active = 1
    ORDER BY display_order ASC, id ASC
  `);
  res.json({ data: rows });
});

export const listBlogs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  let sql = `
    SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image_url, b.tag,
           b.category_id, bc.name AS category_name, bc.slug AS category_slug,
           b.published_at
    FROM blogs b
    LEFT JOIN blog_categories bc ON bc.id = b.category_id
    WHERE b.status = 'published'
  `;
  const params = {};

  if (category) {
    sql += " AND bc.slug = :category";
    params.category = category;
  }

  sql += " ORDER BY COALESCE(b.published_at, b.created_at) DESC, b.id DESC";
  const rows = await query(sql, params);
  res.json({ data: rows });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT b.id, b.title, b.slug, b.excerpt, b.content, b.cover_image_url, b.tag,
             b.category_id, bc.name AS category_name, bc.slug AS category_slug,
             b.published_at
      FROM blogs b
      LEFT JOIN blog_categories bc ON bc.id = b.category_id
      WHERE b.slug = :slug AND b.status = 'published'
      LIMIT 1
    `,
    { slug: req.params.slug }
  );

  if (!rows.length) {
    throw httpError(404, "Blog not found");
  }

  const blog = rows[0];
  blog.cover_image_url = toAbsoluteAssetUrl(req, blog.cover_image_url);

  res.json({ data: blog });
});

export const listTeamMembers = asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT id, name, role, bio, photo_url, linkedin_url, display_order, experience_years
    FROM team_members
    WHERE is_active = 1
    ORDER BY display_order ASC, id ASC
  `);

  res.json({
    data: rows.map((row) => ({
      ...row,
      photo_url: toAbsoluteAssetUrl(req, row.photo_url),
    })),
  });
});

export const listPartners = asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT id, name, logo_url, website_url, display_order
    FROM partners
    WHERE is_active = 1
    ORDER BY display_order ASC, id ASC
  `);

  res.json({
    data: rows.map((row) => ({
      ...row,
      logo_url: toAbsoluteAssetUrl(req, row.logo_url),
    })),
  });
});

export const listDistricts = asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT id, state, district
    FROM districts
    WHERE status IS NULL OR status = 1
    ORDER BY state ASC, district ASC
  `);

  res.json({
    data: rows
      .filter((row) => row.state && row.district)
      .map((row) => ({
        id: row.id,
        state: row.state,
        district: row.district,
      })),
  });
});

export const createContactSubmission = asyncHandler(async (req, res) => {
  const {
    name = "",
    email = "",
    phone = "",
    subject = "",
    message = "",
  } = req.body;

  const data = {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    subject: subject.trim(),
    message: message.trim(),
  };

  if (!data.name || !data.email || !data.phone || !data.subject || !data.message) {
    throw httpError(400, "Name, email, phone, subject and message are required");
  }

  const result = await query(
    `
      INSERT INTO contact_submissions (name, email, phone, subject, message)
      VALUES (:name, :email, :phone, :subject, :message)
    `,
    data
  );

  res.status(201).json({ data: { id: result.insertId } });
});

export const listJobs = asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT id, title, department, location, experience_required, image_url, created_at
    FROM jobs
    WHERE status = 'active'
    ORDER BY created_at DESC
  `);
  res.json({
    data: rows.map((row) => ({
      ...row,
      image_url: toAbsoluteAssetUrl(req, row.image_url),
    })),
  });
});

export const getJobById = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT id, title, department, description, location, experience_required, image_url, created_at
      FROM jobs
      WHERE id = :id AND status = 'active'
      LIMIT 1
    `,
    { id: req.params.id }
  );

  if (!rows.length) {
    throw httpError(404, "Job not found");
  }

  const job = rows[0];
  job.image_url = toAbsoluteAssetUrl(req, job.image_url);

  res.json({ data: job });
});

export const createJobApplication = asyncHandler(async (req, res) => {
  const {
    job_id,
    full_name,
    email,
    phone,
    current_location,
    experience_years,
    current_ctc,
    expected_ctc,
    notice_period,
    linkedin_url,
    portfolio_url,
    cover_letter,
  } = req.body;

  const resumeFile = req.file;

  if (!job_id || !full_name || !email || !phone || !resumeFile) {
    throw httpError(400, "Required fields are missing");
  }

  // Check if the user has already applied for this job with the same email
  const existingApps = await query(
    `SELECT id FROM job_applications WHERE job_id = :job_id AND email = :email LIMIT 1`,
    { job_id, email: email.trim().toLowerCase() }
  );

  if (existingApps.length > 0) {
    throw httpError(400, "You have already applied for this position with this email address.");
  }

  // Store the relative path to the resume
  const resume_url = `/assets/uploads/resumes/${resumeFile.filename}`;

  const result = await query(
    `
      INSERT INTO job_applications 
      (job_id, full_name, email, phone, current_location, experience_years, current_ctc, expected_ctc, notice_period, linkedin_url, portfolio_url, resume_url, cover_letter)
      VALUES 
      (:job_id, :full_name, :email, :phone, :current_location, :experience_years, :current_ctc, :expected_ctc, :notice_period, :linkedin_url, :portfolio_url, :resume_url, :cover_letter)
    `,
    {
      job_id,
      full_name,
      email,
      phone,
      current_location,
      experience_years: experience_years || null,
      current_ctc: current_ctc || null,
      expected_ctc: expected_ctc || null,
      notice_period: notice_period || null,
      linkedin_url: linkedin_url || null,
      portfolio_url: portfolio_url || null,
      resume_url,
      cover_letter: cover_letter || null,
    }
  );

  res.status(201).json({ data: { id: result.insertId } });
});

export const createBcAgentApplication = asyncHandler(async (req, res) => {
  const {
    full_name = "",
    phone = "",
    email = "",
    pan_number = "",
    aadhar_number = "",
    bank_name = "",
    state = "",
    district = "",
    city = "",
    pincode = "",
    address = "",
  } = req.body;

  const data = {
    full_name: normalizeText(full_name),
    phone: onlyDigits(phone),
    email: normalizeText(email).toLowerCase(),
    pan_number: normalizeText(pan_number).toUpperCase(),
    aadhar_number: onlyDigits(aadhar_number),
    bank_name: normalizeText(bank_name),
    state: normalizeText(state),
    district: normalizeText(district),
    city: normalizeText(city),
    pincode: onlyDigits(pincode),
    address: normalizeText(address),
    occupation: null,
    experience: null,
    message: null,
  };

  if (
    !data.full_name ||
    !data.phone ||
    !data.email ||
    !data.pan_number ||
    !data.aadhar_number ||
    !data.bank_name ||
    !data.state ||
    !data.district ||
    !data.city ||
    !data.pincode ||
    !data.address
  ) {
    throw httpError(400, "All BC agent form fields are required");
  }

  if (data.full_name.length < 2) {
    throw httpError(400, "Enter a valid full name");
  }

  if (data.phone.length !== 10) {
    throw httpError(400, "Enter a valid 10-digit mobile number");
  }

  if (!EMAIL_PATTERN.test(data.email)) {
    throw httpError(400, "Enter a valid email address");
  }

  if (!PAN_PATTERN.test(data.pan_number)) {
    throw httpError(400, "Enter a valid PAN number");
  }

  if (data.aadhar_number.length !== 12 || /^(\d)\1{11}$/.test(data.aadhar_number)) {
    throw httpError(400, "Enter a valid 12-digit Aadhar number");
  }

  if (!BC_AGENT_BANKS.has(data.bank_name)) {
    throw httpError(400, "Select a valid bank");
  }

  const districtRows = await query(
    `
      SELECT id
      FROM districts
      WHERE state = :state
        AND district = :district
        AND (status IS NULL OR status = 1)
      LIMIT 1
    `,
    { state: data.state, district: data.district }
  );

  if (!districtRows.length) {
    throw httpError(400, "Select a valid state and district");
  }

  if (data.pincode.length !== 6) {
    throw httpError(400, "Enter a valid 6-digit pincode");
  }

  if (data.district.length < 2 || data.city.length < 2 || data.address.length < 8) {
    throw httpError(400, "Enter valid district, area and address details");
  }

  const result = await query(
    `
      INSERT INTO bc_agent_applications
        (
          full_name,
          phone,
          email,
          pan_number,
          aadhar_number,
          bank_name,
          state,
          district,
          city,
          pincode,
          address,
          occupation,
          experience,
          message
        )
      VALUES
        (
          :full_name,
          :phone,
          :email,
          :pan_number,
          :aadhar_number,
          :bank_name,
          :state,
          :district,
          :city,
          :pincode,
          :address,
          :occupation,
          :experience,
          :message
        )
    `,
    data
  );

  res.status(201).json({ data: { id: result.insertId } });
});
