
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { User, LogOut, Power } from 'lucide-react';

interface NavbarProps {
  username: string;
  onLogout: () => void;
  isSystemOn: boolean;
  onSystemToggle: (isOn: boolean) => void;
}

const Navbar = ({ username, onLogout, isSystemOn, onSystemToggle }: NavbarProps) => {
  return (
    <Card className="bg-white shadow-lg border-0 border-b border-slate-200">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
              Monitoring LAS SMAW
            </h1>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2">
              <Power className={`h-5 w-5 ${isSystemOn ? 'text-emerald-600' : 'text-red-500'}`} />
              <Switch
                checked={isSystemOn}
                onCheckedChange={onSystemToggle}
                id="system-toggle"
                className="data-[state=checked]:bg-emerald-600"
              />
              <Label htmlFor="system-toggle" className={`text-sm font-medium ${isSystemOn ? 'text-emerald-700' : 'text-slate-600'}`}>
                {isSystemOn ? 'ONLINE' : 'OFFLINE'}
              </Label>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2">
              <User className="h-5 w-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                Welcome, {username}
              </span>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Navbar;
