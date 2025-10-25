import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/hooks/hook";
import { logout, resetVerificationMessage } from "@/store/auth/auth-slice";
import type { RootState } from "@/store/store";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const [showMessage, setShowMessage] = useState<string | null>(null);

  const handleSignout = async () => {
    const resultAction = await dispatch(logout());
    if (logout.fulfilled.match(resultAction)) {
      setShowMessage(resultAction.payload as string);
    }
  };

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(null);
        dispatch(resetVerificationMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showMessage, dispatch]);

  return (
    <nav className="w-full border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          Home
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              {user === null && (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/login"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Login
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/register"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Register
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {user && (
            <>
              <Link
                to="/workspace"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Workspace
              </Link>

              <Button
                onClick={handleSignout}
                className="bg-gray-800 text-white"
              >
                Sign out
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-4 p-6">
              <Link
                to="/workspace"
                className="text-lg text-gray-700 hover:text-gray-900 transition-colors"
              >
                Workspace
              </Link>
              {user === null && (
                <Link
                  to="/login"
                  className="text-lg text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
              )}
              <Link
                to="/register"
                className="text-lg text-gray-700 hover:text-gray-900 transition-colors"
              >
                Register
              </Link>
              <Button
                onClick={handleSignout}
                variant="destructive"
                className="mt-4 w-full"
              >
                Sign out
              </Button>
            </SheetContent>
          </Sheet>
        </div>

        {showMessage && (
          <div className="absolute top-16 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-md">
            {showMessage}
          </div>
        )}
      </div>
    </nav>
  );
}
