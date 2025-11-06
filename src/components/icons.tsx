import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
    </svg>
  ),
  google: (props: SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Google</title>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.66 1.67-3.86 0-6.99-3.16-6.99-7.02s3.13-7.02 6.99-7.02c2.2 0 3.28.84 4.1 1.62l2.33-2.33C18.47.89 16.02 0 12.48 0 5.86 0 .02 5.82.02 12.51s5.84 12.51 12.46 12.51c3.29 0 5.76-1.12 7.68-3.05 1.96-1.96 2.56-4.57 2.56-7.85 0-.76-.07-1.48-.2-2.18h-9.98Z"
      />
    </svg>
  )
};
