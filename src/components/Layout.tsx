import React from "react";
import Header from "./Header";
import Footer from "./Footer";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex flex-col gap-20 container-custom">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
