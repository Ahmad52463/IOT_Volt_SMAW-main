import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plug, UserCircle, LogOut } from 'lucide-react';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
  isSystemOn?: boolean;
  onSystemToggle?: (isOn: boolean) => void;
}

const Header = ({ username, onLogout, isSystemOn, onSystemToggle }: HeaderProps) => {
  return (
    <div className="sticky top-0 z-50">
      <Card className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 shadow-xl border-0 rounded-none">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-lg">
                  <img src="/poltek.png" alt="Logo" className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Monitoring LAS SMAW
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              {/* System Controls */}
              {onSystemToggle && (
                <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2">
                  <Plug className={`h-5 w-5 ${isSystemOn ? 'text-emerald-400' : 'text-red-400'}`} />
                  <Switch
                    checked={isSystemOn}
                    onCheckedChange={onSystemToggle}
                    id="system-toggle"
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label
                    htmlFor="system-toggle"
                    className={`text-sm font-medium ${isSystemOn ? 'text-emerald-300' : 'text-slate-300'}`}
                  >
                    {isSystemOn ? 'ONLINE' : 'OFFLINE'}
                  </Label>
                </div>
              )}

              {/* User Controls */}
              {username && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-2">
                    <UserCircle className="h-5 w-5 text-blue-200" />
                    <span className="text-sm font-medium text-white">
                      Welcome, {username}
                    </span>
                  </div>
                  {onLogout && (
                    <Button
                      onClick={onLogout}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-slate-400 hover:bg-slate-700 text-white hover:text-white bg-transparent"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Header;
  