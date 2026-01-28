import { useState } from 'react';
import { CreditCard, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  serviceType: string;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  serviceType,
}: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    onSuccess();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Secure Payment
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Complete payment to confirm your {serviceType} service request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-2">
          {/* Amount Display */}
          <div className="p-3 sm:p-4 bg-primary/5 rounded-lg sm:rounded-xl border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">Service Deposit</span>
              <span className="text-xl sm:text-2xl font-bold text-foreground">${amount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Final amount may vary based on actual work
            </p>
          </div>

          {/* Card Details */}
          <div className="space-y-2.5 sm:space-y-3">
            <div>
              <Label htmlFor="cardNumber" className="text-xs sm:text-sm">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <Label htmlFor="expiry" className="text-xs sm:text-sm">Expiry Date</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="text-xs sm:text-sm">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  type="password"
                  className="mt-1 h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
            <span>Your payment information is encrypted and secure</span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full gradient-accent text-accent-foreground shadow-accent-glow h-11 sm:h-12 text-sm sm:text-base"
            disabled={loading || !cardNumber || !expiry || !cvv}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
