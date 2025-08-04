import { Card } from '@/components/ui/card';

const Footer = () => {
  return (
    <Card className="bg-slate-900 border-0 mt-8 shadow-none">
      <div className="py-4 flex justify-center items-center">
        <span className="text-sm text-slate-300 text-center">
          © 2025 SMAW Monitoring System
        </span>
      </div>
    </Card>
  );
};

export default Footer;
