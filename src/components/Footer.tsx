import Container from "./Container";
const Footer = () => {
  return (
    <footer className="mt-12 mb-8">
      <Container className="flex justify-between gap-4">
        <p className="text-sm">
            Invoicing &copy; {new Date().getFullYear()}
        </p>
        <p className="text-sm">
            Created by Abi with Next.js, Clerk and Xata
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
