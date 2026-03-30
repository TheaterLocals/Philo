export const metadata = {
  title: "PHILO",
  description: "あなたの悩みに寄り添う哲学者を探す旅",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
