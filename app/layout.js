export const metadata = {
  title: "Office spaces and gear",
  description: "Book meeting rooms and shared equipment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F7F5F0", color: "#1C2330" }}>
        {children}
      </body>
    </html>
  );
}
