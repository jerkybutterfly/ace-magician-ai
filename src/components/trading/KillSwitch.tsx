import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Octagon } from 'lucide-react';
import { trading } from '@/lib/trading';
import { toast } from 'sonner';

export function KillSwitch({ onDone }: { onDone: () => void }) {
  const flatten = async () => {
    try {
      const { closed } = await trading.closeAll();
      toast.success(`Flattened ${closed} positions, strategies disabled.`);
      onDone();
    } catch (e) {
      toast.error(`Kill switch failed: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Octagon className="h-4 w-4" />
          Kill Switch
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Flatten everything?</AlertDialogTitle>
          <AlertDialogDescription>
            Cancels all open orders, closes all positions at market, and disables every running strategy. Use only in emergencies.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={flatten} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Yes, flatten now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
