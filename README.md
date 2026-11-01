# Shalom Logistics

Shalom Logistics is a responsive website for a Kenyan moving and logistics company. It presents home relocation, office moves, goods transport, CCTV installation, water filter installation, and cleaning services.

## Access the Website

The deployed production website is available at:

**[https://shalom-logistics.vercel.app/](https://shalom-logistics.vercel.app/)**

The website includes:

- Home relocation information
- Office relocation information
- Goods transport information
- CCTV installation information
- Water filter solutions
- Cleaning services
- About and company information
- Image gallery content
- Quote and contact calls to action
- Customer testimonials
- Frequently asked questions
- Phone, email, WhatsApp, Facebook, Instagram, and TikTok contact links

## Technology Stack

### Frontend

- [Next.js](https://nextjs.org/) `16.2.10` using the App Router
- [React](https://react.dev/) `19.2.4`
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Framer Motion](https://motion.dev/) for animations and motion effects
- [Lucide React](https://lucide.dev/) for interface icons
- Next Image for optimized local images
- `next/font` with Geist and Geist Mono fonts

### Backend

This repository does not contain a separate Express, NestJS, Django, or standalone backend server. The backend functionality is implemented inside the Next.js application using a server-side API route:

```text
src/app/api/upload-url/route.js
```

The API route generates a temporary, signed AWS S3 URL for video uploads. The browser requests an upload URL from the Next.js API, then uploads the selected video directly to Amazon S3. AWS secret credentials are used only by the server-side route and must never be exposed to the browser.

### Storage and External Services

- [Amazon S3](https://aws.amazon.com/s3/) stores uploaded videos.
- AWS SDK packages create S3 upload commands and presigned URLs.
- [Vercel](https://vercel.com/) hosts the production Next.js deployment.
- Git and GitHub provide source control and the deployment source repository.
- Supabase is listed as a project dependency, but no active Supabase client, database query, authentication flow, or Supabase API route is currently wired into the application.

## Frontend Structure

The main page is assembled from reusable React components:

```text
src/
├── app/
│   ├── api/upload-url/route.js  # Server-side S3 presigned URL endpoint
│   ├── test-upload/page.jsx     # S3 video upload test page
│   ├── globals.css              # Global styles and Tailwind-related styles
│   ├── layout.tsx               # Root layout, metadata, navbar, and WhatsApp button
│   └── page.tsx                 # Home page composition
├── components/
│   ├── home/                    # Hero, services, about, FAQ, testimonials, and CTA sections
│   ├── layout/                  # Navbar, mobile menu, footer, logo, and WhatsApp button
│   └── who-we-are/              # Supporting motion utilities
├── lib/
│   └── constants.ts             # Business details, navigation, social links, and brand colors
└── types/
    └── index.ts                 # Shared TypeScript types
```

The static site media is stored in:

```text
public/images/
```

Images and other files in `public` can be referenced from the application with paths such as `/images/SHALOM.png`.

## Application Pages and Components

The home page currently renders these sections:

1. `Hero` for the primary message and quote/call actions.
2. `ServicesMarqueeSection` for the featured services.
3. `AboutUsSection` for the company introduction.
4. `WhyChooseUs` for the company value proposition.
5. `Testimonials` for customer experiences and statistics.
6. `FaqSection` for common moving questions.
7. `CtaBanner` for the quote call to action.
8. `Footer` for navigation, contact information, social links, and subscription UI.

The shared root layout provides the site metadata, top navigation, responsive mobile navigation, global styles, and floating WhatsApp contact button.

Navigation constants include links for `/`, `/services`, `/about`, `/gallery`, `/quote`, and `/contact`. If a page is added for one of these paths, it can be placed in the corresponding directory under `src/app`.

## Business Configuration

Business information and social links are centralized in `src/lib/constants.ts`:

- Business name: Shalom Logistics
- Tagline: `We settle you in.`
- Phone numbers: `0751-794728` and `0745-980198`
- Email: `info@shalommovers.co.ke`
- Address: Nairobi, Kenya
- Social profiles: Facebook, Instagram, TikTok, and WhatsApp

Brand colors are also defined there using jungle green and gold values. Update that file when business contact details, navigation labels, social links, or brand colors change.

## Prerequisites

Install the following before starting local development:

- [Node.js](https://nodejs.org/) with npm
- Git
- An AWS account and S3 bucket if the upload test or upload API is required locally

Check the installed versions:

```bash
node --version
npm --version
git --version
```

## Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/Lollita-Ndanu/Shalom-Logistics.git
cd Shalom-Logistics
npm install
```

The committed `package-lock.json` should be used with npm so that dependency versions remain reproducible.

## Environment Variables

Create a local `.env.local` file in the project root if you need to use the S3 upload API:

```dotenv
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
S3_BUCKET_NAME=your-s3-bucket-name
```

The variables are read by `src/app/api/upload-url/route.js`:

- `AWS_REGION` identifies the AWS region containing the bucket.
- `AWS_ACCESS_KEY_ID` identifies the AWS IAM user or role credentials used by the server.
- `AWS_SECRET_ACCESS_KEY` authenticates the AWS credentials.
- `S3_BUCKET_NAME` identifies the destination bucket.

Do not use real credentials in the README, source code, screenshots, commits, or pull requests. `.env`, `.env.local`, and other local environment files are ignored by Git.

## Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

Next.js reloads the application when source files change. The main page can be edited in `src/app/page.tsx`, while individual sections are maintained in `src/components/home` and `src/components/layout`.

## Available Scripts

```bash
npm run dev
```

Starts the Next.js development server.

```bash
npm run lint
```

Runs ESLint using the Next.js Core Web Vitals and TypeScript configurations.

```bash
npm run build
```

Creates an optimized production build and checks that the application can be built for deployment.

```bash
npm run start
```

Starts the previously generated production build. Run `npm run build` first.

## S3 Video Upload Test

The repository includes a test page at:

```text
/test-upload
```

With the development server running, open [http://localhost:3000/test-upload](http://localhost:3000/test-upload), then:

1. Select a video file.
2. Select **Upload Video**.
3. The page requests `/api/upload-url` with the file name and MIME type.
4. The server creates a key under the `videos/` prefix and returns a presigned S3 URL.
5. The browser uploads the video directly to S3 using an HTTP `PUT` request.

The API accepts these query parameters:

```text
GET /api/upload-url?file=example.mp4&type=video/mp4
```

The generated URL expires after 60 seconds. The S3 bucket must allow browser uploads from the local development origin and the deployed Vercel origin through its CORS configuration. If the upload fails after a URL is returned, check the bucket CORS rules, bucket permissions, region, MIME type, and AWS credentials.

### Upload Security

`/test-upload` is a test interface and the upload route currently does not include user authentication or authorization. Before using it as a public production administration tool, add access control, file validation, size limits, rate limiting, and any required malware or content checks. Do not expose AWS secret credentials in client-side code.

## Vercel Deployment

The production application is deployed on Vercel at [https://shalom-logistics.vercel.app/](https://shalom-logistics.vercel.app/).

### Deploy through the Vercel Dashboard

1. Sign in to [Vercel](https://vercel.com/).
2. Select **Add New Project**.
3. Import the GitHub repository `Lollita-Ndanu/Shalom-Logistics`.
4. Select the branch to deploy, normally `main`.
5. Confirm that Vercel detects the project as a Next.js application.
6. Keep the project root as the repository root.
7. Add the AWS environment variables under the project settings if S3 uploads are needed:
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET_NAME`
8. Deploy the project.

Vercel creates preview deployments for eligible branch or pull request changes and a production deployment when the configured production branch is updated. Environment variables must be configured separately for the environments where they are needed.

### Deploy with the Vercel CLI

Install and authenticate with the Vercel CLI if you prefer command-line deployment:

```bash
npm install --global vercel
vercel login
vercel
```

For a production deployment:

```bash
vercel --prod
```

The Vercel dashboard is still the recommended place to review deployment logs, domains, environment variables, and build settings.

## Git and GitHub Workflow

The source repository is:

```text
https://github.com/Lollita-Ndanu/Shalom-Logistics.git
```

Useful Git commands:

```bash
git status
git pull origin main
git switch -c feature/describe-your-change
git add README.md
git commit -m "docs: update project README"
git push -u origin feature/describe-your-change
```

For a direct update to the main branch, when that is permitted by the repository settings:

```bash
git switch main
git pull origin main
git add .
git commit -m "describe the change"
git push origin main
```

Recommended workflow:

1. Pull the latest changes before starting work.
2. Create a descriptive feature branch for application changes.
3. Run `npm run lint` and `npm run build` before committing.
4. Review `git diff` and confirm no secrets or generated files are included.
5. Commit only the intended files.
6. Push the branch to GitHub and open a pull request when review is required.
7. Merge the approved change into the Vercel production branch.
8. Confirm the Vercel deployment and test the live website.

## Files Excluded from Git

The `.gitignore` file excludes local and generated files including:

- `node_modules/`
- `.next/`
- `out/`
- build output
- environment files such as `.env` and `.env.local`
- private key files ending in `.pem`
- debug logs
- TypeScript build information files

Do not force-add ignored files containing credentials or generated build output.

## Verification Checklist

Before pushing a change:

```bash
npm run lint
npm run build
git diff --check
git status
```

For upload-related changes, also verify:

- The required AWS variables exist in the local or Vercel environment.
- The S3 bucket name and AWS region are correct.
- S3 CORS allows the current browser origin and `PUT` requests.
- The upload URL is not exposed in logs or shared publicly.
- The test page reports a successful upload.

## Useful References

- [Live Shalom Logistics website](https://shalom-logistics.vercel.app/)
- [GitHub repository](https://github.com/Lollita-Ndanu/Shalom-Logistics)
- [Next.js documentation](https://nextjs.org/docs)
- [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying)
- [React documentation](https://react.dev/)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [Vercel documentation](https://vercel.com/docs)
- [AWS S3 documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript documentation](https://docs.aws.amazon.com/sdk-for-javascript/)

## Maintainer

**Lollita Ndanu**
Email: [lollindanu@gmail.com](mailto:lollindanu@gmail.com)
