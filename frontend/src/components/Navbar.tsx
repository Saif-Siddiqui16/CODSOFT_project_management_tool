import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/hooks/hook";
import type { RootState } from "@/store/store";
import { logout } from "@/store/auth/auth-slice";

export default function Navbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const handleSignout = async () => {
    await dispatch(logout());
  };
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
      </div>
    </nav>
  );
}
