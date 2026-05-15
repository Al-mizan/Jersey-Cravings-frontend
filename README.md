# Jersey Cravings

Jersey Cravings is a modern e-commerce platform dedicated to football jerseys. It offers a seamless shopping experience with variant-based inventory, secure customer accounts, and manual payment verification flows.

## Live URLs

- **Frontend**: [https://jersey-cravings-frontend.vercel.app/](https://jersey-cravings-frontend.vercel.app/)
- **Backend API**: [https://jersey-cravings-api.onrender.com/](https://jersey-cravings-api.onrender.com/)

## Features

- **Product Catalog**: Explore a wide range of football jerseys with advanced filtering.
- **Variant Management**: Select jerseys based on size, fit (Fan/Player), and sleeve type.
- **Customization**: Personalize your jersey with a custom name and number.
- **Manual Payment Verification**: Securely pay via bKash and verify your Transaction ID manually.
- **Loyalty Program**: Earn and redeem points on every purchase.
- **Referral System**: Invite friends and earn rewards.
- **Admin Governance**: Comprehensive dashboard for managing products, variants, and orders.
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices.

## Technologies Used

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management & Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query)
- **Form Handling**: [TanStack Form](https://tanstack.com/form)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Animations**: [Framer Motion (Motion)](https://www.framer.com/motion/)
- **Runtime**: [Bun](https://bun.sh/)
- **Validation**: [Zod](https://zod.dev/)

## Setup Instructions

### Prerequisites

Ensure you have [Bun](https://bun.sh/) installed on your machine.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Al-mizan/Jersey-Cravings-frontend.git
    cd frontend-jersey-cravings
    ```

2.  **Install dependencies**:
    ```bash
    bun install
    ```

3.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add the following:
    ```env
    NEXT_PUBLIC_API_BASE_URL=your_api_base_url
    ```

4.  **Start the development server**:
    ```bash
    bun dev
    ```

5.  **Build for production**:
    ```bash
    bun run build
    bun run start
    ```

---

*Built with ❤️ by Al-mizan*
