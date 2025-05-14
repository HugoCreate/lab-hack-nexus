
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharePostProps {
  postTitle: string;
  postUrl: string;
}

const SharePost = ({ postTitle, postUrl }: SharePostProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    toast({
      title: 'Link copiado!',
      description: 'O link foi copiado para a área de transferência.'
    });
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareOnLinkedin = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
    window.open(linkedinUrl, '_blank');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full border-cyber-purple/30 hover:bg-cyber-purple/10 flex items-center justify-center"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Post</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <Input
            value={postUrl}
            readOnly
            className="flex-1 bg-cyber-dark/30 border-cyber-purple/30"
          />
          <Button 
            type="button" 
            size="icon" 
            onClick={handleCopyLink}
            className="bg-cyber-purple hover:bg-cyber-purple-dark"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={shareOnTwitter}
            className="rounded-full border-cyber-purple/30 hover:bg-cyber-purple/10"
          >
            <Twitter className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={shareOnFacebook}
            className="rounded-full border-cyber-purple/30 hover:bg-cyber-purple/10"
          >
            <Facebook className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={shareOnLinkedin}
            className="rounded-full border-cyber-purple/30 hover:bg-cyber-purple/10"
          >
            <Linkedin className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePost;
