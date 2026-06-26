export const metadata = {
  title: "HSO Block 10 — Office Meeting Room and Inventory Booking",
  description: "Book meeting rooms and shared equipment at HSO Block 10",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', system-ui, sans-serif", background: "#EDEAE2", color: "#23262B" }}>
        {children}
      </body>
    </html>
  );
}
