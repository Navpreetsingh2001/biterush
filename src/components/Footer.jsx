
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-muted text-muted-foreground py-4 mt-auto">
      <div className="container mx-auto text-center text-sm px-4">
        &copy; {currentYear} Campus Grub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
