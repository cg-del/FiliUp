import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link to="/" className="text-2xl font-bold text-primary">
              FiliUp
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your one-stop solution for finding Filipino service providers and professionals in your area.
            </p>
          </div>
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              Services
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/services/household" className="text-sm text-muted-foreground hover:text-primary">
                  Household Services
                </Link>
              </li>
              <li>
                <Link to="/services/professional" className="text-sm text-muted-foreground hover:text-primary">
                  Professional Services
                </Link>
              </li>
              <li>
                <Link to="/services/personal" className="text-sm text-muted-foreground hover:text-primary">
                  Personal Care
                </Link>
              </li>
              <li>
                <Link to="/services/events" className="text-sm text-muted-foreground hover:text-primary">
                  Events & Entertainment
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm text-muted-foreground hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-sm text-muted-foreground hover:text-primary">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} FiliUp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 