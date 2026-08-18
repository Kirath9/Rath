export const metadata = {
  title: "Rath",
  description: "An AI chat bot",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
