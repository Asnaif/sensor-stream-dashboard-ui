
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { User, LogOut, Moon, Sun, LayoutGrid, List, Settings } from "lucide-react";
import AuthModal from "./AuthModal";
import UserPreferencesModal from "./UserPreferencesModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChartPreference } from "@/types";

interface HeaderProps {
  onLoadPreference: (preference: ChartPreference) => void;
}

const Header = ({ onLoadPreference }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { preferences, toggleTheme, toggleViewMode } = usePreferences();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">IoT Sensor Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={preferences.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {preferences.theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleViewMode}
            title={preferences.viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {preferences.viewMode === 'grid' ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
          </Button>

          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreferencesModal(true)}
                title="User preferences"
              >
                <Settings className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span>{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user?.name || user?.username}</p>
                    {user?.email && <p className="text-muted-foreground">{user.email}</p>}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowPreferencesModal(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferences</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" onClick={() => setShowAuthModal(true)}>
              <User className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <UserPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onLoadPreference={onLoadPreference}
      />
    </header>
  );
};

export default Header;
