"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Share2, Users, Mail, MessageCircle, Copy, Check, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ShareContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'sent' | 'registered' | 'declined';
  shareDate?: string;
  registerDate?: string;
}

interface ShareStats {
  totalShared: number;
  successfulReferrals: number;
  pendingInvites: number;
  lastShareDate?: string;
}

export function ShareAppModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'share' | 'contacts' | 'stats'>('share');
  const [shareMethod, setShareMethod] = useState<'email' | 'message' | 'link'>('link');
  const [contacts, setContacts] = useState<ShareContact[]>([
    { id: '1', name: 'Sarah Johnson', email: 'sarah.j@email.com', status: 'sent', shareDate: '2025-01-18' },
    { id: '2', name: 'Mike Chen', email: 'mike.chen@email.com', status: 'registered', shareDate: '2025-01-15', registerDate: '2025-01-17' },
    { id: '3', name: 'Emma Davis', email: 'emma.d@email.com', status: 'pending' },
  ]);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [shareMessage, setShareMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const shareStats: ShareStats = {
    totalShared: contacts.length,
    successfulReferrals: contacts.filter(c => c.status === 'registered').length,
    pendingInvites: contacts.filter(c => c.status === 'pending').length,
    lastShareDate: contacts[0]?.shareDate
  };

  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?ref=${user?.uid || 'anonymous'}`;

  const handleShare = async (method: 'email' | 'message' | 'link') => {
    const message = shareMessage || "I've discovered this amazing AI-powered mystical platform called FutureSeer! It combines ancient wisdom with modern AI to provide personalized divination insights. You should check it out! ✨🔮";

    switch (method) {
      case 'email':
        // Simulate email sharing
        toast({
          title: "Email Shared! 📧",
          description: "Your invitation has been sent via email",
        });
        break;
      case 'message':
        // Simulate SMS sharing
        toast({
          title: "Message Sent! 💬",
          description: "Your invitation has been sent via message",
        });
        break;
      case 'link':
        try {
          await navigator.clipboard.writeText(shareLink);
          setCopied(true);
          toast({
            title: "Link Copied! 📋",
            description: "Share link copied to clipboard",
          });
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          toast({
            title: "Copy Failed",
            description: "Please copy the link manually",
            variant: "destructive"
          });
        }
        break;
    }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Missing Information",
        description: "Please provide both name and email",
        variant: "destructive"
      });
      return;
    }

    const contact: ShareContact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone,
      status: 'pending'
    };

    setContacts([contact, ...contacts]);
    setNewContact({ name: '', email: '', phone: '' });
    
    toast({
      title: "Contact Added! 👥",
      description: `${contact.name} has been added to your share list`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'sent': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'declined': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-sm border-amber-500/20 max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-amber-200 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share FutureSeer
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
            <Button
              variant={activeTab === 'share' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('share')}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant={activeTab === 'contacts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('contacts')}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Contacts ({contacts.length})
            </Button>
            <Button
              variant={activeTab === 'stats' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('stats')}
              className="flex-1"
            >
              <Star className="w-4 h-4 mr-2" />
              Stats
            </Button>
          </div>

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Share Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={shareMethod === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShareMethod('email')}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button
                    variant={shareMethod === 'message' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShareMethod('message')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                  <Button
                    variant={shareMethod === 'link' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShareMethod('link')}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Link
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Custom Message (Optional)
                </label>
                <Textarea
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Add a personal message to your invitation..."
                  className="bg-slate-800/50 border-slate-600 text-gray-300"
                  rows={3}
                />
              </div>

              {shareMethod === 'link' && (
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={shareLink}
                      readOnly
                      className="bg-slate-800/50 border-slate-600 text-gray-300"
                    />
                    <Button
                      onClick={() => handleShare('link')}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleShare(shareMethod)}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share FutureSeer
              </Button>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-amber-200">Add New Contact</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="bg-slate-800/50 border-slate-600 text-gray-300"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="bg-slate-800/50 border-slate-600 text-gray-300"
                  />
                </div>
                <Input
                  placeholder="Phone (optional)"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="bg-slate-800/50 border-slate-600 text-gray-300"
                />
                <Button onClick={addContact} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                  Add Contact
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-amber-200">Your Contacts</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-200">{contact.name}</p>
                        <p className="text-sm text-gray-400">{contact.email}</p>
                      </div>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-2xl font-bold text-blue-200">{shareStats.totalShared}</h4>
                  <p className="text-gray-400 text-sm">Total Shared</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-2xl font-bold text-green-200">{shareStats.successfulReferrals}</h4>
                  <p className="text-gray-400 text-sm">Successful</p>
                </div>
                <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-2xl font-bold text-yellow-200">{shareStats.pendingInvites}</h4>
                  <p className="text-gray-400 text-sm">Pending</p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="font-semibold text-amber-200 mb-2">Recent Activity</h4>
                <p className="text-gray-400 text-sm">
                  Last share: {shareStats.lastShareDate ? 
                    new Date(shareStats.lastShareDate).toLocaleDateString() : 
                    'No recent activity'}
                </p>
                <p className="text-gray-400 text-sm">
                  Success rate: {shareStats.totalShared > 0 ? 
                    Math.round((shareStats.successfulReferrals / shareStats.totalShared) * 100) : 0}%
                </p>
              </div>

              <div className="text-center p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg border border-amber-500/20">
                <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h4 className="text-lg font-semibold text-amber-200 mb-1">Community Builder</h4>
                <p className="text-gray-400 text-sm">You're helping grow our mystical community! ✨</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 